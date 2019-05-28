import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ResourceGalleryPage } from './resource-gallery.page';
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';
import { ResourceDetailComponent } from '../../components/resource-detail/resource-detail.component';
// import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
const routes: Routes = [
  {
    path: '',
    component: ResourceGalleryPage
  }
];

@NgModule({
  imports: [
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    }),
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
    // SafeHtmlPipe
  ],
  declarations: [ResourceGalleryPage, ResourceDetailComponent],
  entryComponents: [ResourceDetailComponent]
})
export class ResourceGalleryPageModule {}
