import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import type { Event } from '../../../shared/models/event.model';
import { CompanyService } from '../../../shared/services/company.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Company } from '../../../shared/models/company.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EventService } from '../../../shared/services/event.service';
import { TicketTier } from '../../../shared/models/event.model';
@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCardComponent implements OnInit {
  @Input({ required: true }) event!: Event;
  @Input() companies: Company[] = [];
  @Output() eventRemoved = new EventEmitter<string>();
  @Output() eventUpdated = new EventEmitter<Event>();
  isEditEventVisible: boolean = false;
  editEvent!: FormGroup;
  private _canSuspendSales: boolean = true;

  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private fb: FormBuilder,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}
  getFormattedPrice(price: number): string {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }

  isCurrentEvent(eventDate: Date): boolean {
    const today = new Date();
    return eventDate >= today;
  }

  ngOnInit() {
    this.loadCompaniesForCurrentUser();
    this.editEvent = this.fb.group({
      name: [this.event?.name || '', Validators.required],
      date: [this.event?.date || '', Validators.required],
      description: [this.event.description || Validators.required],
      imageUrl: [this.event.imgUrl || Validators.required],
    });
  }

  get loggedUserType() {
    return this.authService.getLoggedInUser()?.userType;
  }

  buyTicket(tier: TicketTier) {
    if (this.loggedUserType === 'Customer' && !this.event.isSalesSuspended) {
      if (tier.ticketsAvailable - tier.ticketsSold > 0) {
        const updatedEvent = { ...this.event };
        const tierIndex = updatedEvent.ticketTiers.findIndex(
          (t) => t._id === tier._id
        );

        if (tierIndex > -1) {
          updatedEvent.ticketTiers[tierIndex] = {
            ...tier,
            ticketsAvailable: tier.ticketsAvailable - 1,
            ticketsSold: tier.ticketsSold + 1,
          };

          this.eventService.updateEvent(updatedEvent).subscribe({
            next: (response: Event) => {
              this.event = response;
              this.eventUpdated.emit(this.event);
            },
          });
        }
      }
    }
  }

  loadCompaniesForCurrentUser(): void {
    const currentUser = this.authService.getLoggedInUser();
    if (currentUser) {
      this.companyService.getCompaniesByUserId(currentUser._id).subscribe({
        next: (companies) => (this.companies = companies),
      });
    }
  }

  toggleEditEventPage() {
    this.isEditEventVisible = !this.isEditEventVisible;
    if (this.isEditEventVisible) {
      this.editEvent.patchValue(this.event);
    }
  }

  submitEditEvent() {
    const eventId = this.event._id;
    const updatedEventData = this.editEvent.value;
    this.eventService.onEditEvent(eventId, updatedEventData);

    if (this.editEvent.valid) {
      Object.assign(this.event, updatedEventData);
      this.cdr.detectChanges();
      this.toggleEditEventPage();
    }
  }

  removeEvent() {
    if (confirm('Are you sure you want to remove this event?')) {
      this.eventService.deleteEvent(this.event._id).subscribe({
        next: () => {
          this.eventRemoved.emit(this.event._id);
          this.toggleEditEventPage();
        },
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event']) {
      this._canSuspendSales = !this.event.ticketTiers.some(
        (tier) => tier.ticketsSold > 0
      );
    }
  }

  get canSuspendSales(): boolean {
    return this._canSuspendSales;
  }

  toggleSalesSuspension() {
    if (
      (this.loggedUserType === 'EventOrganizer' ||
        this.loggedUserType === 'Admin') &&
      this.canSuspendSales
    ) {
      const updatedEvent = {
        ...this.event,
        isSalesSuspended: !this.event.isSalesSuspended,
      };

      this.eventService.updateEvent(updatedEvent).subscribe({
        next: (response: Event) => {
          this.event = response;
          this.eventUpdated.emit(this.event);
          console.log('Sales suspension toggled');
        },
      });
    }
  }
}
