import { Component, Input } from '@angular/core';
import { SquealService } from 'src/app/services/api/squeals.service';

@Component({
  selector: 'app-reactions-menu',
  templateUrl: './reactions-menu.component.html',
  styleUrls: ['./reactions-menu.component.css'],
})
export class ReactionsMenuComponent {
  @Input() squealId: string = '0';
  isMouseOver = false;
  isMenuClosing = false;

  constructor(private squealService: SquealService) {}

  setMouseOverTrue() {
    this.isMouseOver = true;
    this.isMenuClosing = false;
  }

  setMouseOverFalse() {
    this.isMenuClosing = true;
    setTimeout(() => {
      if (this.isMenuClosing) {
        this.isMouseOver = false;
      }
    }, 500);
  }

  addReaction(reaction: string, event: Event) {
    event.preventDefault();
    this.squealService.addReaction(reaction, this.squealId).subscribe(
      (response: any) => {
        console.log('OK REACTION AGGIUNTA');
        console.log(response);
      },
      (error) => {
        console.log('REACTION NON AGGIUNTA');
        console.log(error);
      }
    );
  }
}
