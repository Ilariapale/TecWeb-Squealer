import { Component, OnInit } from '@angular/core';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/api/users.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css'],
})
export class StoreComponent implements OnInit {
  isGuest = true;
  bannerClass = '';
  tiers = [
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
  ];

  tiersUrl: any = {
    tier1: 'https://www.sandbox.paypal.com/instantcommerce/checkout/5LA33VB3DRZRJ',
    tier2: 'https://www.sandbox.paypal.com/instantcommerce/checkout/UZSK4BDQVMK2Q',
    tier3: 'https://www.sandbox.paypal.com/instantcommerce/checkout/APRL59BZBV7EC',
    tier4: 'https://www.sandbox.paypal.com/instantcommerce/checkout/9KV7B83QLVSQ2',
    dailytier1: 'https://www.sandbox.paypal.com/instantcommerce/checkout/VLK8VFRDYQ4MG',
    dailytier2: 'https://www.sandbox.paypal.com/instantcommerce/checkout/PFEBL2FXCPMTQ',
    dailytier3: 'https://www.sandbox.paypal.com/instantcommerce/checkout/NQY6TZ7Z9DKAW',
    dailytier4: 'https://www.sandbox.paypal.com/instantcommerce/checkout/ZUHFW8Y9YGTCW',
    weeklytier1: 'https://www.sandbox.paypal.com/instantcommerce/checkout/8C7G9FA4KQ49J',
    weeklytier2: 'https://www.sandbox.paypal.com/instantcommerce/checkout/YWUJZUDFD6L58',
    weeklytier3: 'https://www.sandbox.paypal.com/instantcommerce/checkout/Z88YVTHHYR4U6',
    weeklytier4: 'https://www.sandbox.paypal.com/instantcommerce/checkout/XYPNERHTEXDNJ',
    monthlytier1: 'https://www.sandbox.paypal.com/instantcommerce/checkout/NLYTA9FV3MM3N',
    monthlytier2: 'https://www.sandbox.paypal.com/instantcommerce/checkout/3SPB2YBKZ5YUL',
    monthlytier3: 'https://www.sandbox.paypal.com/instantcommerce/checkout/NY569L9Z8F468',
    monthlytier4: 'https://www.sandbox.paypal.com/instantcommerce/checkout/K9ARXPJPGEWYC',
  };

  constructor(public darkModeService: DarkModeService, private router: Router, private usersService: UsersService) {
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    else if (localStorage.getItem('user') || sessionStorage.getItem('user')) {
      this.isGuest = true;
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {}

  addCharacters(tier: string) {
    if (this.tiers.indexOf(tier) === -1) {
      return;
    }
    //simulate a payment request  with delay
    //open another window to show payment
    //if payment is successful
    //update the user's characters

    //open a new window not a tab
    const paymentWindow = window.open(
      this.tiersUrl[tier], //
      '_blank',
      'width=500,height=600'
    );
    this.usersService.updateCharacters(tier).then((res) => {});
  }

  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }
  goToPage(page: string) {
    this.router.navigate([page]);
  }
}
