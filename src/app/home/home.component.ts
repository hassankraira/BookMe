import { FormsModule } from '@angular/forms';
import { DatabaseService } from './../services/database.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ServicesComponent } from "../services/services.component";
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule,RouterLink, FormsModule, ServicesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
constructor(private db:DatabaseService){}
  ngOnInit(): void {
    window.scrollTo(0,0)
  }



}
