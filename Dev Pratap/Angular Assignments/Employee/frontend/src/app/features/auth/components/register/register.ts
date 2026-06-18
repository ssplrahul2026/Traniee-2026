import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { IregisterUser } from '../../auth.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm!: FormGroup;
  fb = inject(FormBuilder)
  snakeBar = inject(MatSnackBar)

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],

    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    const confirmControl = control.get('confirmPassword');

    // Set error on the control itself so the view can detect it easily
    if (password !== confirmPassword) {
      confirmControl?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Clear errors if they match (while preserving other validation errors if any)
      if (confirmControl?.hasError('passwordMismatch')) {
        confirmControl.setErrors(null);
      }
      return null;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }


  authService = inject(AuthService)
  router = inject(Router)

  onRegister() {
    const registerData: IregisterUser = {
      fullName: this.registerForm.value?.fullName,
      email: this.registerForm.value?.email,
      password: this.registerForm.value?.password,
    };

    this.authService.registerHandler(registerData).subscribe({
      next: (res) => {
        this.snakeBar.open(
          'User Created successful',
          'Close',
          {
            duration: 3000
          }
        );
        // alert();
        this.router.navigate(["/auth/login"])
      },

      error: (err) => {
        console.error('Login failed', err);

        if (err.status === 500) {
          console.log('Server error');
        } else if (err.status === 409) {
          alert('user exists');
        } else {
          console.log('Something went wrong');
        }
      },
    })
  }
}


