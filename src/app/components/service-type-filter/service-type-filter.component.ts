import { Component, OnInit,Input } from '@angular/core';
@Component({
  selector: 'app-service-type-filter',
  templateUrl: './service-type-filter.component.html',
  styleUrls: ['./service-type-filter.component.scss']
})
export class ServiceTypeFilterComponent implements OnInit {
  constructor() {}

  @Input() serviceTypes: Array<Object>;

  onFilterChange(evt, entry) {
    console.log(evt);
  }
  ngOnInit() {}
}
