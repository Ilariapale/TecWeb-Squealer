import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquealFormComponent } from './squeal-form.component';

describe('SquealFormComponent', () => {
  let component: SquealFormComponent;
  let fixture: ComponentFixture<SquealFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SquealFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SquealFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
