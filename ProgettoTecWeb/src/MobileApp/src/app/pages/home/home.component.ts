import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  title = 'AppSite';
  squeals: any[] = [];

  loadSqueals(e: Event) {
    e.preventDefault();
  }

  onSquealSubmitted(event: any) {
    // Aggiungi un nuovo squeal all'array
    this.squeals.push(event);
  }
}
