import { Component } from '@angular/core';
import { DarkModeService } from 'src/app/services/dark-mode.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css'],
})
export class StoreComponent {
  bannerClass = '';

  constructor(public darkModeService: DarkModeService) {}
  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }
}
