import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { CardComponent } from './card/card.component';
import { FooterComponent } from '../footer/footer.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, CardComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  currentUserName$!: Observable<string | undefined>;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUserName$ = new Observable((observer) => {
      observer.next(this.authService.getLoggedInUser()?.name);
    });
  }

  get statusLogIn(): boolean {
    return this.authService.getLoginStatus();
  }
}
