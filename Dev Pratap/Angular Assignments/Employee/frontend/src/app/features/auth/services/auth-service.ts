import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { env } from '../../../Environment';
import { ILogInRes, IlogInUser, IregisterUser } from '../auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient)

  logInHandler(data:IlogInUser){
    return this.http.post<ILogInRes>(`${env.URL}auth/login`,data)
  }

  registerHandler(data:IregisterUser){
    return this.http.post<ILogInRes>(`${env.URL}auth/register`,data)
  }
}
