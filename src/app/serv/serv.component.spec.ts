import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServComponent } from './serv.component';

describe('ServComponent', () => {
  let component: ServComponent;
  let fixture: ComponentFixture<ServComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
