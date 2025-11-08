import { DatabaseService } from './../services/database.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Component, HostListener } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink,HttpClientModule,NgFor],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  categories:any[]=[]
  constructor(private db:DatabaseService){}
ngOnInit(){
  this.loadingCategores()
}
loadingCategores(){
  this.db.getCategories().subscribe(data=>{
      const categories = data.map(item => ({
        id: item[0],
        Name: item[1],   
        image:item[2]
      }));   
       this.categories=categories.slice(0,3)

   
  }
    )}




subscribe(email: string) {
  // You can later hook this to Firebase, Mailchimp, etc.
  console.log('Subscribed email:', email);
  alert('Thank you for subscribing!');
}
}
