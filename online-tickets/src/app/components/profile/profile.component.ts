import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../shared/models/user.model';
import { CompanyService } from '../../shared/services/company.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  editProfile!: FormGroup;
  addCompany!: FormGroup;
  showPassword = false;

  constructor(private authService: AuthService, private fb: FormBuilder, private companyService:CompanyService) {}

  ngOnInit(): void {
    const user = this.authService.getLoggedInUser();
    this.editProfile = this.fb.group({
      name: [user?.name || '', Validators.required],
      birthdate: [user?.birthdate || '', Validators.required],
      password: ['', Validators.required],
    });

    this.addCompany = this.fb.group({
      companyName: ['', Validators.required],
      employeeEmail: ['', [Validators.required, Validators.email]],
      employeeName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  updateUserData(): void {
    if (this.editProfile.valid) {
      const updatedUserData: Partial<User> = this.editProfile.value;
      this.authService.updateUser(updatedUserData).subscribe({
        next: (response: User) => {
          alert('Profile updated successfully');
        }
      });
    }
  }
  

  get loggedUserName() {
    return this.authService.getLoggedInUser()?.name;
  }

  get loggedUserDate() {
    return this.authService.getLoggedInUser()?.birthdate;
  }

  get loggedUserPassword(){
    return this.authService.getLoggedInUser()?.password;
  }

  get loggedUserType() {
    return this.authService.getLoggedInUser()?.userType;
  }
  get statusLogIn() {
    return this.authService.getLoginStatus();
  }

  registerCompany(): void {
    if (this.addCompany.valid) {
      this.companyService.onRegisterCompany(this.addCompany.value).subscribe({
        next: (response) => {
          alert('Company registered successfully');
        },
        error: (error) => {
          alert('Error registering company');
        }
      });
    } else {
      alert('Please fill in all required fields');
    }
  }
  
}
