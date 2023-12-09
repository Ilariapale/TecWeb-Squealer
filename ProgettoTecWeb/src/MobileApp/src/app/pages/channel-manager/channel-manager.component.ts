import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
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
import { TagInputComponent } from 'src/app/widgets/tag-input/tag-input.component';
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
  @ViewChild('editorInput') editorComponent!: TagInputComponent;

  isGuest = false;

  channelsOwnedIds: string[] = [];
  channelsEditorIds: string[] = [];

  channelsOwned: Channel[] = [];
  channelsEditor: Channel[] = [];
  username = 'User';

  selectedChannel: Channel = {
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
  };
  selectedEditors: string[] = [];

  newChannel = {
    name: '',
    description: '',
  };
  //TODO quando l'utente non ha canali viene un errore Cannot read properties of undefined (reading 'map')
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
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    else if (localStorage.getItem('user') || sessionStorage.getItem('user')) {
      this.isGuest = true;
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    firstValueFrom(this.userService.getUserData()).then((userData) => {
      if (userData.account_type === 'guest') {
        //this.isGuest = true;
        return;
      }
      //this.isGuest = false;
      this.username = userData.username;
      this.usersService
        .getUser(this.username)
        .then((user) => {
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
        })
        .catch((err) => {
          console.error('Error fetching user data:', err);
        });
    });
  }

  createChannel() {
    this.channelsService
      .createChannel(this.newChannel.name, this.newChannel.description)
      .then((channel: any) => {
        this.channelsOwnedIds.push(channel._id);
        this.channelsOwned.push(channel);
        this.newChannel.name = '';
        this.newChannel.description = '';
      })
      .catch((err: any) => {
        console.error('Error creating channel:', err);
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

  selectChannel(channel: Channel) {
    this.selectedChannel = JSON.parse(JSON.stringify(channel));
    this.selectedEditors = [];
    //richiesta per ottenere i nomi degli editor
    //ottengo lo username dell'owner
    console.log(this.selectedChannel);
    this.usersService
      .getUsername(this.selectedChannel.owner as string)
      .then((owner: any) => {
        this.selectedChannel.owner = owner.username;
      })
      .catch((err: any) => {
        console.error('Error fetching owner:', err);
      });
    const editorsRequests = this.selectedChannel.editors.map((editorId) =>
      this.usersService.getUsername(editorId as string)
    );
    forkJoin(editorsRequests).subscribe({
      next: (editors) => {
        this.selectedEditors = editors.map((editor) => editor.username);
      },
      error: (err) => {
        console.error('Error fetching editors:', err);
      },
    });
  }

  updateOwnedChannel() {
    //prendo il canale dall'array tramite l'id di quello updetato
    const oldChannel = this.channelsOwned.find((channel) => channel._id === this.selectedChannel._id);
    const updatedChannel = this.selectedChannel;
    const newEditors = this.editorComponent.getTags();

    const body: any = {
      identifier: updatedChannel._id,
    };

    if (oldChannel?.name !== updatedChannel.name) body.new_name = updatedChannel.name;
    if (oldChannel?.description !== updatedChannel.description) body.new_description = updatedChannel.description;
    if (oldChannel?.owner !== updatedChannel.owner) body.new_owner = updatedChannel.owner;
    if (oldChannel?.editors !== newEditors) body.editors_array = newEditors;

    this.channelsService
      .updateChannel(body)
      .then((channel: any) => {
        console.log(channel);
        this.channelsOwned = this.channelsOwned.map((channel) => {
          if (channel._id === updatedChannel._id) {
            return channel;
          }
          return channel;
        });
      })
      .catch((err: any) => {
        console.error('Error updating channel:', err);
      });
  }
  updateEditorChannel() {}
}
