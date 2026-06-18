import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ShareServices } from '../../../../shared/services/share-services';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-log-in',
  imports: [FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {
  loginData!: FormGroup;
  fb = inject(FormBuilder)


  snackBar = inject(MatSnackBar)


  ngOnInit(): void {
    this.loginData = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  }
  authService = inject(AuthService)
  shareService = inject(ShareServices)
  router = inject(Router)

  onLogin() {
    try {
      this.authService.logInHandler(this.loginData.value).subscribe({
        next: (res) => {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          this.shareService.assignUser(res.accessToken)
          this.router.navigate(["/dashboard"])
        },

        error: (err) => {
          console.error('Login failed', err);
          if (err.status === 401) {
            this.snackBar.open(
              'Invalid email or password',
              'Close',
              {
                duration: 3000
              }
            );
          } else if (err.status === 500) {
            console.log('Server error');
          } else {
            console.log('Something went wrong');
          }
        },
      });
    } catch (error) {
      alert(error)
    }

  }
}
