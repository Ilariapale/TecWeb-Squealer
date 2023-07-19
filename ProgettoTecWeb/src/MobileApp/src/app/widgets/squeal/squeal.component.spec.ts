import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquealComponent } from './squeal.component';

describe('SquealComponent', () => {
  let component: SquealComponent;
  let fixture: ComponentFixture<SquealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SquealComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SquealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
