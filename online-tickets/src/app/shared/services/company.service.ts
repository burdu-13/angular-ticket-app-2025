import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../models/company.model';
@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private apiUrl = 'http://localhost:5000/companies';
  constructor(private http: HttpClient) {}

  onRegisterCompany(companyData: any): Observable<any> {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found');
    }

    return this.http.post(this.apiUrl, companyData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  getCompaniesByUserId(userId: string): Observable<any[]> {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found');
    }

    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  getAllCompanies(): Observable<Company[]> {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found');
    }
    return this.http.get<Company[]>(this.apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
}
}
