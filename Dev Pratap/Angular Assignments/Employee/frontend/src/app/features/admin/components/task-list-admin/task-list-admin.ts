import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin-service';
import { ShareServices } from '../../../../shared/services/share-services';


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
  selector: 'app-task-list-admin',
  imports: [CommonModule, RouterModule],
  templateUrl: './task-list-admin.html',
  styleUrl: './task-list-admin.css',
})
export class TaskListAdmin implements OnInit {
  adminService = inject(AdminService);
  private router = inject(Router);
  shareService = inject(ShareServices)


  ngOnInit(): void {
    this.adminService.updateTaskSingnal()
  }
  ngOnDestroye(){
    this.adminService.task.set([])
  }


  navigateToCreate(): void {
    this.router.navigate(['/admin/createTask']);
  }

  navigateToWatch(taskId: number): void {
    this.router.navigate([`/admin/task/${taskId}`]);
  }

  navigateToEdit(taskId: number): void {
    this.router.navigate([`/admin/task/edit/${taskId}`]);
  }

  deleteTask(taskId: number): void {
    this.adminService.deleteTask(taskId).subscribe({
      next: (res) => {
          console.log('Login successful', res);
          this.adminService.updateTaskSingnal()
        },

        error: (err) => {
          if (err.status === 404) {
            alert('not Found')
          } else if (err.status === 500) {
            console.log('Server error');
          } else {
            console.log('Something went wrong');
          }
        },
    })
  }
}

