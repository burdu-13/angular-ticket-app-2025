import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Event } from '../../../shared/models/event.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventService } from '../../../shared/services/event.service';
import { AuthService } from '../../../shared/services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-item',
  standalone: true,
  imports: [ReactiveFormsModule,DatePipe],
  templateUrl: './event-item.component.html',
  styleUrl: './event-item.component.css'
})
export class EventItemComponent {
  @Input() event!: Event;
  isEditEventVisible = false;
  editEvent!: FormGroup;
  @Output() eventRemoved = new EventEmitter<string>();
  @Output() eventUpdated = new EventEmitter<Event>();
  private _canSuspendSales: boolean = true;


  constructor(private fb:FormBuilder, private eventService:EventService, private cdr: ChangeDetectorRef, private authService:AuthService){}

  toggleEditEventPage() {
    this.isEditEventVisible = !this.isEditEventVisible;
    if (this.isEditEventVisible) {
      this.editEvent = this.fb.group({
        name: [''],
        date: [''],
        description: [''],
        imgUrl: [''],
      });
      this.editEvent.patchValue(this.event);
    }
  }

  ngOnInit() {

    this.editEvent = this.fb.group({
      name: [this.event?.name || '', Validators.required],
      date: [this.event?.date || '', Validators.required],
      description: [this.event.description || Validators.required],
      imageUrl: [this.event.imgUrl || Validators.required],
    });
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

  get loggedUserType() {
    return this.authService.getLoggedInUser()?.userType;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && this.event && this.editEvent) { 
        this.editEvent.patchValue(this.event);
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
