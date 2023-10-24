import { Component } from '@angular/core';
import { SquealService } from 'src/app/services/api/squeals.service';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  title = 'Home - Squealer';
  squeals: any[] = [];

  constructor(private squealService: SquealService) {}

  ngOnInit() {
    console.log('afjiowephfpwioau');
    this.squealService.getHome().subscribe(
      (response: any) => {
        //.slice().reverse()
        this.squeals = response;
        console.log('AAA');
        console.log(this.squeals);
      },
      (error) => {
        console.error(error);
      }
    );
    //this.userService.getUser().subscribe();
  }

  loadSqueals(e: Event) {
    e.preventDefault();
  }

  onSquealSubmitted(event: any) {
    // Aggiungi un nuovo squeal all'array
    this.squeals.push(event);
  }
}

/*  <div class="card-container">
    <a (click)="loadSqueals($event)" class="card" target="_blank" rel="noopener" href="">
      <svg class="material-icons" fill="#000000" height="800px" width="800px" version="1.1" id="Layer_1"
        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 367.136 367.136"
        xml:space="preserve">
        <path
          d="M367.136,149.7V36.335l-39.14,38.953c-13.024-17.561-29.148-32.731-47.732-44.706c-29.33-18.898-63.352-28.888-98.391-28.888C81.588,1.694,0,83.282,0,183.568s81.588,181.874,181.874,181.874c34.777,0,68.584-9.851,97.768-28.488c28.394-18.133,51.175-43.703,65.881-73.944l-26.979-13.119c-25.66,52.77-78.029,85.551-136.669,85.551C98.13,335.442,30,267.312,30,183.568S98.13,31.694,181.874,31.694c49.847,0,96.439,24.9,124.571,65.042L253.226,149.7H367.136z" />
      </svg>
      <span>Load more</span>
    </a>
  </div>
  */
