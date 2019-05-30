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
import { ModalController, Events, MenuController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { SearchComponent } from '../../components/search/search.component';
import { LayerGalleryComponent } from '../../components/layer-gallery/layer-gallery.component';

import { myEnterAnimation } from '../../animations/my-enter. animations';
import { myLeaveAnimation } from '../../animations/my-leave. animations';
import { MapService } from '../../services/map.service';
import { PortalService } from '../../services/portal.service';
import { loadModules } from 'esri-loader';
import esri = __esri; // Esri TypeScript Types

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {
  constructor(
    private menuController: MenuController,
    public modalController: ModalController,
    private mapService: MapService,
    private events: Events,
    private activatedRoute: ActivatedRoute,
    private portalService: PortalService
  ) {

  }

  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  // The <div> where we will place the map
  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  /**
   * _zoom sets map zoom
   * _center sets map center
   * _basemap sets type of map
   * _loaded provides map loaded status
   */

  // private layerGalleryModal: any;

  private _zoom = 7;
  private _center: Array<number> = [114.4015617529981, 36.1730084611679];
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

  ionViewDidEnter() {
    console.log('enter map page');
    // this.menuController.get('main').then((menu: HTMLIonMenuElement) => {
    //   menu.swipeGesture = false;
    // });
  }

  ionViewWillLeave() {
    console.log('leave map page');
    // this.menuController.get('main').then((menu: HTMLIonMenuElement) => {
    //   menu.swipeGesture = true;
    // });
  }
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
        view: this.mapService.view
      }
    });
    return await modal.present();
  }

  async onAddResourceClick() {
    console.log('add click');
    // if (this.layerGalleryModal) {
    //   this.layerGalleryModal.present();
    // } else {
    // Create a modal using MyModalComponent with some initial data
    const modal = await this.modalController.create({
      component: LayerGalleryComponent,
      cssClass: 'transparent-modal',
      showBackdrop: false,
      componentProps: {
        view: this.mapService.view
      }
    });
    // this.layerGalleryModal = modal;
    return await modal.present();
    // }
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

      this.mapService.view = view;
      this.mapService.view.ui.remove('navigation-toggle');
      this.mapService.view.ui.remove('compass');

      // @ts-ignore
      window.mapService =  this.mapService;

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
      this.events.publish('esriView:loaded', mapView);
      const itemId = this.activatedRoute.snapshot.queryParams.itemId;
      this.mapService.setInitialExtent(mapView.extent.clone());
      if (itemId) {
        this.loadPortalItem({ id: itemId });
      }
    });
  }

  async loadPortalItem({ id }) {
    const data = await this.portalService.getItemDetailById({
      id,
      token: this.portalService.getToken()
    });

    const [FeatureLayer, MapImageLayer] = await loadModules([
      'esri/layers/FeatureLayer',
      'esri/layers/MapImageLayer'
    ]);
    let layer;

    switch (data.type) {
      case 'Feature Service':
        layer = new FeatureLayer({
          url: data.url
        });
        this.mapService.view.map.add(layer);
        layer.when(() => {
          this.whenLayerLoaded(layer);
        });
        break;
      case 'Map Service':
        layer = new MapImageLayer({
          url: data.url
        });
        this.mapService.view.map.add(layer);
        layer.when(() => {
          this.whenLayerLoaded(layer);
        });
        break;
    }

    console.log('地图加载item', data);
  }

  whenLayerLoaded(layer) {
    const extent = layer.fullExtent.clone().expand(1.5);
    this.mapService.view.goTo(extent);
    this.mapService.setInitialExtent(extent);
  }
  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    this.initializeMap().then(mapView => {
      this.houseKeeping(mapView);
    });
  }
}
