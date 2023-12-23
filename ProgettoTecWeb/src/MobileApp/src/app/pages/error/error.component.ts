import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Add import for ActivatedRoute
@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'],
})
export class ErrorComponent {
  error_code: any;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params: any) => {
      // Specify the type of params as any
      this.error_code = params.get('code') ?? ' ';
    });
  }
}
