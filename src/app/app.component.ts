import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FooterComponent } from './footer/footer.component';
import { Component, OnInit, HostListener } from '@angular/core';
import { ParamMap, RouterLink, RouterOutlet, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { SearchComponent } from "./search/search.component";
import { NgIf } from '@angular/common';
import { slideInAnimation } from './route-animations';
import { AsyncPipe } from '@angular/common';
import { LoadingComponent } from "./loading/loading.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FooterComponent, FormsModule, HttpClientModule, SearchComponent, NgIf, LoadingComponent],
  templateUrl: './app.component.html',
  animations: [slideInAnimation],

  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  currentRoute: string = '';

  constructor(private router: Router) {}

  isNavVisible = true;
  isAtTop = true;
  lastScrollY = 0;

  @HostListener('window:scroll', [])
  onScroll() {
    const currentScrollY = window.scrollY;

    this.isAtTop = currentScrollY === 0;

    if (currentScrollY < this.lastScrollY) {
      this.isNavVisible = true;
    } else if (currentScrollY > this.lastScrollY) {
      this.isNavVisible = false;
    }

    this.lastScrollY = currentScrollY;
  }




  
  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
        console.log('Current route:', this.currentRoute);
      }
    });
  }
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
  title = 'bookly';
  isSearchon=false
  toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
      navMenu.classList.toggle('active');
    }
  }
  
  
  isMenuOpen = false;
  
    openMenu() {
      this.isMenuOpen = true;
      document.querySelector('.side-menu')?.classList.add('open');
    }
  
    closeMenu() {
      this.isMenuOpen = false;
      document.querySelector('.side-menu')?.classList.remove('open');
    }
    searchon(b:boolean){
      this.isSearchon=b      
      console.log("from nav "+this.isSearchon)
    }
  
  
}
