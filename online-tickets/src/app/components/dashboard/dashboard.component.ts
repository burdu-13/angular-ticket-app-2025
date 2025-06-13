import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { EventItemComponent } from './event-item/event-item.component';
import { EventService } from '../../shared/services/event.service';
import { Event } from '../../shared/models/event.model';
import { CompanyItemComponent } from './company-item/company-item.component';
import { CompanyService } from '../../shared/services/company.service';
import { Company } from '../../shared/models/company.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [EventItemComponent, CompanyItemComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  loadingEvents = true;
  loadingCompanies = true;
  events: Event[] = [];
  companies: Company[] = [];
  currentPageEvents = 1;
  pageSizeEvents = 3;
  totalPagesEvents: number = 0;
  currentPageCompanies = 1;
  pageSizeCompanies = 3;
  totalPagesCompanies: number = 0;
  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private companyService: CompanyService
  ) {}

  get loggedUserType() {
    return this.authService.getLoggedInUser()?.userType;
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.loadingEvents = true;
    this.eventService.getCurrentEvents().subscribe({
        next: (events) => {
            this.events = events;
            this.totalPagesEvents = Math.ceil(this.events.length / this.pageSizeEvents);
            this.loadingEvents = false;
        },
        error: (error) => {
            console.error("Error fetching events:", error);
            this.loadingEvents = false;
        }
    });

    if (this.loggedUserType === 'Admin') {
        this.companyService.getAllCompanies().subscribe({
            next: (companies) => {
                this.companies = companies;
                this.totalPagesCompanies = Math.ceil(this.companies.length / this.pageSizeCompanies);
                this.loadingCompanies = false;
            },
            error: (error) => {
                console.error("Error fetching companies:", error);
                this.loadingCompanies = false;
            }
        });
    }
}

get paginatedEvents() {
  const startIndex = (this.currentPageEvents - 1) * this.pageSizeEvents;
  const endIndex = Math.min(startIndex + this.pageSizeEvents, this.events.length);
  return this.events.slice(startIndex, endIndex);
}

get paginatedCompanies() {
  const startIndex = (this.currentPageCompanies - 1) * this.pageSizeCompanies;
  const endIndex = Math.min(startIndex + this.pageSizeCompanies, this.companies.length);
  return this.companies.slice(startIndex, endIndex);
}

changePageEvents(pageNumber: number) {
  this.currentPageEvents = pageNumber;
}

changePageCompanies(pageNumber: number) {
  this.currentPageCompanies = pageNumber;
}

getPagesEvents(): number[] {
  const pages: number[] = [];
  for (let i = 1; i <= this.totalPagesEvents; i++) {
      pages.push(i);
  }
  return pages;
}

getPagesCompanies(): number[] {
  const pages: number[] = [];
  for (let i = 1; i <= this.totalPagesCompanies; i++) {
      pages.push(i);
  }
  return pages;
}
}
