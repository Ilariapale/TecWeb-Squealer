import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  constructor(public router: Router) {}
  goToPage(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
