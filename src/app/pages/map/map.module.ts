import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
// import { MapService } from '../../services/map.service';
import { EsriMapComponent } from './esri-map.component';
import { SearchComponent } from '../../components/search/search.component';
import { LayerGalleryComponent } from '../../components/layer-gallery/layer-gallery.component';
import { MapLegendComponent } from '../../components/map-legend/map-legend.component';
import { LayerControllerComponent } from '../../components/layer-controller/layer-controller.component';
import { SearchResultComponent } from '../../components/search-result/search-result.component';
import { SearchResultDetailComponent } from '../../components/search-result-detail/search-result-detail.component';
import { MapToolsComponent } from '../../components/map-tools/map-tools.component';
import { ServiceTypeFilterComponent } from '../../components/service-type-filter/service-type-filter.component';
import {
  LazyLoadImageModule,
  intersectionObserverPreset
} from 'ng-lazyload-image';
import { IonicImageLoader } from 'ionic-image-loader';
import { PipesModule } from '../../pipes/pipe.module';
@NgModule({
  imports: [
    IonicImageLoader,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    }),
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: EsriMapComponent
      }
    ]),
    PipesModule
  ],
  declarations: [
    EsriMapComponent,
    SearchComponent,
    LayerGalleryComponent,
    MapLegendComponent,
    LayerControllerComponent,
    SearchResultComponent,
    SearchResultDetailComponent,
    MapToolsComponent,
    ServiceTypeFilterComponent
  ],
  entryComponents: [
    SearchComponent,
    LayerGalleryComponent,
    LayerControllerComponent,
    ServiceTypeFilterComponent,
    MapLegendComponent
  ]
})
export class EsriMapModule {}
