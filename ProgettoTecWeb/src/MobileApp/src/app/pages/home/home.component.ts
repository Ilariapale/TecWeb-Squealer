import { Component } from '@angular/core';
import { SquealsService } from 'src/app/services/api/squeals.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/api/auth.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.interface';
import { UsersService } from 'src/app/services/api/users.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  title = 'Home - Squealer';

  showLoadMore: boolean = true;
  loading: boolean = false;
  MAX_SQUEALS = 5;

  //TODO remove example squeal
  //TODO carica piu squeals
  squeals: any[] = [
    {
      content: '12.51133 41.89193 , 9.1881263 45.4636707 , 12.22133 41.99193 , 12.13133 41.89993',
      hex_id: 2,
      _id: '7698696',
      username: 'paulpaccy',
      content_type: 'position',
      reactions: {
        like: 312231,
        love: 123,
        laugh: 41,
        dislike: 56,
        disgust: 31,
        disagree: 65,
      },
    },
    {
      content: 'https://picsum.photos/id/237/400/300',
      content_type: 'image',
      hex_id: 2,
      _id: 0,
      username: 'ilapale',
      reactions: {
        like: 0,
        love: 0,
        laugh: 0,
        dislike: 0,
        disgust: 0,
        disagree: 0,
      },
    },
    {
      content: 'test',
      hex_id: 2,
      _id: 1,
      username: 'ilapale',
      reactions: {
        like: 0,
        love: 0,
        laugh: 0,
        dislike: 0,
        disgust: 0,
        disagree: 0,
      },
    },
    {
      content: 'test',
      hex_id: 2,
      _id: 2,
      username: 'ilapale',
      reactions: {
        like: 0,
        love: 0,
        laugh: 0,
        dislike: 0,
        disgust: 0,
        disagree: 0,
      },
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
        this.usersService
          .getUser(this.user.username as string)
          .then((response) => {
            this.user = response;
            this.userService.setUserData(this.user);
          })
          .catch((error) => {
            console.log(error);
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
        console.log(response);
        this.squeals = response;
      })
      .catch((error) => {
        const errorText = error.error.error;
        //TokenExpiredError, noToken, invalidTokenFormat
        if (errorText == 'TokenExpiredError') {
          //redirect to login page "/login"
          console.log('TokenExpiredError');
          this.userService.setUserData(null);
          localStorage.removeItem('Authorization');
          sessionStorage.removeItem('Authorization');
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          this.router.navigate(['/login']);
        }
        if (errorText == 'invalidTokenFormat') {
          console.log('invalidTokenFormat');
          this.userService.setUserData(null);
          localStorage.removeItem('Authorization');
          sessionStorage.removeItem('Authorization');
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          this.router.navigate(['/login']);
        }
      });

    //window.location.reload();
    //this.userService.getUser().subscribe();
  }

  loadMoreSqueals() {
    this.loading = true;
    this.squealsService
      .getHome(this.isGuest, this.squeals[this.squeals.length - 1]._id)
      .then((response) => {
        this.loading = false;
        this.squeals.push(...response);
        if (response.length <= 0) {
          this.showLoadMore = false;
        }
      })
      .catch((error) => {
        this.showLoadMore = false;
        this.loading = false;
      });
  }
}
