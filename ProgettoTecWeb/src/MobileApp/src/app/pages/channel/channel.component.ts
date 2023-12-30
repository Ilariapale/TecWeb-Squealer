import { Channel } from 'src/app/models/channel.interface';
import { TimeService } from 'src/app/services/time.service';
import { Squeal } from 'src/app/models/squeal.interface';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { forkJoin } from 'rxjs';
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
    _id: '',
    owner: '',
    editors: [],
    name: '',
    description: '',
    is_official: false,
    can_mute: true,
    created_at: new Date(),
    squeals: [],
    subscribers: [],
    is_blocked: false,
    is_muted_by_user: false,
  };

  squeals: Squeal[] = [];

  bannerClass = '';
  muted: boolean = false;
  isGuest: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public timeService: TimeService,
    private squealsService: SquealsService,
    public darkModeService: DarkModeService,
    private channelsService: ChannelsService,
    private location: Location
  ) {
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    else if (localStorage.getItem('Guest_Authorization')) this.isGuest = true;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.identifier = params.get('identifier') || '';

      if (this.identifier) {
        this.channelsService
          .getChannel(this.identifier)
          .then(async (channel: any) => {
            this.channel = channel;

            this.loading = true;
            this.lastSquealLoaded = channel.squeals && channel.squeals.length > 0 ? channel.squeals.length - 1 : -1;
            const squealsRequests = [];

            for (let i = this.lastSquealLoaded; i > this.lastSquealLoaded - this.MAX_SQUEALS && i >= 0; i--) {
              squealsRequests.push(this.squealsService.getSqueal(channel.squeals[i], this.isGuest));
            }
            if (squealsRequests.length > 0) {
              const squeals = await Promise.all(squealsRequests);
              squeals.forEach((squeal) => {
                this.squeals.push(squeal[0]); // Add the new squeal at the beginning of the array
              });
              this.lastSquealLoaded -= this.MAX_SQUEALS;
            }
            this.loading = false;
          })
          .catch((error: any) => {
            console.log(error);
          });
      }
    });
  }

  toggleMute() {
    this.channelsService
      .setMuteStatus(this.channel._id || '', !this.channel.is_muted_by_user)
      .then((response) => {
        this.channel.is_muted_by_user = !this.channel.is_muted_by_user;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  subscribeToChannel(channel: String, bool: boolean) {
    this.channelsService
      .subscribeToChannel(channel, bool)
      .then((res) => {
        this.channel.subscription_status = bool;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  loadMoreSqueals() {
    this.loading = true;
    const squealsRequests = [];
    for (let i = this.lastSquealLoaded; i > this.lastSquealLoaded - this.MAX_SQUEALS; i--) {
      const squeal_id = this.channel?.squeals?.[i];
      if (squeal_id) squealsRequests.push(this.squealsService.getSqueal(squeal_id, this.isGuest));
    }
    this.lastSquealLoaded -= this.MAX_SQUEALS;
    forkJoin(squealsRequests).subscribe((squeals) => {
      squeals.forEach((squeal) => {
        this.squeals.push(squeal[0]);
      });
    });
    this.loading = false;
  }
  goBack(): void {
    this.location.back();
  }

  removeSqueal(squeal: Squeal) {
    //remove a squeal from channel.squeals
    const newChannelsArray = squeal.recipients?.channels?.filter((channel_id) => {
      channel_id !== this.channel._id?.toString();
    });
    let body = {
      channels: newChannelsArray,
    };
    this.squealsService
      .updateSqueal(squeal?._id || '', body)
      .then((response) => {
        const index = this.squeals.indexOf(squeal);
        if (index > -1) this.squeals.splice(index, 1);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getDarkMode() {
    return this.darkModeService.getThemeClass();
  }
}
