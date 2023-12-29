import { Injectable } from '@angular/core';
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

  isSquealerMod(): boolean {
    if (!this.userData) {
      const savedUserData = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (savedUserData) {
        this.setUserData(JSON.parse(savedUserData));
      }
    }
    const currentUserData = this.userData;
    return currentUserData && currentUserData.account_type === 'moderator';
  }

  isSMM(): boolean {
    if (!this.userData) {
      const savedUserData = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (savedUserData) {
        this.setUserData(JSON.parse(savedUserData));
      }
    }

    const currentUserData = this.userData;
    return (
      currentUserData && currentUserData.account_type === 'professional' && currentUserData.professional_type === 'SMM'
    );
  }

  isVIP(): boolean {
    if (!this.userData) {
      const savedUserData = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (savedUserData) {
        this.setUserData(JSON.parse(savedUserData));
      }
    }

    const currentUserData = this.userData;
    return (
      currentUserData && currentUserData.account_type === 'professional' && currentUserData.professional_type === 'VIP'
    );
  }

  alreadySentSMMRequest(SMM_id: String | undefined): boolean {
    if (!SMM_id) return false;
    if (!this.userData) {
      const savedUserData = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (savedUserData) {
        this.setUserData(JSON.parse(savedUserData));
      }
    }

    const currentUserData = this.userData;
    return currentUserData && currentUserData.pending_requests.VIP_requests.includes(SMM_id);
  }

  alreadyGotSMM(): boolean {
    if (!this.userData) {
      const savedUserData = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (savedUserData) {
        this.setUserData(JSON.parse(savedUserData));
      }
    }

    const currentUserData = this.userData;
    return currentUserData && currentUserData.smm;
  }

  isMySMM(SMM_id: String | undefined): boolean {
    if (!SMM_id) return false;
    if (!this.userData) {
      const savedUserData = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (savedUserData) {
        this.setUserData(JSON.parse(savedUserData));
      }
    }

    const currentUserData = this.userData;
    return currentUserData && currentUserData.smm === SMM_id;
  }
}
