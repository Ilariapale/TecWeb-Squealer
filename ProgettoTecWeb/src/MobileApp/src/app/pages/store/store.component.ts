import { Component } from '@angular/core';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/api/users.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css'],
})
export class StoreComponent {
  isGuest = false; //true
  bannerClass = '';
  user: string = 'paulpaccy';

  constructor(public darkModeService: DarkModeService, private router: Router, private usersService: UsersService) {
    // if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    // else if (localStorage.getItem('user') || sessionStorage.getItem('user')) {
    //   this.isGuest = true;
    // } else {
    //   this.router.navigate(['/login']);
    // }
  }

  addCharacters(tier: string) {
    if (
      [
        'tier1',
        'tier2',
        'tier3',
        'tier4',
        'dailytier1',
        'dailytier2',
        'dailytier3',
        'dailytier4',
        'weeklytier1',
        'weeklytier2',
        'weeklytier3',
        'weeklytier4',
        'monthlytier1',
        'monthlytier2',
        'monthlytier3',
        'monthlytier4',
      ].indexOf(tier) === -1
    )
      return;
    const option = {
      tier: tier,
    };
    this.usersService.updateCharacters(this.user, option);
  }

  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }
  goToPage(page: string) {
    this.router.navigate([page]);
  }
}
