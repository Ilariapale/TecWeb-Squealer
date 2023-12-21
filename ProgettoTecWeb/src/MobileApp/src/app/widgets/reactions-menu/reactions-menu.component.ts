import { Component, Input } from '@angular/core';
import { SquealsService } from 'src/app/services/api/squeals.service';

@Component({
  selector: 'app-reactions-menu',
  templateUrl: './reactions-menu.component.html',
  styleUrls: ['./reactions-menu.component.css'],
})
export class ReactionsMenuComponent {
  @Input() alreadyReacted: Boolean = false;
  @Input() squealId: string = '0';
  isMouseOver = false;
  isMenuClosing = false;
  menu_opened: Boolean = false;
  imageUrl = './../../../assets/imgs/reactionsBW.png';

  constructor(private squealService: SquealsService) {}
  ngOnInit() {
    if (this.alreadyReacted) {
      this.imageUrl = './../../../assets/imgs/reactionsCOLORS.png';
    }
  }
  ngOnChanges() {
    if (this.alreadyReacted) {
      this.imageUrl = './../../../assets/imgs/reactionsCOLORS.png';
    }
  }
  addReaction(reaction: string, event: Event) {
    event.preventDefault();
    this.squealService.addReaction(reaction, this.squealId).then(
      (response: any) => {
        this.menu_opened = false;
        this.alreadyReacted = true;
        this.imageUrl = './../../../assets/imgs/reactionsCOLORS.png';
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
}
