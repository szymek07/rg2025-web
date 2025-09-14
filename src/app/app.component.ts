import {Component, OnInit, OnDestroy} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  isSmallScreen: boolean = false;
  mediaQueryList!: MediaQueryList;

  loadingAward: boolean = false;

  call: string = '';
  code1: string = '';
  code2: string = '';
  code3: string = '';
  code4: string = '';
  submitted: boolean = false;
  apiResponse: boolean | undefined;

  loadingImage: boolean = true;

  onSubmit(form: any) {
    // console.log('Form submitted: ', form.value);
    // console.log('Form valid:', form.valid);
    this.submitted = true;
    this.makeApiCall(this.code1, this.code2, this.code3, this.code4, this.call);
  }

  resetSubmitted(): void {
    console.log('Resetting Form');
    this.submitted = false;
  }

  makeApiCall(code1: string, code2: string, code3: string, code4: string, callValue: string) {
    const url = `/api/validate-code?code1=${code1}&code2=${code2}&code3=${code3}&code4=${code4}`;
    this.loadingAward = true;
    this.http.get<boolean>(url).subscribe(
      response => {
        this.apiResponse = response;
        this.loadingAward = false;
        console.log('API response:', response);
      },
      error => {
        this.loadingAward = false;
        console.error('API error:', error);
      }
    );
  }

  onImageLoad() {
    this.loadingImage = false;
  }

  constructor(private http: HttpClient) {}

  title = 'Rajd Granica 2025';

  ngOnInit(): void {
    this.mediaQueryList = window.matchMedia('(max-width: 1399px)');
    this.isSmallScreen = this.mediaQueryList.matches;
    this.mediaQueryList.addEventListener('change', this.handleScreenChange);

  }

  ngOnDestroy(): void {
    this.mediaQueryList.removeEventListener('change', this.handleScreenChange);
  }

  handleScreenChange = (event: MediaQueryListEvent): void => {
    this.isSmallScreen = event.matches;
  };

}
