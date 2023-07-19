import { Component } from '@angular/core';

@Component({
  selector: 'app-reactions-menu',
  templateUrl: './reactions-menu.component.html',
  styleUrls: ['./reactions-menu.component.css'],
})
export class ReactionsMenuComponent {
  isMouseOver = false;
  isMenuClosing = false;

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
}
