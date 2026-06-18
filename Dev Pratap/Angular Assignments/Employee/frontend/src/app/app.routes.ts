import { Routes } from '@angular/router';
import { LogIn } from './features/auth/components/log-in/log-in';
import { Register } from './features/auth/components/register/register';
import { PageNotFound } from './shared/components/page-not-found/page-not-found';
import { Home } from './shared/components/home/home';
import { guestGuard, roleGuard } from './core/guards/role-guards';
import { authGuardsGuard } from './core/guards/auth-guards-guard';
import { TaskListAdmin } from './features/admin/components/task-list-admin/task-list-admin';
import { EditTask } from './features/admin/components/edit-task/edit-task';
import { TaskDetails } from './features/admin/components/task-details/task-details';
import { CreateTask } from './features/admin/components/create-task/create-task';
import { EmployeeList } from './features/admin/components/employee-list/employee-list';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    {
        path:"dashboard",
        canActivate:[authGuardsGuard],
        component:Home
    },
    {
        path: "auth",
         canActivate: [guestGuard],
        children: [
            { path: '', redirectTo: '/login', pathMatch: 'full' },
            { path: 'login', component: LogIn },
            { path: 'register', component: Register },
        ]
    },
    {
        path:"admin",
        canActivate:[authGuardsGuard,roleGuard],
        data:{role:"Admin",role2:"Manager"},
        children: [
            { path: 'taskList', component:TaskListAdmin },
            { path: 'taskDetails', component: TaskDetails },
            { path: 'createTask', component: CreateTask },
            { path: 'editTask', component: EditTask },
            { path: 'Employees', component: EmployeeList },
            { path: 'task/:id', component: TaskDetails },
            { path: 'task/edit/:id', component: EditTask },
        ]
    },
    {
        path:"404",
        component:PageNotFound
    },
    {
        path:"**",
        redirectTo:"/404"
    },
];
