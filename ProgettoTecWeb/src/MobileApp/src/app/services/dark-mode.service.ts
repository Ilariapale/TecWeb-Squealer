import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  darkMode: boolean = false;

  darkModeClass: string = 'dark-theme';
  lightModeClass: string = 'light-theme';

  //bannerColorDark = ['#170a47', '#144272', '#062925', '#044A42', '#4c0013', '#570530'];
  //bannerColorLight = ['#8376f3', '#57a0e0', '#5dcfc4', '#B8E1DD', '#ff758c', '#e265aa'];

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
    localStorage.setItem(this.darkModeClass, JSON.stringify(this.darkMode));
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

  getBannerClass() {
    const number = 6;
    if (this.darkMode) {
      return 'darkBanner' + Math.floor(Math.random() * number);
    } else {
      return 'lightBanner' + Math.floor(Math.random() * number);
    }
  }

  getThemeClass() {
    return this.darkMode ? this.darkModeClass : this.lightModeClass;
  }
}
