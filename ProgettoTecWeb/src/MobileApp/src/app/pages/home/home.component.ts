import { Component } from '@angular/core';
import { SquealService } from 'src/app/services/api/squeals.service';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/api/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  title = 'Home - Squealer';
  //TODO remove example squeal
  squeals: any[] = [
    {
      content: 'test',
      hex_id: 2,
      _id: 0,
      username: 'ilapale',
    },
    {
      content: 'test',
      hex_id: 2,
      _id: 1,
      username: 'ilapale',
    },
    {
      content: 'test',
      hex_id: 2,
      _id: 2,
      username: 'ilapale',
    },
  ];
  isGuest: boolean = false;

  constructor(private squealService: SquealService, public authService: AuthService, private router: Router) {
    this.isGuest = !localStorage.getItem('Authorization') && !sessionStorage.getItem('Authorization');
  }

  ngOnInit() {
    //check if there is a token
    this.squealService.getHome(this.isGuest).subscribe(
      (response: any) => {
        //.slice().reverse()
        this.squeals = response;
      },
      (error) => {
        const errorText = error.error.error;
        //TokenExpiredError, noToken, invalidTokenFormat
        if (errorText == 'TokenExpiredError') {
          //redirect to login page "/login"
          console.log('TokenExpiredError');
          this.router.navigate(['/login']);
        }
        if (errorText == 'invalidTokenFormat') {
          console.log('invalidTokenFormat');
          this.router.navigate(['/login']);
        }
      }
    );
    //window.location.reload();
    //this.userService.getUser().subscribe();
  }

  loadSqueals(e: Event) {
    e.preventDefault();
  }

  onSquealSubmitted(event: any) {
    // Aggiungi un nuovo squeal all'array
    this.squeals.push(event);
  }

  logout() {
    this.authService.logout(); // Chiama il metodo di logout dal tuo servizio di autenticazione
  }

  deleteProfile() {
    //TODO delete profile
  }
}
