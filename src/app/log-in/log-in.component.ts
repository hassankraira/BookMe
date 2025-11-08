import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatabaseService } from './../services/database.service';
import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [HttpClientModule,FormsModule,RouterLink,NgIf],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogINComponent implements OnInit {
  constructor(private db:DatabaseService,private router:Router){}
  isUserLogin=false;
  user={
    email:"",
    password:""
  }
  loginError: string | null = null;
  ngOnInit(): void {
    window.scrollTo(0,0)
  }
  logIN() {
    this.loginError = null;
    this.db.loginUser(this.user).subscribe({
      next: (res: any) => {
        console.log('Login successful', JSON.stringify(res));
        localStorage.setItem('user', JSON.stringify(res.user));
        this.isUserLogin = true;
  
        const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/MyAccount';
        localStorage.removeItem('redirectAfterLogin');
        this.router.navigateByUrl(redirectUrl);
      },
      error: (err) => {
        this.loginError = "Wrong Email or Password";
      }
    });
  }
  
 
}
