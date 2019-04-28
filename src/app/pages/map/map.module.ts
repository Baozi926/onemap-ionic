import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { EsriMapComponent } from './esri-map.component';

import { SearchComponent } from '../../components/search/search.component';
import { LayerGalleryComponent } from '../../components/layer-gallery/layer-gallery.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: EsriMapComponent
      }
    ])
  ],
  declarations: [EsriMapComponent, SearchComponent, LayerGalleryComponent],
  entryComponents: [
    SearchComponent, LayerGalleryComponent
  ]
})
export class EsriMapModule {}
