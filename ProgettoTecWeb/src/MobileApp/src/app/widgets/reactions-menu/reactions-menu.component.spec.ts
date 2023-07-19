import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactionsMenuComponent } from './reactions-menu.component';

describe('ReactionsMenuComponent', () => {
  let component: ReactionsMenuComponent;
  let fixture: ComponentFixture<ReactionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReactionsMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
