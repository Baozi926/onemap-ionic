import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyRequestPage } from './my-request.page';

describe('MyRequestPage', () => {
  let component: MyRequestPage;
  let fixture: ComponentFixture<MyRequestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyRequestPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
