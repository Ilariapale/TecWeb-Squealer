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
import { ReactionsMenuComponent } from './widgets/reactions-menu/reactions-menu.component';
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
  { path: 'search', component: SearchComponent },
  { path: 'store', component: StoreComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'private-chats', component: ChatsComponent },
  { path: 'private-chats/user/:id/:recipient', component: ChatComponent },
  { path: 'chat', component: ChatComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
