import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  setUserData(userData: any) {
    this.userDataSubject.next(userData);
    // Salva anche nei dati di sessione o locali, se necessario
  }

  getUserData(): Observable<any> {
    if (!this.userDataSubject.value) {
      const savedUserData = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (savedUserData) {
        this.setUserData(JSON.parse(savedUserData));
      } else {
        //we have a guest user
        this.setUserData({});
      }
    }
    return this.userDataSubject.asObservable();
  }
}
