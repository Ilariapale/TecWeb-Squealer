import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { TimeService } from 'src/app/services/time.service';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { User, AccountType, ProfessionalType } from 'src/app/models/user.interface';
import { Subscription, forkJoin, firstValueFrom, ObservableInput } from 'rxjs';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { SquealsService } from 'src/app/services/api/squeals.service';
import { Squeal } from 'src/app/models/squeal.interface';
import { Channel } from 'src/app/models/channel.interface';
import { ChannelsService } from 'src/app/services/api/channels.services';
@Component({
  selector: 'app-channel-manager',
  templateUrl: './channel-manager.component.html',
  styleUrls: ['./channel-manager.component.css'],
})
export class ChannelManagerComponent {
  /*
  export interface Channel {
  _id?: String;
  owner: String;
  editors: String[];
  name: String;
  description: String;
  is_official: boolean;
  can_mute: boolean;
  created_at: Date;
  squeals: String[];
  subscribers: String[];
  is_blocked: boolean;
}
  */
  isGuest = false;

  channelsOwnedIds: string[] = [];
  channelsEditorIds: string[] = [];

  channelsOwned: Channel[] = [];

  channelsEditor: Channel[] = [];
  username = 'User';

  newChannel = {
    name: '',
    description: '',
  };

  constructor(
    private route: ActivatedRoute,
    public timeService: TimeService,
    private usersService: UsersService,
    private userService: UserService,
    private squealsService: SquealsService,
    public darkModeService: DarkModeService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private channelsService: ChannelsService
  ) {
    firstValueFrom(this.userService.getUserData()).then((userData) => {
      if (userData.account_type === 'guest') {
        //this.isGuest = true;
        return;
      }
      console.log(userData);
      //this.isGuest = false;
      this.username = userData.username;

      this.usersService.getUser(this.username).subscribe({
        next: (user) => {
          console.log(user);
          this.channelsOwnedIds = user.owned_channels;
          this.channelsEditorIds = user.editor_channels;

          const channelsRequests = [
            ...this.channelsOwnedIds.map((channelId) => this.channelsService.getChannel(channelId)),
            ...this.channelsEditorIds.map((channelId) => this.channelsService.getChannel(channelId)),
          ];

          forkJoin(channelsRequests).subscribe({
            next: (channels) => {
              this.channelsOwned = channels.filter((channel) => this.channelsOwnedIds.includes(channel._id));
              this.channelsEditor = channels.filter((channel) => this.channelsEditorIds.includes(channel._id));
            },
            error: (err) => {
              console.error('Error fetching channels:', err);
            },
          });
        },
        error: (err) => {
          console.error('Error fetching user data:', err);
        },
      });
    });
  }

  createChannel() {
    this.channelsService.createChannel(this.newChannel.name, this.newChannel.description).subscribe({
      next: (channel) => {
        this.channelsOwnedIds.push(channel._id);
        this.channelsOwned.push(channel);
        this.newChannel.name = '';
        this.newChannel.description = '';
      },
      error: (err) => {
        console.error('Error creating channel:', err);
      },
    });
  }

  goToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }
  getDarkMode() {
    return this.darkModeService.getThemeClass();
  }

  getColor(is_blocked: boolean) {
    return is_blocked ? 'red' : 'green';
  }
}
