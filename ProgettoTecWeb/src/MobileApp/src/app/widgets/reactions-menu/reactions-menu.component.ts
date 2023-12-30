import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SquealsService } from 'src/app/services/api/squeals.service';

@Component({
  selector: 'app-reactions-menu',
  templateUrl: './reactions-menu.component.html',
  styleUrls: ['./reactions-menu.component.css'],
})
export class ReactionsMenuComponent {
  @Output() reaction = new EventEmitter<string>();
  @Input() alreadyReacted: Boolean = false;
  @Input() squealId: string = '0';
  isMouseOver = false;
  isMenuClosing = false;
  menu_opened: Boolean = false;
  imageUrl = './../../../assets/imgs/reactionsBW.png';
  @Input() isGuest: boolean = false;

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
    this.squealService.addReaction(reaction, this.squealId, this.isGuest).then(
      (response: any) => {
        //emit event to update the reactions in the squeal component
        this.reaction.emit(reaction);

        this.menu_opened = false;
        this.alreadyReacted = true;
        this.imageUrl = './../../../assets/imgs/reactionsCOLORS.png';
      },
      (error: any) => {
        if (error.status == 401) this.reaction.emit('error');
        console.log(error);
      }
    );
  }
}
