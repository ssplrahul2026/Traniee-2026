import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService, Task } from '../../services/admin-service'; // Adjust import path
import { Employee } from '../employee-list/employee-list';

export interface UserSummary {
  userId: number;
  FullName: string;
  email: string;
}

export interface TaskDetails {
  taskId: number;
  title: string;
  description: string;
  assignedToUserId: number;
  assignedByUserId: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  createdDate: string;
  updatedDate: string | null;
  Assignee: UserSummary;
  Creator: UserSummary;
}
@Component({
  selector: 'app-edit-task',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-task.html',
  styleUrl: './edit-task.css',
})
export class EditTask implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
   adminService = inject(AdminService);

  taskForm!: FormGroup;
  targetTaskId!: number;
  isLoading = signal<boolean>(false);
  
  // Track team professional employee arrays to map choices dropdown selection paths dynamically
  employees = signal<Employee[]>([]);
  
  // Track background state properties to prevent null object payload overwrites
  private originalTaskMeta: { createdDate: string; assignedByUserId: number; Creator: UserSummary } | null = null;

  ngOnInit(): void {
    this.adminService.updateEmpSingnal()
    this.initForm();
    this.loadEmployeesList();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.targetTaskId = +idParam;
      this.loadTaskAndPatchForm(this.targetTaskId);
    } else {
      this.isLoading.set(false);
    }
  }

  initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      assignedToUserId: ['', [Validators.required]],
      status: ['Pending', [Validators.required]],
      dueDate: ['', [Validators.required]]
    });
  }

  loadEmployeesList(): void {
    if (this.adminService.Employees) {
      // Direct Signal accessor check or API method call check matching your runtime bindings
      this.employees.set(this.adminService.Employees());
    } else {
      this.adminService.updateEmpSingnal()
    }
  }

  loadTaskAndPatchForm(id: number): void {
      this.adminService.getTaskById(id).subscribe({
        next: (task) => this.applyDataToFormControls(task.data),
        error: (err) => { console.error(err); this.isLoading.set(false); }
      });
    
  }

  applyDataToFormControls(task: Task): void {
    this.originalTaskMeta = {
      createdDate: task.createdDate,
      assignedByUserId: task.Creator.userId,
      Creator: task.Creator
    };

    // Slice ISO strings cleanly into HTML5 standard calendar layout format mappings (YYYY-MM-DD)
    const formattedDate = task.dueDate ? task.dueDate.substring(0, 10) : '';

    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      assignedToUserId: task.Assignee.userId,
      status: task.status,
      dueDate: formattedDate
    });

    this.isLoading.set(false);
  }

  onSubmit(): void {
    if (this.taskForm.invalid || !this.originalTaskMeta) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValues = this.taskForm.value;
    const selectedAssignee = this.employees().find(emp => emp.userId === +formValues.assignedToUserId);

    // Build standard integrated data update payload matching interface rules exactly
    const updatedTaskPayload: TaskDetails = {
      taskId: this.targetTaskId,
      title: formValues.title,
      description: formValues.description,
      assignedToUserId: +formValues.assignedToUserId,
      assignedByUserId: this.originalTaskMeta.assignedByUserId,
      status: formValues.status,
      dueDate: new Date(formValues.dueDate).toISOString(),
      createdDate: this.originalTaskMeta.createdDate,
      updatedDate: new Date().toISOString(), // Log modification stamp instance
      Assignee: selectedAssignee || { userId: 0, FullName: 'Unassigned', email: '' },
      Creator: this.originalTaskMeta.Creator
    };

    console.log('Pushing Task Modifications:', updatedTaskPayload);
    this.adminService.updateTask(updatedTaskPayload).subscribe(res=>console.log(res))

    // if (this.adminService.) {
    //   this.adminService.updateTask(updatedTaskPayload).subscribe({
    //     next: () => this.cancelAndReturn(),
    //     error: (err) => console.error('Database modification intercept error:', err)
    //   });
    // } else {
    //   this.cancelAndReturn();
    // }
  }

  cancelAndReturn(): void {
    this.router.navigate(['/admin/taskList']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }
}
