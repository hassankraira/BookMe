import flatpickr from 'flatpickr';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor, NgStyle, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   
import { HttpClientModule } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { DatabaseService } from './../services/database.service';

@Component({
  selector: 'app-serv',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    RouterLink,
    NgStyle,
    FormsModule,      
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './serv.component.html',
  styleUrl: './serv.component.css'
})
export class ServComponent implements OnInit {
  service: string = '';
  category: string = '';
  thisService: any;
  moreServices: any[] = [];

  user = JSON.parse(localStorage.getItem('user') || '{}');
  Name = this.user.firstName + ' ' + this.user.lastName;
  @ViewChild('appointmentDateInput', { static: false }) dateInput!: ElementRef;

  // ✅ booking object for ngModel
  booking = {
    name: this.Name || '',
    email: this.user.email || '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  };

  daysOrder = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  timeSlots: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private db: DatabaseService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    window.scrollTo(0,0);
    this.booking.notes=""
    this.booking.appointmentDate=''
    this.booking.appointmentTime=''
    this.route.paramMap.subscribe(parms => {
      this.service = parms.get('service') || '';
      this.category = parms.get('category') || '';
      const idParam = parms.get('id'); 
      const serviceId = idParam ? Number(idParam) : null;
      this.titleService.setTitle(this.service);
  
      this.db.getServices(this.category).subscribe(data => {
        const matched = data.find(serv =>
          serv[1] === this.service && serv[0] === serviceId
        );
      
        if (matched) {
          this.thisService = {
            id: matched[0],
            name: matched[1],
            description: matched[2],
            provider_id: matched[3],
            provider: matched[4],
            phone: "+2" + matched[5],
            category: matched[6],
            imageUrl: matched[7],
            START_TIME: matched[8],
            END_TIME: matched[9],
            SESSION_LENGTH: matched[10],
            DAYS_OFF: matched[11] ? matched[11].split(',') : []
          };
          
          // ✅ أهم شيء: تهيئة flatpickr بعد أن يكون العنصر موجودًا
          setTimeout(() => this.initFlatpickr(), 0);
      
          this.moreServices = data.filter(s => s[0] !== this.thisService.id).slice(0,6);
        } else {
          this.thisService = null;
          this.moreServices = data;
        }
      });
      
    });
  }

  ngAfterViewInit() {
    
   
  }
  initFlatpickr() {
    if (!this.dateInput || !this.thisService) return;
  
    const disabledDays = this.thisService.DAYS_OFF.map((day: string) =>
      this.daysOrder.indexOf(day.trim())
    );
  
    flatpickr(this.dateInput.nativeElement, {
      minDate: "today",
      disable: [(date) => disabledDays.includes(date.getDay())],
      dateFormat: "Y-m-d",
      onChange: (selectedDates) => {
        if (selectedDates.length > 0) {
          this.booking.appointmentDate = selectedDates[0].toISOString().split('T')[0];
          this.onDateChange();
        }
      }
    });
  }
  
  
  onDateChange() {
    if (!this.booking.appointmentDate) return;
  
    this.db.getBookedTimes(this.thisService.id, this.booking.appointmentDate)
      .subscribe(res => {
        const bookedTimes = res.bookedTimes;
  
        let slots = this.generateTimeSlots(
          this.thisService.START_TIME,
          this.thisService.END_TIME,
          Number(this.thisService.SESSION_LENGTH)
        );
  
        const today = new Date();
        const selectedDate = new Date(this.booking.appointmentDate);
  
        if (
          selectedDate.getFullYear() === today.getFullYear() &&
          selectedDate.getMonth() === today.getMonth() &&
          selectedDate.getDate() === today.getDate()
        ) {
          const currentTime = today.getHours() * 60 + today.getMinutes();
          slots = slots.filter(slot => {
            const [h, m] = slot.split(":").map(Number);
            const slotMinutes = h * 60 + m;
            return slotMinutes >= currentTime;
          });
        }
  
        this.timeSlots = slots.filter(slot => !bookedTimes.includes(slot));
  
        console.log("الأوقات المحجوزة:", bookedTimes);
        console.log("الأوقات المتاحة:", this.timeSlots);
      });
  }
  
  bookAppointment(): void {
    if (this.booking.appointmentDate && this.booking.appointmentTime && this.booking.name && this.booking.email) {
      const userId = this.user?.id || 1; // fallback if no ID in user object
  
      const payload = {
        user_id: userId,
        service_id: this.thisService.id,
        provider_id:this.thisService.provider_id,
        appointment_date: this.booking.appointmentDate, // must be 'YYYY-MM-DD'
        appointment_time: this.booking.appointmentTime, // 'HH:MM'
        duration_minutes: this.thisService.SESSION_LENGTH || null,
        notes: this.booking.notes || null
      };
  
      this.db.addAppointment(payload).subscribe({
        next: (res) => {
          this.booking.notes=""
          this.booking.appointmentDate=''
          this.booking.appointmentTime=''
          console.log('Booking response:', res);
          alert(`Your appointment with ${this.thisService.name} is booked! (ID: ${res.appointmentId})`);
        },
        error: (err) => {
          console.error('Booking error:', err);
          alert('Failed to book appointment. Please try again later.');
        }
      });
  
    } else {
      alert('Please fill in all required fields.');
    }
  }
  

  choseOne(): void {
    window.scrollTo(0,0);
    this.booking.notes=""
    this.booking.appointmentDate=''
    this.booking.appointmentTime=''
  }

  generateTimeSlots(start: string, end: string, stepMinutes: number): string[] {
    const slots: string[] = [];
    let [startHour, startMinute] = start.split(":").map(Number);
    let [endHour, endMinute] = end.split(":").map(Number);
  
    let current = new Date();
    current.setHours(startHour, startMinute, 0, 0);
  
    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);
  
    while (current <= endTime) {
      let hh = current.getHours().toString().padStart(2, '0');
      let mm = current.getMinutes().toString().padStart(2, '0');
      slots.push(`${hh}:${mm}`);
      current.setMinutes(current.getMinutes() + stepMinutes);
    }
    return slots;
  }
}
