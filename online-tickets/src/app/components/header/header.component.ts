import { Component, signal } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink,AsyncPipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  userRole = signal('');
  loggedUserName$!: Observable<string>;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.loggedUserName$ = this.authService.user$.pipe(
      map(user => user?.name || "Default")
    );
  }

  checkLoginStatus() {
    const loggedInUser = this.authService.getLoggedInUser();
    if (loggedInUser) {
      this.userRole.set(loggedInUser.userType);
    }
  }

  onLogout() {
    this.authService.onLogout();
    this.userRole.set('');
    this.router.navigate(['/login']);
  }

  navigateToPage() {
    if (!this.statusLogIn) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/homepage']);
    }
  }

  get loggedUserName() {
    return this.authService.getLoggedInUser()?.name;
  }

  get loggedUserType() {
    return this.authService.getLoggedInUser()?.userType;
  }

  

  get statusLogIn() {
    return this.authService.getLoginStatus();
  }
}
