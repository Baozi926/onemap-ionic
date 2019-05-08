import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
// import { MapService } from '../../services/map.service';
import { EsriMapComponent } from './esri-map.component';
import { SearchComponent } from '../../components/search/search.component';
import { LayerGalleryComponent } from '../../components/layer-gallery/layer-gallery.component';
import { SearchResultComponent } from '../../components/search-result/search-result.component';
import { SearchResultDetailComponent } from '../../components/search-result-detail/search-result-detail.component';
import { MapToolsComponent } from '../../components/map-tools/map-tools.component';

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
  declarations: [
    EsriMapComponent,
    SearchComponent,
    LayerGalleryComponent,
    SearchResultComponent,
    SearchResultDetailComponent,
    MapToolsComponent
  ],
  entryComponents: [SearchComponent, LayerGalleryComponent]
})
export class EsriMapModule {}
