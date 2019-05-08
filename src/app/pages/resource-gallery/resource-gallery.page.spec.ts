import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceGalleryPage } from './resource-gallery.page';

describe('ResourceGalleryPage', () => {
  let component: ResourceGalleryPage;
  let fixture: ComponentFixture<ResourceGalleryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourceGalleryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));



  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceGalleryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
