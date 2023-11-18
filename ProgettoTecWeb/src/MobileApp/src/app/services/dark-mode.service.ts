import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  darkMode: boolean = false;

  darkModeClass: string = 'dark-theme';
  lightModeClass: string = 'light-theme';

  constructor() {
    const localDarkMode = localStorage.getItem(this.darkModeClass);
    if (localDarkMode) {
      const parsedDarkMode = JSON.parse(localDarkMode);
      if (typeof parsedDarkMode === 'boolean') {
        this.darkMode = parsedDarkMode;
        if (this.darkMode) {
          document.body.classList.add(this.darkModeClass);
          document.body.classList.remove(this.lightModeClass);
        } else {
          document.body.classList.add(this.lightModeClass);
          document.body.classList.remove(this.darkModeClass);
        }
      }
    }
  }

  setLocalStorage() {
    localStorage.setItem('dark-mode', JSON.stringify(this.darkMode));
  }

  darkModeOn() {
    this.darkMode = true;
    document.body.classList.replace(this.lightModeClass, this.darkModeClass);

    this.setLocalStorage();
  }

  darkModeOff() {
    this.darkMode = false;
    document.body.classList.replace(this.darkModeClass, this.lightModeClass);
    this.setLocalStorage();
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle(this.darkModeClass);
    document.body.classList.toggle(this.lightModeClass);
    this.setLocalStorage();
  }

  getThemeClass() {
    return this.darkMode ? this.darkModeClass : this.lightModeClass;
  }
}
