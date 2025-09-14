import {Component, OnInit, OnDestroy} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ApiResponse } from './response.model';
import { ScheduleResponse } from './schedule.model';
import { ActivityResponse } from './activity.model';

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

  loadingLastHrd: boolean = false;
  loadingSchedule: boolean = false;
  loadingAward: boolean = false;
  scheduleResponse: ScheduleResponse[] = [];
  activityResponse: ActivityResponse[] = [];

  hours: string[] = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  call: string = '';
  submitted: boolean = false;
  apiResponse: ApiResponse | undefined;

  loadingImage: boolean = true;


  getSchedule() {
    const url = `/api/schedule`;
    this.loadingSchedule = true;
    this.http.get<ScheduleResponse[]>(url).subscribe(
      response => {
        this.scheduleResponse = response;
        if (this.isSmallScreen) {
          console.log("Small screen - filtering result to present and future days and occupied hours");
          this.filterDates();
          this.filterHours();
        }
        this.loadingSchedule = false;
        // console.log('Schedule response:', this.scheduleResponse);
      },
      error => {
        this.loadingSchedule = false;
        console.error('API error:', error);
      }
    );
  }

  getActivity() {
    const url = `/api/last-heard?stationId=13&limit=10&diffInSec=1800`;
    this.loadingLastHrd = true;
    this.http.get<ActivityResponse[]>(url).subscribe(
      response => {
        this.activityResponse = response;
        this.loadingLastHrd = false;
        // console.log('Activity response:', this.activityResponse);
      },
      error => {
        this.loadingLastHrd = false;
        // console.error('API error:', error);
      }
    );
  }

  onSubmit(form: any) {
    // console.log('Form submitted: ', form.value);
    // console.log('Form valid:', form.valid);
    this.submitted = true;
    this.makeApiCall(this.call);
  }

  resetSubmitted(): void {
    console.log('Resetting Form');
    this.submitted = false;
  }

  makeApiCall(callValue: string) {
    const url = `/api/points?stationId=13&call=${callValue}`;
    this.loadingAward = true;
    this.http.get<ApiResponse>(url).subscribe(
      response => {
        this.apiResponse = response;
        this.loadingAward = false;
        // console.log('API response:', response);
      },
      error => {
        this.loadingAward = false;
        // console.error('API error:', error);
      }
    );
  }

  convertToMHz(freq: string): number {
    const freqNumber = parseFloat(freq);
    return freqNumber / 1_000_000;
  }

  filterDates(): void {
    // console.log("Filter dates");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // console.log("Today: ", today);

    const filteredDates = this.scheduleResponse.filter( e => new Date(e.date) >= today);

    // console.log("Filtered dates", filteredDates);
    this.scheduleResponse = filteredDates;
  }


  filterHours(): void {
    // console.log("Filter hours");
    const hoursWithValues: string[] = [];

    this.scheduleResponse.forEach(entry => {
      Object.keys(entry).forEach(key => {
        if (key.startsWith('h') && entry[key]) {
          hoursWithValues.push(`${key.substring(1)}`);
        }
      });
    });

    // console.log("Filtered not unique", hoursWithValues);
    const uniqueSortedNumbers = Array.from(new Set(hoursWithValues)).sort((a, b) => Number(a) - Number(b));
    // console.log("Unique", uniqueSortedNumbers);
    this.hours = uniqueSortedNumbers;
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

    this.getActivity();
    this.getSchedule();
  }

  ngOnDestroy(): void {
    this.mediaQueryList.removeEventListener('change', this.handleScreenChange);
  }

  handleScreenChange = (event: MediaQueryListEvent): void => {
    this.isSmallScreen = event.matches;
  };

}
