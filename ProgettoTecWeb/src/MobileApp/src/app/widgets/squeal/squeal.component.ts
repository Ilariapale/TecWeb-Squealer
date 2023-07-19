import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-squeal',
  templateUrl: './squeal.component.html',
  styleUrls: ['./squeal.component.css'],
})
export class SquealComponent {
  title = 'Squeal';
  date;
  user = 'SquealUser';
  nickname = 'SquealNickname';
  @Input() content = 'Squeal Content';
  up_count = 42;
  down_count = 42;
  comments_count = 42; //rimuovere
  favourites_count = 42;
  resqueals_count = 42;
  comments_list = ['a', 'b', 'c'];
  constructor() {
    this.date = new Date().toJSON();
  }
}
