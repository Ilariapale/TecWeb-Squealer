import { Component } from '@angular/core';
import { DarkModeService } from 'src/app/services/dark-mode.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  searchInput: string = '';
  selectedOption: string = 'user-search';
  professional_type: string = 'none';
  account_type: string = 'none';
  created_before: Date = new Date();
  created_after: Date = new Date();
  max_squeals: number = NaN;
  min_squeals: number = NaN;
  max_reaction: number = NaN;
  min_reaction: number = NaN;
  max_balance: number = NaN;
  min_balance: number = NaN;
  sort_order: string = 'none';
  sort_by: string = 'none';
  max_subscribers: number = NaN;
  min_subscribers: number = NaN;
  is_official: boolean = false;

  subscribed: boolean = false;
  loading: boolean = false;
  showUserResults: boolean = false;
  showChannelResults: boolean = false;
  showKeywordResults: boolean = true;

  testArray: string[] = ['test1', 'test2', 'test3'];

  constructor(private darkModeService: DarkModeService) {}

  triggerTest() {
    this.subscribed = !this.subscribed;
  }

  getDarkMode() {
    return this.darkModeService.getThemeClass();
  }
}
