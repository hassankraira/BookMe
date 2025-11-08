import { LoadingService } from './../loading.service';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Component,ElementRef,Input , OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { DatabaseService } from '../services/database.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgFor, FormsModule, RouterLink],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})

export class ServicesComponent implements OnInit {
  @Input() backgroundColor: string = 'black';
    @ViewChild('secound1') boxs!: ElementRef<HTMLDivElement>;


  get textColor(): string {
    return this.backgroundColor.toLowerCase() === 'white' ? 'black' : 'white';
  }
  categories: any[] = [];
  selectedCategory: any = null;
  count:number[]=[1,2]
  constructor(private db: DatabaseService ) {

  }


  ngOnInit(): void {

      this.loadCategories();
   
  }

  loadCategories() {
    console.log('loadCategories called');
  
  
    this.db.getCategories().subscribe({
      next: (data) => {
        const categories = data.map(item => ({
          id: item[0],
          Name: item[1],
          image: item[2],
          icon: item[3]
        }));
        this.categories = categories;
     
      },
      error: (err) => {
        console.error(err);
        
      }
    });
  
  

     

  }
  position2 = 0;

  moveSlide(direction: number): void {
 
    
    
    const container = this.boxs.nativeElement;
   
    const isMobile = window.innerWidth <= 850;
    const isTablet = window.innerWidth > 850 && window.innerWidth <= 1024;

    const cardWidth = 306;
    const scroll2 = cardWidth -100 ;   
    const scroll4 = cardWidth *3 -100;   
    if (isMobile) {
      if (direction === 1) {
        this.position2++;
        container.scrollBy({
          left: 306 * direction,
          behavior: 'smooth'
        });
  
        if (this.position2 % 11 === 0) {
          container.scrollLeft = 0;

          container.scrollBy({
            left: 306 * direction,
            behavior: 'smooth'
          });

          this.position2 = 1;
        }
      }
  
      if (direction === -1) {
        if (this.position2 % 11 === 0) { 

          container.scrollLeft = 3090;
          container.scrollBy({
            left: 306 * direction,
            behavior: 'smooth'
          });
          this.position2=9
          console.log(this.position2)
        } else {
          container.scrollBy({
            left: 306 * direction,
            behavior: 'smooth'
          });
          this.position2 --;
        }
      }
    }




     else if (isTablet){
      if (direction === 1) {
        this.position2++;
        container.scrollBy({
          left: scroll2,
          behavior: 'smooth'
        });
  
        if (this.position2 % 2 === 0) {
          container.scrollLeft = scroll2;
          container.scrollBy({
            left: scroll4,
            behavior: 'smooth'
          });
          this.position2 = 0;
        }
      }
  
      if (direction === -1) {
        if (this.position2 % 2 === 0) {
          container.scrollLeft = scroll2 + scroll4;
          container.scrollBy({
            left: -scroll4,
            behavior: 'smooth'
          });
          this.position2++;
        } else {
          container.scrollBy({
            left: -scroll2,
            behavior: 'smooth'
          });
          this.position2 = 0;
        }
      }
     }








     if (direction === 1) {
      this.position2++;
    
      container.scrollBy({
        left: 1230,
        behavior: 'smooth'
      });
    
      if (this.position2%4=== 0) {
          container.scrollLeft = 0;
          this.position2 = 0;
    
            container.scrollBy({
              left: 1230,
              behavior: 'smooth'
            });
            this.position2 = 1;
      }
    }
    
    if (direction === -1) {
      if (this.position2 === 0) {
        container.scrollLeft = 3690;
    
          container.scrollBy({
            left: -1220,
            behavior: 'smooth'
          });
          this.position2 = 2;
      } else {
        this.position2--;
        container.scrollBy({
          left: -1230,
          behavior: 'smooth'
        });
      }
      }


    }
  

  

  startX: number = 0;
  endX: number = 0;
  
  ngAfterViewInit() {
    const container = this.boxs.nativeElement;
  
    // للموبايل
    container.addEventListener('touchstart', (e: TouchEvent) => {
      this.startX = e.touches[0].clientX;
    });
  
    container.addEventListener('touchend', (e: TouchEvent) => {
      this.endX = e.changedTouches[0].clientX;
      this.handleSwipe();
    });
  
    // للكمبيوتر
    container.addEventListener('mousedown', (e: MouseEvent) => {
      this.startX = e.clientX;
    });
  
    container.addEventListener('mouseup', (e: MouseEvent) => {
      this.endX = e.clientX;
      this.handleSwipe();
    });
  }
  
  handleSwipe() {
    const delta = this.endX - this.startX;
  
    if (Math.abs(delta) > 0) { // عشان نتجاهل اللمسات الخفيفة
      const direction = delta < 0 ? 1 : -1;
      this.moveSlide(direction);
    }

  
    }
}
