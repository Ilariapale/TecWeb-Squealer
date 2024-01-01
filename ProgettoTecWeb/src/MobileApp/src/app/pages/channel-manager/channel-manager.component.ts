import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TimeService } from 'src/app/services/time.service';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { forkJoin } from 'rxjs';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { Channel } from 'src/app/models/channel.interface';
import { ChannelsService } from 'src/app/services/api/channels.services';
import { TagInputComponent } from 'src/app/widgets/tag-input/tag-input.component';
@Component({
  selector: 'app-channel-manager',
  templateUrl: './channel-manager.component.html',
  styleUrls: ['./channel-manager.component.css'],
})
export class ChannelManagerComponent {
  @ViewChild('editorInput1') editorComponent1!: TagInputComponent;
  @ViewChild('editorInput2') editorComponent2!: TagInputComponent;
  isGuest = false;

  successCreation: string = '';
  errorCreation: string = '';

  errorMessage: string = '';
  successMessage: string = '';

  channelsOwnedIds: string[] = [];
  channelsEditorIds: string[] = [];

  channelsOwned: Channel[] = [];
  channelsEditor: Channel[] = [];
  username = 'User';
  is_official = false;
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
  channelToDelete: String = '';
  constructor(
    public timeService: TimeService,
    private usersService: UsersService,
    private userService: UserService,
    public darkModeService: DarkModeService,
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
    const userData = this.userService.getUserData();
    if (userData.account_type === 'guest') {
      this.isGuest = true;
      return;
    }
    this.isGuest = false;
    this.username = userData.username;
    this.usersService
      .getUser(this.username)
      .then((user) => {
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
            console.log('Error fetching channels:', err);
          },
        });
      })
      .catch((err) => {
        console.log('Error fetching user data:', err);
      });
  }

  createChannel() {
    this.resetMessages();
    this.channelsService
      .createChannel(this.newChannel.name, this.newChannel.description, this.is_official)
      .then((channel: any) => {
        this.channelsOwnedIds.push(channel._id);
        this.channelsOwned.push(channel);
        this.newChannel.name = '';
        this.newChannel.description = '';
        this.errorCreation = '';
        this.successCreation = 'Channel created successfully';
      })
      .catch((err: any) => {
        this.successCreation = '';
        this.errorCreation = 'Error creating channel: ' + err.error?.error;
        console.log('Error creating channel:', err);
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
    this.resetMessages();

    this.selectedChannel = JSON.parse(JSON.stringify(channel));
    this.selectedEditors = [];
    // Request to get the names of the editors
    // Get the username of the owner
    this.selectedChannel.owner = '';
    const editorsRequests = this.selectedChannel.editors.map((editorId) =>
      this.usersService.getUsername('' + editorId)
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
    this.resetMessages();
    // Get the channel from the array using the id of the updated one
    const oldChannel = this.channelsOwned.find((channel) => channel._id === this.selectedChannel._id);
    const updatedChannel = this.selectedChannel;
    const newEditors = this.editorComponent1.getTags();

    const body: any = {
      identifier: updatedChannel._id,
    };

    if (oldChannel?.name !== updatedChannel.name) body.new_name = updatedChannel.name;
    if (oldChannel?.description !== updatedChannel.description) body.new_description = updatedChannel.description;
    if (oldChannel?.owner !== updatedChannel.owner && updatedChannel.owner != '') body.new_owner = updatedChannel.owner;
    if (oldChannel?.editors !== newEditors) body.editors_array = newEditors;

    this.channelsService
      .updateChannel(body)
      .then((channel: any) => {
        this.channelsOwned = this.channelsOwned.map((channel) => {
          if (channel._id === updatedChannel._id) {
            return updatedChannel;
          }
          return channel;
        });
        this.errorMessage = '';
        this.successMessage = 'Channel updated successfully';
      })
      .catch((err: any) => {
        this.successMessage = '';
        this.errorMessage = 'Error updating channel: ' + err.error?.error;
        console.log(err);
      });
  }

  resetMessages() {
    this.errorMessage = '';
    this.successMessage = '';
    this.errorCreation = '';
    this.successCreation = '';
  }

  updateEditorChannel() {
    this.resetMessages();
    const oldChannel = this.channelsEditor.find((channel) => channel._id === this.selectedChannel._id);
    const updatedChannel = this.selectedChannel;
    const newEditors = this.editorComponent2.getTags();
    const body: any = {
      identifier: updatedChannel._id,
    };

    if (oldChannel?.name !== updatedChannel.name) body.new_name = updatedChannel.name;
    if (oldChannel?.description !== updatedChannel.description) body.new_description = updatedChannel.description;
    if (oldChannel?.editors !== newEditors) body.editors_array = newEditors;

    this.channelsService
      .updateChannel(body)
      .then((channel: any) => {
        this.channelsEditor = this.channelsEditor.map((channel) => {
          if (channel._id === updatedChannel._id) {
            return updatedChannel;
          }
          return channel;
        });
        this.errorMessage = '';
        this.successMessage = 'Channel updated successfully';
      })
      .catch((err: any) => {
        this.successMessage = '';
        this.errorMessage = 'Error updating channel: ' + err.error?.error;
      });
  }

  selectChannelToDelete(channel: String) {
    this.resetMessages();
    this.channelToDelete = channel;
  }

  deleteChannel() {
    this.channelsService
      .deleteChannel(this.channelToDelete)
      .then((channel: any) => {
        this.channelsOwned = this.channelsOwned.filter((channel) => channel._id !== this.channelToDelete);
      })
      .catch((err: any) => {
        if (err.status == 404) {
          this.channelsOwned = this.channelsOwned.filter((channel) => channel._id !== this.channelToDelete);
        }
        console.error('Error deleting channel:', err);
      });
  }
}
