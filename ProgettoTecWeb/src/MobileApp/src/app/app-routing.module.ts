import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { SignupComponent } from './pages/signup/signup.component';
import { MapComponent } from './widgets/map/map.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SearchComponent } from './pages/search/search.component';
import { StoreComponent } from './pages/store/store.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ChatsComponent } from './pages/chats/chats.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ChannelComponent } from './pages/channel/channel.component';
import { ReactionsMenuComponent } from './widgets/reactions-menu/reactions-menu.component';
import { SquealComponent } from './widgets/squeal/squeal.component';
import { ErrorComponent } from './pages/error/error.component';
//import { PageLayoutComponent } from './pages/page-layout/page-layout.component';

const routes: Routes = [
  //redirect the empty path to the home page
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  //redirect the empty path to the login page
  //{ path: '', component: PageLayoutComponent, children: [{ path: '', component: HomeComponent }] },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'map', component: MapComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'profile/:identifier', component: ProfileComponent },
  { path: 'search', component: SearchComponent },
  { path: 'store', component: StoreComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'private-chats', component: ChatsComponent },
  { path: 'private-chats/user/:id/:recipient', component: ChatComponent },
  { path: 'private-chats/user/:user', component: ChatComponent },
  { path: 'channel/:identifier', component: ChannelComponent },
  { path: 'squeal/:identifier', component: SquealComponent },
  { path: 'error/:code', component: ErrorComponent },
  // { path: 'chat', component: ChatsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
