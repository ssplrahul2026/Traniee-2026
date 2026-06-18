import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin-service';
import { ShareServices } from '../../../../shared/services/share-services';
import { take } from 'rxjs';

export interface CreateTaskRequest {
  title: string;
  description: string;
  assignedToUserId: number;
  assignedByUserId: number;
  dueDate: string;
  status:string;
}

@Component({
  selector: 'app-create-task',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './create-task.html',
  styleUrl: './create-task.css',
})
export class CreateTask implements OnInit {
  taskForm!: FormGroup;
  fb = inject(FormBuilder)
  adminServie = inject(AdminService)
  sharedServie = inject(ShareServices)
  router = inject(Router)

  ngOnInit() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      assignedTo: ['', [Validators.required]],
      status: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
    });

    this.adminServie.getAllUser().subscribe(res => this.adminServie.Employees.set(res))

  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  onSubmit() {
    const task: CreateTaskRequest = {
      title: this.taskForm.value.title!,
      description: this.taskForm.value.description!,
      assignedToUserId: parseInt(this.taskForm.value.assignedTo!),
      assignedByUserId: this.sharedServie.userDetails()!.userId,
      dueDate: this.taskForm.value.dueDate!,
      status:this.taskForm.value.status!
    };

    this.adminServie.createTask(task).subscribe(res=>alert(res.message))
    this.adminServie.updateTaskSingnal()
    this.router.navigate(["/admin/taskList"])
  }
}
