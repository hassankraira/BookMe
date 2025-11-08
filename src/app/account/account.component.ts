import { DatabaseService } from './../services/database.service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { RouterLink,Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink,NgIf,FormsModule,NgClass],
  templateUrl:'./account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit {
  constructor(private router : Router,private db:DatabaseService){}
  ngOnInit(): void {
    window.scrollTo(0,0)
  }
  user = JSON.parse(localStorage.getItem('user') || '{}');
   
  user2 = JSON.parse(localStorage.getItem('user') || '{}');;

  actvieSection:string=''

  toggleSection(section:string){
    this.actvieSection=section

  }
  

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
  



  removesub(){
    this.db.removeSubsicribtion(this.user.id).subscribe({
      next:()=>{
        this.user.type = 'customer'; 
        this.user.subscription_active = false;

        // تخزين المستخدم المحدث
        localStorage.setItem('user', JSON.stringify(this.user));      }
    })
  }

  passwordError = '';
  passwordSuccess = '';

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  changePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
  
    this.db.changePassword({
      id: this.user.id,
      oldPassword: this.passwordData.oldPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe(
      (res) => this.passwordSuccess='password changed successfully',
      (err) => this.passwordError='old password incorrect'
    );
  }
  updateuser() {
    const formData = new FormData();
    formData.append('id', this.user.id);
    formData.append('firstName', this.user.firstName);
    formData.append('lastName', this.user.lastName);
    formData.append('phone', this.user.phone);
    formData.append('oldImage', this.user.image); // 👈 أرسل الصورة القديمة
  
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
  
    this.db.updateUserINFO(formData).subscribe({
      next: (response: any) => {
        if (response.image) {
          this.user.image = response.image; // 👈 تحديث رابط الصورة الجديد
        }
        localStorage.setItem('user', JSON.stringify(this.user));
        this.user2 = { ...this.user };
        alert('Your data has been updated successfully.');
      },
      error: (err) => {
        console.error('Error while updating:', err);
        alert('Error while updating');
      }
    });
  }

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.size <= 1024 * 1024) {
      this.selectedFile = file;
  
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.user.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      alert("يجب ألا تتجاوز الصورة 1 ميغابايت");
      this.selectedFile = null;
      this.imagePreview = null;
    }
  }


}
