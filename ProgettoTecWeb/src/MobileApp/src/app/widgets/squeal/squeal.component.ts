import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-squeal',
  templateUrl: './squeal.component.html',
  styleUrls: ['./squeal.component.css'],
})
export class SquealComponent {
  title = 'Squeal';
  @Input() username = 'SquealUser';
  _id = 0;
  user_id = 0;
  @Input() hex_id = 0;
  is_scheduled = false;
  content_type = 'text';
  @Input() content = 'TESTO A CASO';
  recipients = {};
  @Input() created_at = '2021-01-01T00:00:00.000Z';
  last_modified = '2021-01-01T00:00:00.000Z';
  comment_section = 0;
  reactions = {};
  is_in_official_channel = false;
  impressions = 42;
  // @Input() content = 'Squeal Content';
  // up_count = 42;
  // down_count = 42;
  // comments_count = 42; //rimuovere
  // favourites_count = 42;
  // resqueals_count = 42;
  // comments_list = ['a', 'b', 'c'];
  // constructor() {
  //   this.date = new Date().toJSON();
  // }
}
