import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { DatabaseService } from './../services/database.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-singup',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterLink,NgIf],
  templateUrl: './singup.component.html',
  styleUrl: './singup.component.css'
})
export class SingupComponent {
  user = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    password: ''
  };

  enteredOTP = '';
  otpSent = false;
  otpVerified = false;
  otpInvalid = false;
  loginError = '';
  successMessage = '';
  step = 1;

  resendAllowed = false;
  resendTimer = 60;
  resendInterval: any;
  sendingOTP = false;

  confirmPassword = '';

  constructor(
    private databaseService: DatabaseService,
    private http: HttpClient,
    private router: Router
  ) {}

  sendOTP() {
    if (this.sendingOTP || this.otpSent) return;
  
    if (this.user.email !== '' && this.user.firstName !== '') {
      this.sendingOTP = true;
  
      this.http.post<{ exists: boolean }>('http://13.60.185.130:3000/check-email', {
        email: this.user.email
      }).subscribe({
        next: (res) => {
          if (res.exists) {
            this.loginError = 'This email is already registered';
            this.successMessage = '';
            this.sendingOTP = false;
          } else {
            this.http.post('http://13.60.185.130:3000/send-otp', {
              email: this.user.email
            }).subscribe({
              next: () => {
                this.otpSent = true;
                this.successMessage = 'OTP sent';
                this.loginError = '';
                this.step = 2;
                this.sendingOTP = false;
                this.startResendTimer();
              },
              error: () => {
                alert('Email not valied');
                this.sendingOTP = false;
              }
            });
          }
        },
        error: () => {
          this.loginError = 'Error checking email';
          this.successMessage = '';
          this.sendingOTP = false;
        }
      });
    } else {
      this.loginError = 'Enter all fields';
    }
  }
  

  startResendTimer() {
    this.resendAllowed = false;
    this.resendTimer = 60;

    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }

    this.resendInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer === 0) {
        this.resendAllowed = true;
        clearInterval(this.resendInterval);
      }
    }, 1000);
  }

  verifyOTP() {
    this.http.post<any>('http://13.60.185.130:3000/verify-otp', {
      email: this.user.email,
      otp: this.enteredOTP
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage=''
          this.otpVerified = true;
          this.otpInvalid = false;
          this.step = 3;
        } else {
          this.otpVerified = false;
          this.otpInvalid = true;
          this.step = 2;
        }
      },
      error: () => this.loginError = 'Wrong OTP !!'
    });
  }

submitAttempt = false;

get passwordMismatch(): boolean {
  return this.user.password !== this.confirmPassword;
}

get passwordValid(): boolean {
  const password = this.user.password || '';
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return password.length >= 8 && hasUppercase && hasSpecialChar;
}



  register() {
    if (!this.otpVerified) return alert('Please verify your email first');
    this.submitAttempt = true;

    if (this.passwordMismatch) {
      this.loginError = 'Password and confirmation do not match';
      return;
    }

    else if (!this.passwordValid) {
      this.loginError = 'Password must be at least 8 characters long, include one uppercase letter and one special character.';
      return;
    }

   else if (!this.otpVerified) {
      this.loginError = 'Please verify your email first.';
      return;
    }
else{
    this.loginError = '';
    this.databaseService.signupUser(this.user).subscribe({
      next: () => {
        this.successMessage = 'Register Successfully';
        alert('Register Successfully');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('خطأ في التسجيل:', err);
        this.loginError = 'Email already exists';
        this.successMessage = '';
      }
    });
  }
  }

resendOTP() {
  this.otpVerified = false;  
  this.otpSent = false;      
  this.sendOTP();
}
}
