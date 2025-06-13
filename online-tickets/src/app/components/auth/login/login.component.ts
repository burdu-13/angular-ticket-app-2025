import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgStyle],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  statusLogIn: boolean = false;
  form = new FormGroup({
    username: new FormControl('', { validators: [Validators.required] }),
    password: new FormControl('', { validators: [Validators.required] }),
  });
  errorMessage!: string;
  isSubmitted = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitted = true;
      const { username, password } = this.form.value;

      this.authService.onLogin(username!, password!).pipe(
        catchError((error) => {
          this.errorMessage = 'error';
          this.isSubmitted = false;
          return of(null);
        })
      ).subscribe(response => {
        if (response) {
          this.router.navigate(['/homepage']);
          console.log('Login successful!');
        } else {
          this.errorMessage = 'Invalid Credentials!';
          this.isSubmitted = false;
        }
      });
    }
  }
}
