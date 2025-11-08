import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesByCategoryComponent } from './services-by-category.component';

describe('ServicesByCategoryComponent', () => {
  let component: ServicesByCategoryComponent;
  let fixture: ComponentFixture<ServicesByCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesByCategoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServicesByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
