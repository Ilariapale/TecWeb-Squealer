import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.interface';
import { Channel } from '../models/channel.interface';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userData: any;

  setUserData(userData: any) {
    this.userData = userData;
  }

  getUserData(): any {
    if (!this.userData) {
      const savedUserData = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (savedUserData) {
        this.setUserData(JSON.parse(savedUserData));
      } else {
        this.setUserData({});
      }
    }
    return this.userData;
  }

  isMyself(username: string): boolean {
    if (!this.userData) {
      const savedUserData = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (savedUserData) {
        this.setUserData(JSON.parse(savedUserData));
      }
    }

    const currentUserData = this.userData;
    return currentUserData && (currentUserData.username === username || currentUserData._id === username);
  }

  isModerator(channel: Channel): boolean {
    if (!this.userData) {
      const savedUserData = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (savedUserData) {
        this.setUserData(JSON.parse(savedUserData));
      }
    }

    const currentUserData = this.userData;
    return currentUserData && channel.editors.includes(currentUserData._id);
  }
}
