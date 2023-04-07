import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse } from '../models/authResponse';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private signUpUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=";
  private signInUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=";
  private api_key = "AIzaSyAaMGan-iodTa_PGsQP34x0pI3rrA6_n10";
  user = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient, private router: Router) { }

  signUp(email: string, password: string) {
    return this.http.post<AuthResponse>(this.signUpUrl + this.api_key, {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(
      tap(response => {
        this.handleAuthhentication(response.email, response.localId, response.idToken, +response.expiresIn);

      }),
    );
  }
  login(email: string, password: string) {
    return this.http.post<AuthResponse>(this.signInUrl + this.api_key, {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(
      tap(response => {
        this.handleAuthhentication(response.email, response.localId, response.idToken, +response.expiresIn);
      }),
    );;
  }
  logout() {
    this.user.next(null);
    localStorage.removeItem('user');
    this.router.navigate(['/auth']);
  }
  autoLogin() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      return;
    }
    const loadedUser = new User(
      user.email,
      user.id,
      user._token,
      new Date(user._tokenExpirationDate)
    );
    if (loadedUser.getToken) {
      this.user.next(loadedUser);
    }
  }

  handleAuthhentication(email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + (expiresIn * 1000));

    const user = new User(
      email,
      userId,
      token,
      expirationDate
    );

    this.user.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

}

