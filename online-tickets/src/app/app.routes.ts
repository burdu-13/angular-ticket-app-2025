import { Routes } from '@angular/router';
import { RegisterComponent } from './components/auth/register/register.component';
import { AuthComponent } from './components/auth/auth.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AboutComponent } from './components/about/about.component';
import { HomeComponent } from './components/home/home.component';
import { EventsComponent } from './components/events/events.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: 'login', component: LoginComponent,},
      { path: 'register', component: RegisterComponent,},
      {path: 'about', component:AboutComponent,}
    ],
  },
  { path: 'about', component: AboutComponent},
  { path: 'homepage', component: HomeComponent,},
  { path: 'events', component: EventsComponent,},
  {path: 'profile', component: ProfileComponent},
  {path:'dashboard',component: DashboardComponent}
];

