import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page404',
  templateUrl: './page404.component.html',
  styleUrls: ['./page404.component.scss'],
  standalone: true,
  imports: [],
})

/**
 * PAges-404 component
 */
export class Page404Component implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  backLogin() {
    this.router.navigate(['cermi/auth/login']);
  }

}
