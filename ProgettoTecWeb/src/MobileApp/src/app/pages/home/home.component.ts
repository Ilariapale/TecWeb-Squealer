import { Component } from '@angular/core';
import { SquealsService } from 'src/app/services/api/squeals.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/api/auth.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { firstValueFrom } from 'rxjs';
import { response } from 'express';
import { User } from 'src/app/models/user.interface';
import { UsersService } from 'src/app/services/api/users.service';
//TODO quando il token è presente ma scaduto, il client continua a mandare richieste e fallire, controllare il fix
//TODO aggiungere l'onclick agli squeals
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
      content: '12.51133 41.89193 , 9.1881263 45.4636707 , 12.22133 41.99193 , 12.13133 41.89993',
      hex_id: 2,
      _id: '7698696',
      username: 'paulpaccy',
      content_type: 'position',
    },
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
  user: User;

  constructor(
    private squealsService: SquealsService,
    public authService: AuthService,
    private router: Router,
    private userService: UserService,
    private usersService: UsersService
  ) {
    this.user = {} as User;

    this.user = this.userService.getUserData();
    if (this.user.account_type == 'guest') {
      this.isGuest = true;
    } else {
      if (['standard', 'moderator', 'professional', 'verified'].includes(this.user.account_type)) {
        this.isGuest = false;
        this.usersService.getUser(this.user.username as string).then((response) => {
          this.user = response;
          this.userService.setUserData(this.user);
        });
      } else {
        this.authService.logout();
      }
    }
  }

  ngOnInit() {
    //check if there is a token
    this.squealsService
      .getHome(this.isGuest)
      .then((response) => {
        //.slice().reverse()
        this.squeals = response;
      })
      .catch((error) => {
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
      });

    //window.location.reload();
    //this.userService.getUser().subscribe();
  }

  loadSqueals(e: Event) {
    e.preventDefault();
  }

  onSquealSubmitted(event: any) {
    // Aggiungi un nuovo squeal all'array
    //this.squeals.unshift(event);
  }

  deleteProfile() {
    //TODO delete profile
  }

  ngOnDestroy() {
    this.homeSubscription.unsubscribe();
  }
}
