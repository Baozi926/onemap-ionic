import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ResourceGalleryPage } from './resource-gallery.page';

import { ResourceDetailComponent } from '../../components/resource-detail/resource-detail.component';
const routes: Routes = [
  {
    path: '',
    component: ResourceGalleryPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ResourceGalleryPage, ResourceDetailComponent],
  entryComponents: [ResourceDetailComponent]
})
export class ResourceGalleryPageModule {}
