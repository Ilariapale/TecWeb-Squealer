import { Channel } from 'src/app/models/channel.interface';
import { TimeService } from 'src/app/services/time.service';
import { Squeal, ContentType, Recipients } from 'src/app/models/squeal.interface';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { User, AccountType, ProfessionalType } from 'src/app/models/user.interface';
import { Subscription, forkJoin } from 'rxjs';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { SquealsService } from 'src/app/services/api/squeals.service';
import { ChannelsService } from 'src/app/services/api/channels.services';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css'],
})
export class ChannelComponent {
  identifier: string = '';
  loading: boolean = false;
  lastSquealLoaded = -1;
  MAX_SQUEALS = 5;
  channel: Channel = {
    _id: '123456789012345678901234',
    owner: '123456789012345678901234',
    editors: ['123456789012345678901234', '123456789012345678901234'],
    name: 'channel name',
    description: 'channel description',
    is_official: false,
    can_mute: true,
    created_at: new Date(),
    squeals: ['123456789012345678901234', '123456789012345678901234'],
    subscribers: ['123456789012345678901234', '123456789012345678901234'],
    is_blocked: false,
  };

  squeals: Squeal[] = [];

  bannerClass = '';
  muted: boolean = false;

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
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.identifier = params.get('identifier') || '';

      if (this.identifier) {
        this.channelsService.getChannel(this.identifier).subscribe({
          next: (channel) => {
            this.channel = channel;

            this.loading = true;
            this.lastSquealLoaded = channel.squeals && channel.squeals.length > 0 ? channel.squeals.length - 1 : 0;
            const squealsRequests = [];

            for (let i = this.lastSquealLoaded; i > this.lastSquealLoaded - this.MAX_SQUEALS && i >= 0; i--) {
              squealsRequests.push(this.squealsService.getSqueal(channel.squeals[i]));
            }

            if (squealsRequests.length > 0) {
              forkJoin(squealsRequests).subscribe((squeals) => {
                squeals.forEach((squeal) => {
                  this.squeals.push(squeal[0]); // Aggiungi il nuovo squeal all'inizio dell'array
                });
              });
              this.lastSquealLoaded -= this.MAX_SQUEALS;
            }
            this.loading = false;
          },
          error: (error) => {},
        });
      }
    });
  }

  toggleMute() {
    this.muted = !this.muted;
  }

  loadMoreSqueals() {
    this.loading = true;
    const squealsRequests = [];
    for (let i = this.lastSquealLoaded; i > this.lastSquealLoaded - this.MAX_SQUEALS; i--) {
      const squeal_id = this.channel?.squeals?.[i];
      if (squeal_id) squealsRequests.push(this.squealsService.getSqueal(squeal_id));
    }
    this.lastSquealLoaded -= this.MAX_SQUEALS;
    forkJoin(squealsRequests).subscribe((squeals) => {
      squeals.forEach((squeal) => {
        this.squeals.push(squeal[0]);
      });
    });
    this.loading = false;
  }
}

/*

export enum ContentType {
  text = 'text',
  image = 'image',
  video = 'video',
  position = 'position',
  deleted = 'deleted',
}

export interface Recipients {
  users: string[];
  channels: string[];
  keywords: string[];
}

export interface Squeal {
  _id?: string;
  hex_id?: Number;
  user_id?: String;
  username?: String;
  is_scheduled?: Boolean;
  content_type?: ContentType;
  content?: String;
  recipients?: Recipients;
  created_at?: Date;
  last_modified?: Date;
  comment_section?: string;
  reactions?: {
    positive_reactions?: Number;
    negative_reactions?: Number;
    like?: Number;
    love?: Number;
    laugh?: Number;
    dislike?: Number;
    disgust?: Number;
    disagree?: Number;
  };
  is_in_official_channel?: Boolean;
  impressions?: Number;
  comments_count?: Number;
}

*/
