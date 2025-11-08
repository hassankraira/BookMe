import { HttpClientModule } from '@angular/common/http';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { DatabaseService } from './../services/database.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-become-provider',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgIf, NgFor, FormsModule],
  templateUrl: './become-provider.component.html',
  styleUrls: ['./become-provider.component.css']
})
export class BecomeProviderComponent {
  user = JSON.parse(localStorage.getItem('user') || 'null');
  showForm = false;

  payment = {
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  };

  constructor(private db: DatabaseService, private router: Router) {}

  toggleForm() {
    this.showForm = !this.showForm;
  }

  submitPayment() {
    if (!this.payment.cardName || !this.payment.cardNumber || !this.payment.expiry || !this.payment.cvv) {
      alert('الرجاء تعبئة جميع الحقول');
      return;
    }

    // Simulate payment success
    alert('✅ تم الدفع بنجاح!');
    this.subscribeAsProvider();
  }

  subscribeAsProvider() {
    if (this.user?.id) {
      this.db.subscribeAsProvider(this.user.id).subscribe({
        next: () => {
          alert('تم تفعيل اشتراكك كمقدم خدمة لمدة شهر');
          this.user.type = 'provider';
          this.user.subscription_active = true;
          localStorage.setItem('user', JSON.stringify(this.user));
          this.router.navigate(['/Provide']);
        },
        error: (err) => {
          console.error(err);
          alert('حدث خطأ أثناء الاشتراك');
        }
      });
    } else {
      alert('يجب تسجيل الدخول أولًا');
    }
  }
}
