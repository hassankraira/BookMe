import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories() {
    return this.http.get<any[]>(`${this.apiUrl}/Categorys`);
  }

  searchCategories(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/search?q=${encodeURIComponent(term)}`);
  }

  loginUser(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  signupUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }): Observable<any> {
    const filteredData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filteredData[key] = value;
      }
    });
    return this.http.post(`${this.apiUrl}/signup`, filteredData);
  }

  updateUserINFO(formData: FormData) {
    return this.http.post(`${this.apiUrl}/updateUser`, formData);
  }

  changePassword(data: any) {
    return this.http.post(`${this.apiUrl}/change_password`, data);
  }

  subscribeAsProvider(userId: number) {
    return this.http.post(`${this.apiUrl}/subscribe-provider`, { userId });
  }

  becomeProvider(userId: string) {
    return this.http.post(`${this.apiUrl}/users/become-provider`, { userId });
  }

  checkUserSubscription(userId: number) {
    return this.http.get(`${this.apiUrl}/check-subscription/${userId}`);
  }

  removeSubsicribtion(userId: string) {
    return this.http.post(`${this.apiUrl}/remove-subscribe/`, { userId });
  }

  getServices(cat: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/service/${cat}`);
  }

  addService(serviceData: any) {
    return this.http.post(`${this.apiUrl}/services/add`, serviceData);
  }

  getservicesForProvider() {
    return this.http.get<any[]>(`${this.apiUrl}/service`);
  }

  RemoveService(data: { ID: number }) {
    return this.http.post(`${this.apiUrl}/remove-service`, data);
  }

  uploadServiceWithImage(formData: FormData) {
    return this.http.post(`${this.apiUrl}/services/upload`, formData);
  }

  uploadServiceChangesWithImage(formData: FormData) {
    return this.http.post(`${this.apiUrl}/services/upload-update`, formData);
  }

  addAppointment(payload: {
    user_id: any;
    service_id: any;
    provider_id: any;
    appointment_date: any;
    appointment_time: any;
    duration_minutes?: any;
    notes?: any;
  }) {
    return this.http.post<any>(`${this.apiUrl}/appointments`, payload);
  }

  getApointmentForUser(UserId: any) {
    return this.http.get<any[]>(`${this.apiUrl}/GetAppointments/${UserId}`);
  }
  getAppointmentsForProvider(providerId: any) {
    return this.http.get<any[]>(`${this.apiUrl}/GetAppointmentsForProvider/${providerId}`);
  }
  
  getBookedTimes(serviceId: number, date: string) {
    return this.http.get<{ bookedTimes: string[] }>(
      `${this.apiUrl}/GetBookedTimes/${serviceId}/${date}`
    );
  }
}
