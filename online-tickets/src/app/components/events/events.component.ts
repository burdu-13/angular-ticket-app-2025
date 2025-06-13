import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Company } from '../../shared/models/company.model';
import { CompanyService } from '../../shared/services/company.service';
import { EventService } from '../../shared/services/event.service';
import { Router } from '@angular/router';
import { EventCardComponent } from './event-card/event-card.component';
import { Event } from '../../shared/models/event.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [EventCardComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
})
export class EventsComponent implements OnInit {
  addEventForm!: FormGroup;
  categories: string[] = ['Musical', 'Movie', 'Theatrical', 'Game Event'];
  companies: Company[] = [];
  isAddEventVisible = false;
  events: Event[] = [];
  filteredEvents: Event[] = [];
  currentPage = 0;
  totalPages = 0;
  eventsPerPage = 3;
  paginatedEvents: Event[][] = [];

  searchName = '';
  searchCategory = '';
  searchStartDate: Date | null = null;
  searchEndDate: Date | null = null;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private companyService: CompanyService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCompaniesForCurrentUser();
    this.initializeAddEventForm();
    this.loadCurrentEvents();
  }

  get loggedUserType() {
    return this.authService.getLoggedInUser()?.userType;
  }

  loadCurrentEvents() {
    this.eventService.getCurrentEvents().subscribe((events) => {
      this.events = events;
      this.applyFilters();
      this.calculatePagination();
    });
  }

  calculatePagination() {
    this.totalPages = Math.ceil(
      this.filteredEvents.length / this.eventsPerPage
    );
    this.paginatedEvents = [];

    for (let i = 0; i < this.totalPages; i++) {
      const startIndex = i * this.eventsPerPage;
      const endIndex = Math.min(
        startIndex + this.eventsPerPage,
        this.filteredEvents.length
      );
      this.paginatedEvents.push(
        this.filteredEvents.slice(startIndex, endIndex)
      );
    }
  }

  trackPage(index: number): number {
    return index;
  }

  trackEvent(index: number, event: Event): string {
    return event._id;
  }

  loadCompaniesForCurrentUser(): void {
    const currentUser = this.authService.getLoggedInUser();
    if (currentUser) {
      this.companyService.getCompaniesByUserId(currentUser._id).subscribe({
        next: (companies) => (this.companies = companies)
      });
    }
  }

  toggleAddEventPage(): void {
    this.isAddEventVisible = !this.isAddEventVisible;
  }

  initializeAddEventForm(): void {
    this.addEventForm = this.fb.group({
      eventName: ['', Validators.required],
      eventDate: ['', Validators.required],
      eventCategory: ['', Validators.required],
      eventCompany: ['', Validators.required],
      eventDescription: ['', Validators.required],
      eventImageUrl: ['', Validators.required],
      ticketTiers: this.fb.array([]),
    });
  }

  get ticketTiersFormArray() {
    return this.addEventForm.get('ticketTiers') as FormArray;
  }

  addTier() {
    this.ticketTiersFormArray.push(
      this.fb.group({
        name: ['', Validators.required],
        price: [0, Validators.required],
        ticketsAvailable: [0, Validators.required],
      })
    );
  }

  removeTier(index: number) {
    this.ticketTiersFormArray.removeAt(index);
  }

  onSubmit() {
    if (this.addEventForm.valid) {
      this.eventService.onAddEvent(this.addEventForm.value).subscribe({
        next: (response) => {
          this.addEventForm.reset();
          this.toggleAddEventPage();
          this.loadCurrentEvents();
        }
      });
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  applyFilters() {
    this.filteredEvents = this.events.filter((event) => {
      const nameMatch = event.name.toLowerCase().includes(this.searchName.toLowerCase());
      const categoryMatch = this.searchCategory === '' || event.category === this.searchCategory;
      let dateMatch = true;
  
      if (this.searchStartDate) {
        const eventDate = new Date(event.date);
        dateMatch = eventDate >= this.searchStartDate;
      }
  
      return nameMatch && categoryMatch && dateMatch;
    });
    this.calculatePagination();
  }

  onEventRemoved(eventId: string) {
    this.events = this.events.filter((event) => event._id !== eventId);
    this.applyFilters();
    this.calculatePagination();
  }
}
