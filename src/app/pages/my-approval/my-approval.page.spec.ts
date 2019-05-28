import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyApprovalPage } from './my-approval.page';

describe('MyApprovalPage', () => {
  let component: MyApprovalPage;
  let fixture: ComponentFixture<MyApprovalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyApprovalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyApprovalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
