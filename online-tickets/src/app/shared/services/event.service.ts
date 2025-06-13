import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import type { Event } from '../models/event.model';
@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = 'http://localhost:5000/events';

  constructor(private http: HttpClient) {}

  getCurrentEvents(): Observable<Event[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((events: any[]) => {
        return events.map((event) => ({
          ...event,
          date: new Date(event.date),
          _id: event._id.toString(),
        }));
      })
    );
  }

  onAddEvent(eventData: any): Observable<any> {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found');
    }
    eventData.eventDate = new Date(eventData.eventDate);
    return this.http.post(this.apiUrl, eventData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  onEditEvent(eventId: string, eventData: any): Observable<Event> {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found');
    }

    const url = `${this.apiUrl}/${eventId}`;

    if (eventData.eventDate) {
      eventData.date = new Date(eventData.eventDate);
    } // es imitom rom date stringad gavushvat
    if (eventData.imageUrl) {
      eventData.imgUrl = eventData.imageUrl;
      delete eventData.imageUrl;
    }

    return this.http.put<Event>(url, eventData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  onRemoveEvent(eventId: string): Observable<any> {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found');
    }

    const url = `${this.apiUrl}/${eventId}`;

    return this.http.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  deleteEvent(eventId: string): Observable<any> {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found');
    }

    const url = `${this.apiUrl}/${eventId}`;

    return this.http.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  updateEvent(event: Event): Observable<Event> {
    const token = sessionStorage.getItem('authToken');
    console.log("Token retrieved from storage:", token);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.apiUrl}/${event._id}`;
    return this.http.put<Event>(url, event, { headers });
  }
}
