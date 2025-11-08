import { RouterLink } from '@angular/router';
import { DatabaseService } from './../services/database.service';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgModel, NgForm, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [NgIf,NgFor,FormsModule,RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  @ViewChild('searchinput') searchInput!: ElementRef;
   
    @Input() isClosing: boolean=false ; 
    ngOnInit(){
    }
    ngAfterViewInit() {
      this.searchInput.nativeElement.focus();
    }
    @Output() closeSearch = new EventEmitter<void>();

    onCloseClick() {
        this.closeSearch.emit();  // أرسل الحدث إلى الأب
    }
    searchTerm: string = '';
    searchResults: any[] = [];
  
    constructor(private db: DatabaseService) {}
  
    onSearchChange(term: string) {
      if (term && term.trim() !== '') {
        this.db.getservicesForProvider().subscribe(data => {
          this.searchResults = data.filter(item => 
            item[1].toLowerCase().includes(term.toLowerCase())
          );
        });
      } else {
        this.searchResults = [];
      }
    }

   



}

