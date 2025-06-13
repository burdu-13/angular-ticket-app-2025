import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000';
  loggedInUser = signal<User | null>(null);
  loggedInStatus = signal(false);
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreSession();
  }



  onRegister(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, user).pipe(
      catchError((err) => {
        throw err;
      })
    );
  }

onLogin(username: string, password: string): Observable<{ user: User, token: string }> {
  return this.http.post<{ user: User, token: string }>(`${this.apiUrl}/login`, { username, password }).pipe(
    tap(({ user, token }) => {
      this.loggedInUser.set(user);
      this.loggedInStatus.set(true);
      sessionStorage.setItem('loggedInUser', JSON.stringify(user));
      sessionStorage.setItem('loggedInStatus', 'true');
      sessionStorage.setItem('authToken', token);
      this.userSubject.next(user);
    }),
    catchError((err) => {
      throw err;
    })
  );
}

  
  onLogout() {
    this.loggedInUser.set(null);
    this.loggedInStatus.set(false);
    sessionStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('loggedInStatus');
    sessionStorage.removeItem('token');
    this.userSubject.next(null);
  }

  getLoggedInUser(): User | null {
    const storedUser = sessionStorage.getItem('loggedInUser');
    const user = storedUser ? JSON.parse(storedUser) : null;
    return user;
  }

  getLoginStatus(): boolean {
    return this.loggedInStatus();
  }

  private restoreSession() {
    const storedUser = sessionStorage.getItem('loggedInUser');
    const storedStatus = sessionStorage.getItem('loggedInStatus');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.loggedInUser.set(JSON.parse(storedUser));
      this.userSubject.next(user);
    }
    if (storedStatus === 'true') {
      this.loggedInStatus.set(true);
    }
  }


  updateUser(userData: Partial<User>): Observable<User> {
    const currentUser = this.getLoggedInUser();
    if (!currentUser) {
      throw new Error('User is not logged in');
    }
  
    const userId = currentUser._id;
    const token = sessionStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, userData, { headers }).pipe(
      tap((updatedUser) => {
        this.loggedInUser.set(updatedUser);
        this.userSubject.next(updatedUser);
  
        sessionStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
      })
    );
  }
  
  
}
