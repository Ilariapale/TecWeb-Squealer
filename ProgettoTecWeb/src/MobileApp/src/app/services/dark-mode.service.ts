import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  darkMode: boolean = false;

  darkModeOn() {
    this.darkMode = true;
  }

  darkModeOff() {
    this.darkMode = false;
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
  }

  getThemeClass() {
    return this.darkMode ? 'dark-theme' : 'light-theme';
  }
}
