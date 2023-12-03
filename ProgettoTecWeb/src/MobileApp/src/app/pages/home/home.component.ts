import { Component } from '@angular/core';
import { SquealsService } from 'src/app/services/api/squeals.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/api/auth.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { firstValueFrom } from 'rxjs';
//TODO quando il token è presente ma scaduto, il client continua a mandare richieste e fallire, controllare il fix
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  private homeSubscription: Subscription = new Subscription();
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
  isGuest: boolean = true;

  constructor(
    private squealsService: SquealsService,
    public authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    firstValueFrom(this.userService.getUserData()).then((userData) => {
      console.log(userData);
      if (userData.account_type == 'guest') {
        this.isGuest = true;
      } else {
        if (['standard', 'moderator', 'professional', 'verified'].includes(userData.account_type)) {
          this.isGuest = false;
        } else {
          this.authService.logout();
        }
      }
    });
  }

  ngOnInit() {
    //check if there is a token
    this.homeSubscription = this.squealsService.getHome(this.isGuest).subscribe({
      next: (response: any) => {
        //.slice().reverse()
        this.squeals = response;
      },
      error: (error) => {
        const errorText = error.error.error;
        //TokenExpiredError, noToken, invalidTokenFormat
        if (errorText == 'TokenExpiredError') {
          //redirect to login page "/login"
          console.log('TokenExpiredError');
          this.userService.setUserData(null);
          this.router.navigate(['/login']);
        }
        if (errorText == 'invalidTokenFormat') {
          console.log('invalidTokenFormat');
          this.userService.setUserData(null);
          this.router.navigate(['/login']);
        }
      },
    });
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

  uploadImage(event: any) {
    event.preventDefault(); // Previeni il comportamento predefinito del form

    const fileInput = event.target.querySelector('input[type="file"]');

    if (fileInput.files && fileInput.files[0]) {
      this.squealsService.postMedia(fileInput.files[0]).subscribe({
        next: (response: any) => {
          console.log(response);
          //TODO
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }

  deleteProfile() {
    //TODO delete profile
  }

  ngOnDestroy() {
    this.homeSubscription.unsubscribe();
  }
}
