import { RouterLink, Router } from '@angular/router';
import { OnInit, HostListener } from '@angular/core';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-provide',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink, FormsModule],
  templateUrl: './provide.component.html',
  styleUrl: './provide.component.css'
})
export class ProvideComponent implements OnInit {
  user = JSON.parse(localStorage.getItem('user') || '{}');
  showForm = false;
  message = ''
  disabled = false
  image = 'assets/service-bg.png'
  constructor(private router: Router, private db: DatabaseService) { }

  category: any[] = [];
  catName: any;
  service = {
    service_name: '',
    description: '',
    category: '',
    start_time: '',
    end_time: '',
    session_length: '',
    img_url: '',
    days_off: [] as string[]
  };
  days = [
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
  ];
  showSidebarItems = true;


  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }



  toggleSidebarItems() {
    this.showSidebarItems = !this.showSidebarItems;
  }
  userServices: any[] = [];
  thisUserServices: any[] = [];
  currentTab: 'list' | 'add' | 'edit' | 'remove' | 'BookedApointment' = 'list';
  setTab(tab: 'list' | 'add' | 'edit' | 'remove'| 'BookedApointment') {
    this.currentTab = tab;
    this.serviceToEdit = []
    this.showSidebarItems = false;
    localStorage.setItem('providerCurrentTab', tab); // ✅ أضف هذا السطر

    window.scrollTo(0, 0)


  }
  test: any[] = []
  activeTab: 'upcoming' | 'past' = 'upcoming';
upcomingBookings: any[] = [];
previousBookings: any[] = [];

