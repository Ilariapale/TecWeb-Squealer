import { Component, OnInit } from '@angular/core';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/api/users.service';
import { SquealsService } from 'src/app/services/api/squeals.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css'],
})
export class StoreComponent implements OnInit {
  isGuest = true;
  bannerClass = '';
  prices: any = {};
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

  itemsBundle = [] as any;
  itemsDaily = [] as any;
  itemsWeekly = [] as any;
  itemsMonthly = [] as any;

  bundlesNames = ['Only Daily', 'Only Weekly', 'Only Monthly'];

  constructor(
    public darkModeService: DarkModeService,
    private router: Router,
    private usersService: UsersService,
    private squealsService: SquealsService
  ) {
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    else if (localStorage.getItem('user') || sessionStorage.getItem('user')) {
      this.isGuest = true;
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.squealsService
      .getPrices()
      .then((res) => {
        this.prices = res;
        this.itemsBundle = [
          {
            id: 'tier1',
            icon: 'coin',
            name: 'Tier 1',
            price: this.prices.shop_tiers['tier1Price'],
            description: `${this.prices.shop_tiers.tier1.daily} daily, ${this.prices.shop_tiers.tier1.weekly} weekly, ${this.prices.shop_tiers.tier1.monthly} monthly`,
          },
          {
            id: 'tier2',
            icon: 'cash',
            name: 'Tier 2',
            price: this.prices.shop_tiers['tier2Price'],
            description: `${this.prices.shop_tiers.tier2.daily} daily, ${this.prices.shop_tiers.tier2.weekly} weekly, ${this.prices.shop_tiers.tier2.monthly} monthly`,
          },
          {
            id: 'tier3',
            icon: 'cash-coin',
            name: 'Tier 3',
            price: this.prices.shop_tiers['tier3Price'],
            description: `${this.prices.shop_tiers.tier3.daily} daily, ${this.prices.shop_tiers.tier3.weekly} weekly, ${this.prices.shop_tiers.tier3.monthly} monthly`,
          },
          {
            id: 'tier4',
            icon: 'cash-stack',
            name: 'Tier 4',
            price: this.prices.shop_tiers['tier4Price'],
            description: `${this.prices.shop_tiers.tier4.daily} daily, ${this.prices.shop_tiers.tier4.weekly} weekly, ${this.prices.shop_tiers.tier4.monthly} monthly`,
          },
        ];
        this.itemsDaily = [
          {
            id: 'dailytier1',
            icon: 'coin',
            name: 'Daily Tier 1',
            price: this.prices.shop_tiers['tier1Price'],
            description: `${this.prices.shop_tiers.daily.tier1} char`,
          },
          {
            id: 'dailytier2',
            icon: 'cash',
            name: 'Daily Tier 2',
            price: this.prices.shop_tiers['tier2Price'],
            description: `${this.prices.shop_tiers.daily.tier2} char`,
          },
          {
            id: 'dailytier3',
            icon: 'cash-coin',
            name: 'Daily Tier 3',
            price: this.prices.shop_tiers['tier3Price'],
            description: `${this.prices.shop_tiers.daily.tier3} char`,
          },
          {
            id: 'dailytier4',
            icon: 'cash-stack',
            name: 'Daily Tier 4',
            price: this.prices.shop_tiers['tier4Price'],
            description: `${this.prices.shop_tiers.daily.tier4} char`,
          },
        ];
        this.itemsWeekly = [
          {
            id: 'weeklytier1',
            icon: 'coin',
            name: 'Weekly Tier 1',
            price: this.prices.shop_tiers['tier1Price'],
            description: `${this.prices.shop_tiers.weekly.tier1} char`,
          },
          {
            id: 'weeklytier2',
            icon: 'cash',
            name: 'Weekly Tier 2',
            price: this.prices.shop_tiers['tier2Price'],
            description: `${this.prices.shop_tiers.weekly.tier2} char`,
          },
          {
            id: 'weeklytier3',
            icon: 'cash-coin',
            name: 'Weekly Tier 3',
            price: this.prices.shop_tiers['tier3Price'],
            description: `${this.prices.shop_tiers.weekly.tier3} char`,
          },
          {
            id: 'weeklytier4',
            icon: 'cash-stack',
            name: 'Weekly Tier 4',
            price: this.prices.shop_tiers['tier4Price'],
            description: `${this.prices.shop_tiers.weekly.tier4} char`,
          },
        ];
        this.itemsMonthly = [
          {
            id: 'monthlytier1',
            icon: 'coin',
            name: 'Monthly Tier 1',
            price: this.prices.shop_tiers['tier1Price'],
            description: `${this.prices.shop_tiers.monthly.tier1} char`,
          },
          {
            id: 'monthlytier2',
            icon: 'cash',
            name: 'Monthly Tier 2',
            price: this.prices.shop_tiers['tier2Price'],
            description: `${this.prices.shop_tiers.monthly.tier2} char`,
          },
          {
            id: 'monthlytier3',
            icon: 'cash-coin',
            name: 'Monthly Tier 3',
            price: this.prices.shop_tiers['tier3Price'],
            description: `${this.prices.shop_tiers.monthly.tier3} char`,
          },
          {
            id: 'monthlytier4',
            icon: 'cash-stack',
            name: 'Monthly Tier 4',
            price: this.prices.shop_tiers['tier4Price'],
            description: `${this.prices.shop_tiers.monthly.tier4} char`,
          },
        ];
      })
      .catch((err) => {
        console.log(err);
      });
  }

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
    this.usersService
      .updateCharacters(tier)
      .then((res) => {})
      .catch((err) => {
        console.log(err);
      });
  }

  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }
  goToPage(page: string) {
    this.router.navigate([page]);
  }
}
