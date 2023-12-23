import { Component } from '@angular/core';
import { DarkModeService } from './services/dark-mode.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Squealer';

  constructor(private darkModeService: DarkModeService) {}

  getThemeClass() {
    let theme = this.darkModeService.getThemeClass();

    return theme;
  }
}