appointments: any[] = [];
  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];

  provider = JSON.parse(localStorage.getItem('user') || '{}');

  ngOnInit() { 
    const savedTab = localStorage.getItem('providerCurrentTab');
    if (savedTab) {
      this.currentTab = savedTab as any;
    }
    this.db.getAppointmentsForProvider(this.provider.id).subscribe((data: any[]) => {
      this.appointments = data;
      const now = new Date();

      this.upcomingAppointments = data.filter(b => {
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

      this.pastAppointments = data.filter(b => {
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
  
   
    
    window.scrollTo(0, 0)

    this.db.getservicesForProvider().subscribe(data => {
      this.userServices = data.map(item => ({
        ID: item[0],
        SERVICE_NAME: item[1],
        DESCRIPTION: item[2],
        PROVIDER_ID: item[3],
        PROVIDER_NAME: item[4], // تأكد ده فعلاً الاسم
        PROVIDER_NUMBER: item[5],
        CATEGORY: item[6],
        IMG_URL: item[7],
        start_time: item[8],
        end_time: item[9],
        session_length: item[10],
        days_off:item[11]


      }));
      this.thisUserServices = this.userServices.filter(item => item.PROVIDER_ID === this.user.id);
      console.log(this.thisUserServices)

    });

    this.db.getCategories().subscribe(data => {
      this.category = data.map(item => ({
        id: item[0],
        Name: item[1],
        img: item[2]
      }));
      this.catName = this.category.map(i => i.Name);

    });
  }
  toggleForm() {
    this.showForm = !this.showForm;
  }
  changeTab(tab: 'list' | 'add' | 'edit' | 'remove' | 'BookedApointment') {
    this.currentTab = tab;
    localStorage.setItem('providerCurrentTab', tab);
  }
  submitService() {
    const formData = new FormData();
    formData.append('service_name', this.service.service_name);
    formData.append('description', this.service.description);
    formData.append('category', this.service.category);
    formData.append('days_off', this.service.days_off.join(',')); 
    formData.append('start_time', this.service.start_time);
    formData.append('end_time', this.service.end_time);
    formData.append('session_length', this.service.session_length);
    formData.append('provider_id', this.user.id);
    formData.append('provider_name', this.user.firstName + ' ' + this.user.lastName);
    formData.append('provider_number', this.user.phone);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else {
      formData.append('img_url', 'assets/bookme.png');
    }

    // Validation
    if (
      !this.service.service_name ||
      !this.service.category ||
      !this.service.start_time ||
      !this.service.end_time ||
      !this.service.session_length
    ) {
      this.message = '⚠️ All fields are required';
      return;
    }

    this.db.uploadServiceWithImage(formData).subscribe({
      next: () => {
        this.message = '✅ Service Added Successfully';
        this.disabled = true;
        this.resetForm();
        this.ngOnInit();
      },
      error: (err: any) => alert('خطأ أثناء الإرسال: ' + err.message)
    });
  }

  resetForm() {
    this.service = {
      service_name: '',
      description: '',
      category: '',
      start_time: '',
      end_time: '',
      session_length: '',
      img_url: '',
      days_off:[]
    };
    this.selectedFile = null;
    this.imagePreview = null;
  }


  submitserviceChanges() {
    const formData = new FormData();
  
    formData.append('id', this.serviceToEdit[0].id.toString()); // 👈 لازم toString()
    formData.append('service_name', this.serviceToEdit[0].service_name || '');
    formData.append('description', this.serviceToEdit[0].description || '');
    formData.append('category', this.serviceToEdit[0].category || '');
    formData.append('days_off', this.serviceToEdit[0].days_off.join(',')); 
    formData.append('start_time', this.serviceToEdit[0].start_time || '');
    formData.append('end_time', this.serviceToEdit[0].end_time || '');
    formData.append('session_length', this.serviceToEdit[0].session_length?.toString() || '0');
    formData.append('provider_id', this.user.id.toString());
    formData.append('provider_name', this.user.firstName + ' ' + this.user.lastName);
    formData.append('provider_number', this.user.phone);
  
    if (this.selectedFile2) {
      formData.append('image', this.selectedFile2);
      formData.append('oldImageUrl', this.serviceToEdit[0].IMG_URL);
    } else {
      formData.append('oldImageUrl', this.serviceToEdit[0].IMG_URL);
    }
  
    // Validation
    if (
      !formData.get('service_name') ||
      !formData.get('category') ||
      !formData.get('start_time') ||
      !formData.get('end_time') ||
      !formData.get('session_length')
    ) {
      this.message = '⚠️ All fields are required';
      return;
    }
  
    this.db.uploadServiceChangesWithImage(formData).subscribe({
      next: () => {
        this.message = '✅ Service Edited Successfully';
        this.disabled = true;
        this.serviceToEdit = [];
        this.selectedFile2 = null;
        this.ngOnInit();
      },
      error: (err: any) => alert('خطأ أثناء الإرسال: ' + err.message)
    });
  }
  


  ok(num?: number) {
    this.disabled = false
    this.message = ''
  }


  searchTerm: any = '';
  searchResults: any[] = [];


  onSearchChange(term: string) {
    if (term && term.trim() !== '') {

      this.searchResults = this.thisUserServices.filter(item => JSON.stringify(item.SERVICE_NAME).toLowerCase().includes(term.toLowerCase()))
    } else {
      this.searchResults = [];

    }
  }


  editThisService = 0
  serviceToEdit: any[] = []
  chosenservice(id: number) {
    this.currentTab = 'edit';
    this.editThisService = id;
    this.searchTerm = '';
  
    const selected = this.thisUserServices.find(item => item.ID == id);
  
    if (selected) {
      this.serviceToEdit = [{
        id: selected.ID,
        service_name: selected.SERVICE_NAME,
        description: selected.DESCRIPTION,
        category: selected.CATEGORY,
        days_off: selected.days_off ? selected.days_off.split(',') : [], // 👈 FIXED
        start_time: selected.start_time,
        end_time: selected.end_time,
        session_length: selected.session_length,
        IMG_URL: selected.IMG_URL
      }];
    }
  
    console.log(this.serviceToEdit[0]);
  }
  
  



  remove(id: number, name: string) {
    this.db.RemoveService({ ID: id }).subscribe({
      next: () => {
        this.message = 'Service ' + name + ' removed successfully'
        this.thisUserServices = this.thisUserServices.filter(item => item.ID !== id)
        this.searchResults = this.searchResults.filter(item => item.ID !== id)
        this.searchTerm = ''

      }, error: (err) => {

        console.error('Error while Removing:', err);
        alert('Error while Removing');
      }
    })
    console.log(id)
  }


  selectedFile2: File | null = null;
  imagePreview2: string | ArrayBuffer | null = null;

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.size <= 1024 * 1024) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.service.img_url = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      alert("يجب ألا تتجاوز الصورة 1 ميغابايت");
      this.selectedFile = null;
      this.imagePreview = null;
    }
  }


  onFileSelected2(event: any) {
    const file = event.target.files[0];
    if (file && file.size <= 1024 * 1024) {
      this.selectedFile2 = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview2 = reader.result;
        this.serviceToEdit[0].img_url = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      alert("يجب ألا تتجاوز الصورة 1 ميغابايت");
      this.selectedFile = null;
      this.imagePreview2 = null;
    }

  }

  daysDropdownOpen = false;

  // --- افتح/اغلق dropdown ---
  toggleDaysDropdown() {
    this.daysDropdownOpen = !this.daysDropdownOpen;
  }

  // أغلق لما تضغط برة
  @HostListener('document:click', ['$event'])
  onDocumentClick(evt: Event) {
    const target = evt.target as HTMLElement;
    if (!target.closest('.form-select-multi')) {
      this.daysDropdownOpen = false;
    }
  }

  // تبديل اليوم داخل المصفوفة
  toggleDayOff(day: string, event?: Event) {
    event?.stopPropagation();
    const idx = this.service.days_off.indexOf(day);
    if (idx === -1) {
      this.service.days_off.push(day);
    } else {
      this.service.days_off.splice(idx, 1);
    }
  }
  toggleDayOff2(day: string, event?: Event) {
    event?.stopPropagation();
    const idx = this.serviceToEdit[0].days_off.indexOf(day);
    if (idx === -1) {
      this.serviceToEdit[0].days_off.push(day);
    } else {
      this.serviceToEdit[0].days_off.splice(idx, 1);
    }
  }
  
}




