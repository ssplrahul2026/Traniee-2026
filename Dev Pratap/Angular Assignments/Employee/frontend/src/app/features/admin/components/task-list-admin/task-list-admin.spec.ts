import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskListAdmin } from './task-list-admin';

describe('TaskListAdmin', () => {
  let component: TaskListAdmin;
  let fixture: ComponentFixture<TaskListAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskListAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
