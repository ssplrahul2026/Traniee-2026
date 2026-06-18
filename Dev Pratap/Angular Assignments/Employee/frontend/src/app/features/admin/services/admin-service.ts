import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { env } from '../../../Environment';
import { Employee2 } from '../components/employee-list/employee-list';
import { toSignal } from '@angular/core/rxjs-interop';
import { CreateTask, CreateTaskRequest } from '../components/create-task/create-task';
import { TaskDetails } from '../components/task-list-admin/task-list-admin';


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

export interface UserInfo {
  userId: number;
  FullName: string;
  email: string;
}

export interface Task {
  taskId: number;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  createdDate: string;
  updatedDate: string | null;
  Assignee: UserInfo;
  Creator: UserInfo;
}

export interface GetTaskResponse {
  success: boolean;
  data: Task;
}



@Injectable({
  providedIn: 'root',
})
export class AdminService {
  http = inject(HttpClient)
  Employees = signal<Employee[]>([])
  task = signal<TaskDetails[]>([])

  updateTaskSingnal(){
    this.getAllTask().subscribe(res => this.task.set(res.data))
  }

  updateEmpSingnal(){
    this.getAllUser().subscribe(res => this.Employees.set(res))
  }

  // employee here
  deleteEmployee(userId:number){
    return this.http.delete<{message:string}>(`${env.URL}admin/api/${userId}`)
  }

  getAllUser(){
    return this.http.get<Employee[]>(`${env.URL}admin/api`)
  }

  updateUser(data:Employee2){
    return this.http.patch(`${env.URL}admin/api/${data.userId}`,data)
  }

  // task here

  getAllTask(){
    return this.http.get<{success: boolean,count: number,data:TaskDetails[]}>(`${env.URL}task`)
  }

  createTask(data:CreateTaskRequest){
    return this.http.post<{success: boolean,message: string}>(`${env.URL}task`,data)
  }

  deleteTask(id:number){
    return this.http.delete(`${env.URL}task/${id}`)
  }

  getTaskById(id:number){
    return this.http.get<GetTaskResponse>(`${env.URL}task/${id}`)
  }

  updateTask(data:Task){
    return this.http.patch<GetTaskResponse>(`${env.URL}task/${data.taskId}`,data)
    
  }
  
  
}
