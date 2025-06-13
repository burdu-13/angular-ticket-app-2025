import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from './shared/services/auth.service';
import { FooterComponent } from "./components/footer/footer.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title!: 'online-tickets';
  constructor(private authService:AuthService){}

  get statusLogIn(){
    return this.authService.getLoginStatus();
  }
}
