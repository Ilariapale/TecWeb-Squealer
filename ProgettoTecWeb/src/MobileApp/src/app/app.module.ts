import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SignupComponent } from './pages/signup/signup.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { MapComponent } from './widgets/map/map.component';
import { ReactionsMenuComponent } from './widgets/reactions-menu/reactions-menu.component';
import { SquealComponent } from './widgets/squeal/squeal.component';
import { SquealFormComponent } from './widgets/squeal-form/squeal-form.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TagInputComponent } from './widgets/tag-input/tag-input.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SearchComponent } from './pages/search/search.component';
import { StoreComponent } from './pages/store/store.component';
import { NavbarComponent } from './widgets/navbar/navbar.component';
import { FooterComponent } from './widgets/footer/footer.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ChatsComponent } from './pages/chats/chats.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ChannelComponent } from './pages/channel/channel.component';
import { ErrorComponent } from './pages/error/error.component';
import { ChannelManagerComponent } from './pages/channel-manager/channel-manager.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { KeywordComponent } from './pages/keyword/keyword.component';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    HomeComponent,
    LoginComponent,
    MapComponent,
    ReactionsMenuComponent,
    SquealComponent,
    SquealFormComponent,
    TagInputComponent,
    ProfileComponent,
    SearchComponent,
    StoreComponent,
    NavbarComponent,
    FooterComponent,
    NotificationsComponent,
    ChatsComponent,
    ChatComponent,
    ChannelComponent,
    ErrorComponent,
    ChannelManagerComponent,
    ResetPasswordComponent,
    KeywordComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
