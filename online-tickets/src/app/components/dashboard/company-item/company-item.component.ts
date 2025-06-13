import { Component, Input } from '@angular/core';
import { Company } from '../../../shared/models/company.model';

@Component({
  selector: 'app-company-item',
  standalone: true,
  imports: [],
  templateUrl: './company-item.component.html',
  styleUrl: './company-item.component.css'
})
export class CompanyItemComponent {
  @Input() company!: Company;


  editCompany(){
    alert("This is where you would edit the company data :D");
  }

}
