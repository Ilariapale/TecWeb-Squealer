import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  darkMode: boolean = false;

  constructor() {
    const localDarkMode = localStorage.getItem('dark-mode');
    if (localDarkMode) {
      const parsedDarkMode = JSON.parse(localDarkMode);
      if (typeof parsedDarkMode === 'boolean') {
        this.darkMode = parsedDarkMode;
      }
    }
  }

  setLocalStorage() {
    localStorage.setItem('dark-mode', JSON.stringify(this.darkMode));
  }

  darkModeOn() {
    this.darkMode = true;
    this.setLocalStorage();
  }

  darkModeOff() {
    this.darkMode = false;
    this.setLocalStorage();
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.setLocalStorage();
  }

  getThemeClass() {
    return this.darkMode ? 'dark-theme' : 'light-theme';
  }
}
