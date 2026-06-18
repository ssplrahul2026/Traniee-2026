import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LogIn } from "./features/auth/components/log-in/log-in";
import { ShareServices } from './shared/services/share-services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('frontend');

  shareService = inject(ShareServices)
  ngOnInit(){
    const token = signal(localStorage.getItem("accessToken"))
    this.shareService.assignUser(token())
    console.log(this.shareService.userDetails())
  }
}
