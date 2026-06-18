import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin-service';
import { ShareServices } from '../../../../shared/services/share-services';

export interface Role {
  roleName: string;
}

export interface Employee {
  userId: number;
  FullName: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
  Roles: Role[];
}
export interface Employee2 {
  userId: number;
  fullName: string;
  email: string;
  isActive: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
  Roles: Role[];
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css']
})
export class EmployeeList implements OnInit {
  adminService = inject(AdminService);
  employees = signal<Employee[] | null>(null);
  shareService = inject(ShareServices)

  employeeForm!: FormGroup;
  isModalOpen = false;
  isEditing = false;
  currentEmployeeId: number | null = null;
  
  private currentEmployeeMeta: { passwordHash: string; CreatedAt: string } | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.adminService.updateEmpSingnal();
  }

 

  initForm(): void {
    this.employeeForm = this.fb.group({
      userId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      isActive: [true, [Validators.required]],
      isAdmin: [false],
      isManager: [false]
    });
  }


  openEditModal(employee: Employee): void {
    this.isEditing = true;
    this.currentEmployeeId = employee.userId;
    

    this.currentEmployeeMeta = {
      passwordHash: employee.passwordHash,
      CreatedAt: employee.CreatedAt
    };

    const roles = employee.Roles || [];
    const hasAdmin = roles.some(r => r.roleName === 'Admin');
    const hasManager = roles.some(r => r.roleName === 'Manager');

    this.employeeForm.setValue({
      userId: employee.userId,
      name: employee.FullName,
      email: employee.email,
      isActive: employee.isActive,
      isAdmin: hasAdmin,
      isManager: hasManager
    });
    
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.employeeForm.reset();
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const formValues = this.employeeForm.value;

    const reconstructedRoles: Role[] = [];
    if (formValues.isAdmin) reconstructedRoles.push({ roleName: 'Admin' });
    if (formValues.isManager) reconstructedRoles.push({ roleName: 'Manager' });
    

    if (!reconstructedRoles.some(r => r.roleName === 'Employee')) {
      reconstructedRoles.push({ roleName: 'Employee' });
    }

    const updatedEmployee: Employee2 = {
      userId: formValues.userId,
      fullName: formValues.name,
      email: formValues.email,
      isActive: formValues.isActive,
      CreatedAt: this.currentEmployeeMeta?.CreatedAt || new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      Roles: reconstructedRoles
    };


      this.adminService.updateUser(updatedEmployee).subscribe({
        next: () => {
          this.shareService.snakeBarFunc("User Updated!")
          this.adminService.updateEmpSingnal(); 
          this.closeModal();
        },
        error: (err) => console.error('Update failed:', err)
      });


    
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  deleteEmployee(id:number){
      alert("Note:All the Task assiged by and to this user will be deleted too!")
      this.adminService.deleteEmployee(id).subscribe(res=>{
        this.shareService.snakeBarFunc(res.message)
        // alert()
        this.adminService.updateEmpSingnal()
      })
      
    }
}