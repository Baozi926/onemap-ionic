import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapLegendComponent } from './map-legend.component';

describe('MapLegendComponent', () => {
  let component: MapLegendComponent;
  let fixture: ComponentFixture<MapLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapLegendComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
