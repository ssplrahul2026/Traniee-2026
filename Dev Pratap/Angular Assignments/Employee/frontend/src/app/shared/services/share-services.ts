import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, single, tap } from 'rxjs';
import { IAssignUser } from '../shareModule';
import { HttpClient } from '@angular/common/http';
import { env } from '../../Environment';
import { TodoTask } from '../components/home/home';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

export interface UserInfo {
  userId: number;
  FullName: string;
  email: string;
}

export interface Task {
  taskId: number;
  title: string;
  description: string;
  assignedToUserId: number;
  assignedByUserId: number;
  status: string;
  dueDate: string;
  createdDate: string;
  updatedDate: string;
  Assignee: UserInfo;
  Creator: UserInfo;
}

export interface GetTasksResponse {
  success: boolean;
  filterUsed: string;
  count: number;
  data: TodoTask[];
}



@Injectable({
  providedIn: 'root',
})



export class ShareServices {
  userDetails = signal<IAssignUser | null>(null)
  http = inject(HttpClient)
  todos = signal<TodoTask[]>([]);
  snackBar = inject(MatSnackBar)
  router = inject(Router)

  fetchTodos(): void {
    if(this.userDetails()){
      this.getMyTask().subscribe({
      next: (res) => {
        this.todos.set(res.data);
      }
    });
    }
  }


  assignUser(token: string | null): void {
    if (!token) {
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          localStorage.clear();
          return;
        }

        this.getNewAccessToken(refreshToken).subscribe({
          next: (res) => {
            localStorage.setItem('accessToken', res.accessToken);

            const newPayload = JSON.parse(
              atob(res.accessToken.split('.')[1])
            );

            this.userDetails.set(newPayload);
          },
          error: (err) => {
            console.error('Refresh token failed', err);
            localStorage.clear()
          }
        });

        return;
      }

      this.userDetails.set(payload);

    } catch (error) {
      console.error('Invalid token', error);
      localStorage.clear()
    }
  }

  getNewAccessToken(refreshToken: string) {
    return this.http.post<{ accessToken: string, refreshToken: string }>(`${env.URL}auth/refresh`, { refreshToken })
  }

  getMyTask() {
    return this.http.get<GetTasksResponse>(`${env.URL}task/user/${this.userDetails()!.userId}`)
  }

  logout(refreshToken: string): Observable<any> {
  return this.http.post<{ message: string, success: boolean }>(
    `${env.URL}auth/logout`, 
    { refreshToken }
  ).pipe(
    tap(() => {
      this.clearSessionAndRedirect();
    }),
    catchError((error) => {
      console.error('Backend logout failed, clearing local session anyway', error);
      this.clearSessionAndRedirect();
      return of(null); 
    })
  );
}

private clearSessionAndRedirect(): void {
  localStorage.clear();
  this.userDetails.set(null); // Clear your Signals / State
  this.router.navigate(['auth/login']);
}

  snakeBarFunc(message: string) {
    return this.snackBar.open(
      message,
      'Close',
      {
        duration: 3000
      }
    );
  }
}
