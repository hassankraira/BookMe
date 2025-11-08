import { finalize } from 'rxjs';
import { LoadingService } from './../loading.service';
import { Title } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgIf, NgFor, NgStyle, AsyncPipe } from '@angular/common';
import { DatabaseService } from './../services/database.service';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { LoadingComponent } from "../loading/loading.component";
interface Service {
  ID: number;
  SERVICE_NAME: string;
  DESCRIPTION: string;
  PROVIDER_ID: number;
  PROVIDER_NAME: string;
  PROVIDER_NUMBER: string;
  CATEGORY: string;
  IMG_URL: string;
  DAYS_OFF:any,
  START_TIME:string;
  END_TIME:string;
  SESSION_LENGHT:number;
}
@Component({
  selector: 'app-services-by-category',
  standalone: true,
  imports: [NgIf, NgFor, NgStyle, RouterLink, HttpClientModule, LoadingComponent,AsyncPipe],
  templateUrl: './services-by-category.component.html',
  styleUrl: './services-by-category.component.css'
})



export class ServicesByCategoryComponent {
  category: string = '';
  services: Service[] = [];
  categories:any[]=[]
  categoiesImage='assets/bookme.png'
  constructor(private route: ActivatedRoute, private db: DatabaseService,private titleService: Title,public LoadingService:LoadingService) {}

  ngOnInit(): void {

    window.scrollTo(0, 0);
    this.route.paramMap.subscribe(params => {

      this.category = params.get('category') || '';
      this.loadCategoryData();
    });
    this.titleService.setTitle(this.category)

  }
  loadCategoryData(): void {
    window.scrollTo(0, 0);

    this.getServicesByCategory(this.category);
  
    this.db.getCategories().subscribe(data => {
      this.categories = data;
  
      const matchedCategory = this.categories.find(
        cat => cat[1].toLowerCase() === this.category.toLowerCase()
      );
  
      this.categoiesImage = matchedCategory
        ? matchedCategory[2]
        : 'assets/bookme.png';
  
      console.log('✅ Category Image:', this.categoiesImage);
    });
  }
  isloading=false

  getServicesByCategory(category: string): void {
    this.isloading=true
    this.db.getServices(category).subscribe(data => {
      this.services = data.map(item => ({
        ID: item[0],
        SERVICE_NAME: item[1],
        DESCRIPTION: item[2],
        PROVIDER_ID: item[3],
        PROVIDER_NAME: item[4],
        PROVIDER_NUMBER: item[5],
        CATEGORY: item[6],
        IMG_URL: item[7],
        
        START_TIME:item[8],
        END_TIME:item[9],
        SESSION_LENGHT:item[10],
        DAYS_OFF:item[11]

      }));

        console.log(this.services)
            this.isloading=false


    });

  }
}
