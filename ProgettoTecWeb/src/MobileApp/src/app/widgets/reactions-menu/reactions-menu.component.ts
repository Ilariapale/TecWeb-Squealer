import { Component, Input } from '@angular/core';
import { SquealsService } from 'src/app/services/api/squeals.service';

@Component({
  selector: 'app-reactions-menu',
  templateUrl: './reactions-menu.component.html',
  styleUrls: ['./reactions-menu.component.css'],
})
export class ReactionsMenuComponent {
  @Input() squealId: string = '0';
  isMouseOver = false;
  isMenuClosing = false;

  constructor(private squealService: SquealsService) {}

  addReaction(reaction: string, event: Event) {
    event.preventDefault();
    this.squealService.addReaction(reaction, this.squealId).then(
      (response: any) => {
        console.log('OK REACTION AGGIUNTA');
        console.log(response);
      },
      (error: any) => {
        console.log('REACTION NON AGGIUNTA');
        console.log(error);
      }
    );
  }
}
