/*
  Copyright 2019 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SearchComponent } from '../../components/search/search.component';
import { LayerGalleryComponent } from '../../components/layer-gallery/layer-gallery.component';
import { myEnterAnimation } from '../../animations/my-enter. animations';
import { myLeaveAnimation } from '../../animations/my-leave. animations n';
import { loadModules } from 'esri-loader';
import esri = __esri; // Esri TypeScript Types

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {
  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  // The <div> where we will place the map
  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  /**
   * _zoom sets map zoom
   * _center sets map center
   * _basemap sets type of map
   * _loaded provides map loaded status
   */
  private _zoom = 10;
  private _center: Array<number> = [0.1278, 51.5074];
  private _basemap = 'streets';
  private _loaded = false;
  private view: any;

  get mapLoaded(): boolean {
    return this._loaded;
  }

  @Input()
  set zoom(zoom: number) {
    this._zoom = zoom;
  }

  get zoom(): number {
    return this._zoom;
  }

  @Input()
  set center(center: Array<number>) {
    this._center = center;
  }

  get center(): Array<number> {
    return this._center;
  }

  @Input()
  set basemap(basemap: string) {
    this._basemap = basemap;
  }

  get basemap(): string {
    return this._basemap;
  }

  constructor(public modalController: ModalController) {}

 async onSearchBtnClick() {
   console.log('search btn click');
   const modal = await this.modalController.create({
      component: SearchComponent,
      cssClass: 'search-modal',
      keyboardClose: false,
      enterAnimation: myEnterAnimation,
      leaveAnimation: myLeaveAnimation,
      // animation: 'slide-in-right',
      showBackdrop: false,
      componentProps: {
        view: this.view
      }
    });
   return await modal.present();
  }

  async onAddResourceClick() {
    console.log('add click');
    // Create a modal using MyModalComponent with some initial data
    const modal = await this.modalController.create({
      component: LayerGalleryComponent,
      cssClass: 'layer-gallery-modal',
      showBackdrop: false,
      componentProps: {
        view: this.view
      }
    });
    return await modal.present();
  }

  async initializeMap() {
    try {
      // Load the modules for the ArcGIS API for JavaScript
      const [EsriMap, EsriMapView, EsriSceneView] = await loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/views/SceneView'
      ]);

      // Configure the Map
      const mapProperties: esri.MapProperties = {
        basemap: this._basemap
      };

      const map: esri.Map = new EsriMap(mapProperties);

      // Initialize the MapView
      const mapViewProperties: esri.MapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: this._center,
        zoom: this._zoom,
        map
      };

      const view = new EsriSceneView(mapViewProperties);

      view.ui.remove('zoom');
      this.view = view;
      this.view.ui.remove('navigation-toggle');
      this.view.ui.remove('compass');
      // window.view = view;

      return view;
    } catch (error) {
      console.log('EsriLoader: ', error);
    }
  }

  // Finalize a few things once the MapView has been loaded
  houseKeeping(mapView) {
    mapView.when(() => {
      console.log('mapView ready: ', mapView.ready);
      this._loaded = mapView.ready;
      this.mapLoadedEvent.emit(true);
    });
  }

  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    this.initializeMap().then(mapView => {

      this.houseKeeping(mapView);
    });
  }
}
