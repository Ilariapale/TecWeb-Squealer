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

  squeals: any[] = [];
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
    if (this.user?.account_type == 'guest') {
      this.isGuest = true;
    } else {
      if (['standard', 'moderator', 'professional', 'verified'].includes(this.user?.account_type)) {
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
        this.squeals = response;
      })
      .catch((error) => {
        const errorText = error.error.error;
        //TokenExpiredError, noToken, invalidTokenFormat
        if (errorText == 'TokenExpiredError' || errorText == 'invalidTokenFormat') {
          //redirect to login page "/login"
          this.userService.setUserData(null);
          localStorage.removeItem('Authorization');
          sessionStorage.removeItem('Authorization');
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          this.router.navigate(['/login']);
        }
      });
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
        console.log(error);
        this.showLoadMore = false;
        this.loading = false;
      });
  }
}
