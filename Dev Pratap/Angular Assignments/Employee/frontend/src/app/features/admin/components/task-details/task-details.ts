import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService, Task } from '../../services/admin-service';
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
  selector: 'app-task-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);

  task = signal<Task | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadTaskDetails(+idParam);
    } else {
      this.isLoading.set(false);
    }
  }

  loadTaskDetails(id: number): void {
    this.adminService.getTaskById(id).subscribe(res=>{
      console.log(res.data)
      this.task.set(res.data)
      this.isLoading.set(false)
    })
  }

  goBack(): void {
    this.router.navigate(['/admin/taskList']);
  }

  goToEdit(): void {
    if (this.task()) {
      this.router.navigate([`/admin/tasks/edit/${this.task()?.taskId}`]);
    }
  }
}
