import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { v4 } from 'uuid';
import { NgStyle } from '@angular/common';
import { passwordMatchValidator } from './passwordMatch.validator';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgStyle],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  constructor(private authService: AuthService) {}

  form = new FormGroup(
    {
      name: new FormControl('', {
        validators: [Validators.required],
      }),
      username: new FormControl('', {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      birthdate: new FormControl('', { validators: [Validators.required] }),
      password: new FormControl('', {
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern('.*[!@#$%^&*()].*'),
        ],
      }),
      confirmPassword: new FormControl('', {
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern('.*[!@#$%^&*()].*'),
        ],
      }),
      userType: new FormControl('Customer'),
    },
    { validators: passwordMatchValidator() }
  );
  registerStatus = false;

  get nameIsInvalid() {
    return this.form.controls.name.touched && this.form.controls.name.invalid;
  }

  get usernameIsInvalid() {
    return (
      this.form.controls.username.touched && this.form.controls.username.invalid
    );
  }

  get dateIsInvalid() {
    return (
      this.form.controls.birthdate.touched &&
      this.form.controls.birthdate.invalid
    );
  }

  get passwordIsInvalid() {
    return (
      this.form.controls.password.touched && this.form.controls.password.invalid
    );
  }

  get confirmPasswordIsInvalid() {
    return (
      this.form.controls.confirmPassword.touched &&
      this.form.controls.confirmPassword.invalid
    );
  }

  get specialCharCheck() {
    return (
      this.form.get('password')?.hasError('pattern') &&
      this.form.get('password')?.touched
    );
  }

  get passwordMismatch() {
    return (
      this.form.hasError('mismatch') &&
      this.form.get('confirmPassword')?.touched
    );
  }

  onSubmit() {
    const enteredName = this.form.value.name as string;
    const enteredUsername = this.form.value.username as string;
    const enteredDate = this.form.value.birthdate as string;
    const enteredPassword = this.form.value.password as string;
    const enteredConfirmpassword = this.form.value.confirmPassword as string;
    const userType = this.form.value.userType as string;

    const userData = {
      _id: v4(),
      name: enteredName,
      username: enteredUsername,
      birthdate: enteredDate,
      password: enteredPassword,
      userType: userType,
    };

    this.authService.onRegister(userData).subscribe(
      (response) => {
        this.registerStatus = true;
        console.log('User registered successfully:', response);
        this.form.reset();
        this.form.controls['userType'].setValue('Customer');
      },
      (error) => {
        console.error('Registration failed:', error);
      }
    );
  }
}
