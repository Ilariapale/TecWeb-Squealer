import { Component } from '@angular/core';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { UserQuery, AccountType, ProfessionalType, User } from 'src/app/models/user.interface';
import { UsersService } from 'src/app/services/api/users.service';
import { ChannelsService } from 'src/app/services/api/channels.services';
import { SquealsService } from 'src/app/services/api/squeals.service';
import { Channel, ChannelQuery } from 'src/app/models/channel.interface';
import { Squeal, SquealQuery } from 'src/app/models/squeal.interface';
import { Router } from '@angular/router';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  RESULT_LIMIT = 5;
  isGuest: boolean = true;

  nameFixRegex = /[\x00-\x1F\x7F<>&"'#]/g;

  searchInput: string = '';
  selectedOption: string = 'user-search';
  professional_type: string = 'none';
  account_type: string = 'none';
  created_before: Date | null = null;
  created_after: Date | null = null;
  max_squeals: number = NaN;
  min_squeals: number = NaN;
  min_reactions: number = NaN;
  max_balance: number = NaN;
  min_balance: number = NaN;
  sort_order: string = 'none';
  sort_by: string = 'none';
  max_subscribers: number = NaN;
  min_subscribers: number = NaN;
  is_official: boolean = false;
  content_type: string = 'none';
  is_scheduled: boolean = false;

  subscribed: boolean = false;
  loading: boolean = false;
  showUserResults: boolean = true;
  showChannelResults: boolean = false;
  showKeywordResults: boolean = false;

  userQuery: UserQuery = {};
  channelQuery: ChannelQuery = {};
  keywordQuery: SquealQuery = {};

  userResults: User[] = [];
  channelResults: Channel[] = [];
  keywordResults: Squeal[] = [];

  loadMoreUsersButton: boolean = false;
  loadMoreChannelsButton: boolean = false;
  loadMoreSquealsButton: boolean = false;

  keyword: string = '';

  searchErrorShown: boolean = false;
  searchError: string = '';

  placeholder: string = 'Type username here...';

  testArray: string[] = ['test1', 'test2', 'test3'];
  constructor(
    private darkModeService: DarkModeService,
    private usersService: UsersService,
    private squealService: SquealsService,
    private channelsService: ChannelsService,
    private router: Router
  ) {
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    else if (localStorage.getItem('user') || sessionStorage.getItem('user')) {
      this.isGuest = true;
    } else {
      this.router.navigate(['/login']);
    } // Ask the server for the notifications with the specified ids
  }

  loadMoreUsers() {
    this.sendSearch(this.userResults[this.userResults.length - 1]._id as string, 'user-search');
  }
  loadMoreChannels() {
    this.sendSearch(this.channelResults[this.channelResults.length - 1]._id as string, 'channel-search');
  }
  loadMoreSqueals() {
    this.sendSearch(this.keywordResults[this.keywordResults.length - 1]._id as string, 'keyword-search');
  }

  triggerTest() {
    this.subscribed = !this.subscribed;
  }

  getDarkMode() {
    return this.darkModeService.getThemeClass();
  }

  sendSearch(last_loaded?: string, tab?: string) {
    this.loading = true;
    if (!last_loaded) {
      this.userResults = [];
      this.channelResults = [];
      this.keywordResults = [];
    }

    if ((tab == undefined && this.selectedOption === 'user-search') || (tab != undefined && tab === 'user-search')) {
      last_loaded ? this.createUserQuery(this.RESULT_LIMIT, last_loaded) : this.createUserQuery(this.RESULT_LIMIT);
      this.usersService
        .getUsers(this.userQuery)
        .then((users) => {
          users.length >= this.RESULT_LIMIT ? (this.loadMoreUsersButton = true) : (this.loadMoreUsersButton = false);
          users.forEach((user: User) => {
            this.userResults.push(user);
          });
          this.loading = false;

          this.showUserResults = true;
          this.showChannelResults = false;
          this.showKeywordResults = false;
          this.searchErrorShown = false;
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
          this.loadMoreUsersButton = false;
          this.searchError = err?.error?.error;
          if (err?.error?.error != undefined) this.searchErrorShown = true;
          else this.searchErrorShown = false;
        });
    } else if (
      (tab == undefined && this.selectedOption === 'channel-search') ||
      (tab != undefined && tab === 'channel-search')
    ) {
      last_loaded
        ? this.createChannelQuery(this.RESULT_LIMIT, last_loaded)
        : this.createChannelQuery(this.RESULT_LIMIT);
      this.channelsService
        .getChannels(this.channelQuery)
        .then((channels: Channel[]) => {
          channels.length >= this.RESULT_LIMIT
            ? (this.loadMoreChannelsButton = true)
            : (this.loadMoreChannelsButton = false);
          channels.forEach((channel: Channel) => {
            this.channelResults.push(channel);
          });

          this.loading = false;

          this.showUserResults = false;
          this.showChannelResults = true;
          this.showKeywordResults = false;
          this.searchErrorShown = false;
        })
        .catch((err: any) => {
          console.log(err);
          this.loading = false;
          this.loadMoreChannelsButton = false;
          this.searchError = err?.error?.error;
          if (err?.error?.error != undefined) this.searchErrorShown = true;
          else this.searchErrorShown = false;
        });
    } else if (
      (tab == undefined && this.selectedOption === 'keyword-search') ||
      (tab != undefined && tab === 'keyword-search')
    ) {
      last_loaded
        ? this.createKeywordQuery(this.RESULT_LIMIT, last_loaded)
        : this.createKeywordQuery(this.RESULT_LIMIT);
      this.squealService
        .getSqueals(this.keywordQuery)
        .then((squeals: Squeal[]) => {
          squeals.length >= this.RESULT_LIMIT
            ? (this.loadMoreSquealsButton = true)
            : (this.loadMoreSquealsButton = false);
          squeals.forEach((squeal: Squeal) => {
            this.keywordResults.push(squeal);
          });
          this.loading = false;

          this.showUserResults = false;
          this.showChannelResults = false;
          this.showKeywordResults = true;
          this.searchErrorShown = false;
        })
        .catch((err: any) => {
          console.log(err);
          this.loading = false;
          this.keyword = '';
          this.loadMoreSquealsButton = false;
          this.searchError = err?.error?.error;
          if (err?.error?.error != undefined) this.searchErrorShown = true;
          else this.searchErrorShown = false;
        });
    }
  }

  createUserQuery(pag_size?: number, last_loaded?: string) {
    this.userQuery = {};

    this.account_type != 'professional' ? (this.professional_type = 'none') : null;

    this.searchInput != '' ? (this.userQuery.username = this.searchInput.replace(this.nameFixRegex, '')) : null;
    this.created_before != null ? (this.userQuery.created_before = this.created_before.toString()) : null;
    this.created_after != null ? (this.userQuery.created_after = this.created_after.toString()) : null;
    this.max_squeals ? (this.userQuery.max_squeals = this.max_squeals) : null;
    this.min_squeals ? (this.userQuery.min_squeals = this.min_squeals) : null;
    this.account_type != 'none'
      ? (this.userQuery.account_type = this.account_type as AccountType)
      : (this.userQuery.account_type = undefined);
    this.professional_type != 'none'
      ? (this.userQuery.professional_type = this.professional_type as ProfessionalType)
      : null;
    this.sort_order != 'none' ? (this.userQuery.sort_order = this.sort_order as 'asc' | 'desc') : null;
    this.sort_by != 'none' ? (this.userQuery.sort_by = this.sort_by as 'username' | 'squeals' | 'date') : null;

    pag_size ? (this.userQuery.pag_size = pag_size) : (this.userQuery.pag_size = undefined);
    last_loaded ? (this.userQuery.last_loaded = last_loaded) : (this.userQuery.last_loaded = undefined);
  }

  createChannelQuery(pag_size?: number, last_loaded?: string) {
    this.channelQuery = {};

    this.searchInput != '' ? (this.channelQuery.name = this.searchInput.replace(this.nameFixRegex, '')) : null;
    this.created_before != null ? (this.channelQuery.created_before = this.created_before.toString()) : null;
    this.created_after != null ? (this.channelQuery.created_after = this.created_after.toString()) : null;
    this.max_subscribers ? (this.channelQuery.max_subscribers = this.max_subscribers) : null;
    this.min_subscribers ? (this.channelQuery.min_subscribers = this.min_subscribers) : null;
    this.max_squeals ? (this.channelQuery.max_squeals = this.max_squeals) : null;
    this.min_squeals ? (this.channelQuery.min_squeals = this.min_squeals) : null;
    this.is_official ? (this.channelQuery.is_official = this.is_official) : null;
    this.sort_order != 'none' ? (this.channelQuery.sort_order = this.sort_order as 'asc' | 'desc') : null;
    this.sort_by != 'none' ? (this.channelQuery.sort_by = this.sort_by as 'name' | 'squeals' | 'date') : null;

    pag_size ? (this.channelQuery.pag_size = pag_size) : (this.channelQuery.pag_size = undefined);
    last_loaded ? (this.channelQuery.last_loaded = last_loaded) : (this.channelQuery.last_loaded = undefined);
  }

  createKeywordQuery(pag_size?: number, last_loaded?: string) {
    this.keywordQuery = {};

    this.searchInput != '' ? (this.keywordQuery.keywords = this.extractKeywords(this.searchInput)) : null;
    this.content_type != 'none'
      ? (this.keywordQuery.content_type = this.content_type)
      : (this.keywordQuery.content_type = undefined);
    this.created_before != null ? (this.keywordQuery.created_before = this.created_before.toString()) : null;
    this.created_after != null ? (this.keywordQuery.created_after = this.created_after.toString()) : null;
    this.is_scheduled ? (this.keywordQuery.is_scheduled = this.is_scheduled) : null;
    this.min_reactions ? (this.keywordQuery.min_reactions = this.min_reactions) : null;
    this.max_balance ? (this.keywordQuery.max_balance = this.max_balance) : null;
    this.min_balance ? (this.keywordQuery.min_balance = this.min_balance) : null;
    this.sort_order != 'none' ? (this.keywordQuery.sort_order = this.sort_order as 'asc' | 'desc') : null;
    this.sort_by != 'none' ? (this.keywordQuery.sort_by = this.sort_by as 'date' | 'reactions' | 'balance') : null;
    this.is_official ? (this.keywordQuery.is_in_official_channel = this.is_official) : null;
    pag_size ? (this.keywordQuery.pag_size = pag_size) : (this.keywordQuery.pag_size = undefined);
    last_loaded ? (this.keywordQuery.last_loaded = last_loaded) : (this.keywordQuery.last_loaded = undefined);
  }

  extractKeywords(input: string): string[] {
    const regex = /#(\w+)/g;
    const matches = input.match(regex);

    if (matches) {
      let array = matches.map((match) => match.substring(1));
      this.keyword = array[0];
      return array;
    } else {
      return [];
    }
  }

  changePlaceholder(newPlaceholder: string) {
    this.placeholder = newPlaceholder;
  }

  visitUser(username: String) {
    this.router.navigate([`/profile/${username}`]);
  }
  visitChannel(channel: String) {
    this.router.navigate([`/channel/${channel}`]);
  }
  visitSqueal(squeal: String | undefined) {
    if (squeal) {
      this.router.navigate([`/squeal/${squeal}`]);
    }
  }
  visitKeyword() {
    this.router.navigate([`/keyword/${this.keyword}`]);
  }
  sendDM(user: String) {
    this.router.navigate([`/private-chats/user/${user}`]);
  }
  subscribeToChannel(channel: String, bool: boolean) {
    this.channelsService
      .subscribeToChannel(channel, bool)
      .then((res) => {
        let index = this.channelResults?.findIndex((chan) => chan._id === channel || chan.name === channel);
        if (index != -1) this.channelResults[index].subscription_status = bool;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
