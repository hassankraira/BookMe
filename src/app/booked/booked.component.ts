import { HttpClientModule } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { DatabaseService } from './../services/database.service';
import { Component, OnInit } from '@angular/core';
import { LoadingComponent } from "../loading/loading.component";

@Component({
  selector: 'app-booked',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgFor, NgIf, LoadingComponent],
  templateUrl: './booked.component.html',
  styleUrl: './booked.component.css'
})
export class BookedComponent implements OnInit {
  bookedServices: any[] = [];
  upcomingBookings: any[] = [];
  previousBookings: any[] = [];
  activeTab: 'upcoming' | 'previous' = 'upcoming';

  user = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(private db: DatabaseService) {}

  ngOnInit(): void {
    this.db.getApointmentForUser(this.user.id).subscribe((data: any[]) => {
      this.bookedServices = data;
      const now = new Date();
      this.upcomingBookings = data
        .filter(b => {
          // دمج التاريخ + الوقت في Date واحد
          const dateTime = new Date(b.APPOINTMENT_DATE);
          const [hours, minutes] = b.APPOINTMENT_TIME.split(':').map(Number);
          dateTime.setHours(hours, minutes, 0, 0);

          return dateTime >= now; 
        })
        .sort((a, b) => {
          const aDate = new Date(a.APPOINTMENT_DATE);
          const bDate = new Date(b.APPOINTMENT_DATE);
          const [ah, am] = a.APPOINTMENT_TIME.split(':').map(Number);
          const [bh, bm] = b.APPOINTMENT_TIME.split(':').map(Number);
          aDate.setHours(ah, am, 0, 0);
          bDate.setHours(bh, bm, 0, 0);
          return aDate.getTime() - bDate.getTime();
        });

      this.previousBookings = data
        .filter(b => {
          const dateTime = new Date(b.APPOINTMENT_DATE);
          const [hours, minutes] = b.APPOINTMENT_TIME.split(':').map(Number);
          dateTime.setHours(hours, minutes, 0, 0);

          return dateTime < now; // يظهر في Previous إذا الموعد مر وقته
        })
        .sort((a, b) => {
          const aDate = new Date(a.APPOINTMENT_DATE);
          const bDate = new Date(b.APPOINTMENT_DATE);
          const [ah, am] = a.APPOINTMENT_TIME.split(':').map(Number);
          const [bh, bm] = b.APPOINTMENT_TIME.split(':').map(Number);
          aDate.setHours(ah, am, 0, 0);
          bDate.setHours(bh, bm, 0, 0);
          return bDate.getTime() - aDate.getTime();
        });
    });
  }
}
