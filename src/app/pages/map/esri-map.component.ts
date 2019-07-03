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
import { SearchService } from '../../services/search.service';
import { PortalService } from '../../services/portal.service';
import { loadModules } from 'esri-loader';
import appConfig from '../../configs/app';
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
    private portalService: PortalService,
    private searchService: SearchService
  ) {
    // this.initMapQuery = this.initMapQuery.bind(this);

    this.events.subscribe(
      'esriView:typeHasChanged',
      this.initMapQuery.bind(this)
    );

    this.events.subscribe(
      'esriView:displayDetails',
      function(evt) {}.bind(this)
    );
  }

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

  mapClickEvent: any;

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
      const [
        EsriMap,
        EsriMapView,
        EsriSceneView,
        WebScene,
        WebMap,
        EsriConfig
      ] = await loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/views/SceneView',
        'esri/WebScene',
        'esri/WebMap',
        'esri/config'
      ]);

      EsriConfig.portalUrl = appConfig.portal.baseUrl;

      let map: esri.Map;

      if (appConfig.map.type === '3d' && appConfig.map.webMapId) {
        map = new WebScene({
          portalItem: {
            id: appConfig.map.webSceneId
          }
        });
      } else {
        const mapProperties: esri.MapProperties = {
          basemap: this._basemap
        };

        map = new EsriMap(mapProperties);
      }

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
      this.mapService.view = view;
      this.mapService.view.ui.remove('navigation-toggle');
      this.mapService.view.ui.remove('compass');

      // @ts-ignore
      window.mapService = this.mapService;

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

      this.mapService.setInitialExtent(mapView.extent.clone());

      this.initMapQuery();

      const itemId = this.activatedRoute.snapshot.queryParams.itemId;
      if (itemId) {
        this.loadPortalItem({ id: itemId });
      }
    });
  }

  initMapQuery() {
    if (this.mapClickEvent) {
      this.mapClickEvent.remove();
    }
    this.mapClickEvent = this.mapService.view.on(
      'click',
      function(evt) {
        this.mapService
          .getView()
          .hitTest(evt)
          .then(async res => {
            console.log(res);

            // 有些结果里面没有graphic，需要排除
            const mapClickResult = res.results.filter(v => {
              return v.graphic;
            });

            if (mapClickResult.length > 0 && false) {
              this.events.publish('esriView:displayDetails', mapClickResult);
            } else {
              const tolerance = 10;
              const sreenPoint = evt;
              const sideScreenPoint = {
                x: evt.x,
                y: evt.y + tolerance
              };
              const centerMapPoint = this.mapService.view.toMap(sreenPoint);

              const sideMapPoint = this.mapService.view.toMap(sideScreenPoint);

              const offset = centerMapPoint.distance(sideMapPoint);

              const [Circle, webMercatorUtils] = await loadModules([
                'esri/geometry/Circle',
                'esri/geometry/support/webMercatorUtils'
              ]);

              let polygon = new Circle({
                center: centerMapPoint,
                radius: offset,
                spatialReference: this.mapService.view.spatialReference
              });

              if (!this.mapService.view.spatialReference.isGeographic) {
                polygon = webMercatorUtils.webMercatorToGeographic(polygon);
              }

              this.events.publish('search:searchByGeometry', {
                geometry: polygon,
                layers: this.getLayers4NsbdSpatial(),
                defaultDisplayLayer: 'zx_channel_irrigationditch'
              });
            }
          })
          .catch(err => {
            console.warn(err);
          });
      }.bind(this)
    );
  }

  getLayers4NsbdSpatial() {
    const layers = ['zx_channel_irrigationditch'];
    // var
    const dict = this.searchService.getDict().dict;

    const layernames = dict.allLayers;

    const currentLayers = this.mapService.getView().map.layers.items;

    currentLayers.forEach(v => {
      if (!!layernames && layernames[v.title]) {
        layers.push(layernames[v.title]);
      }
    });

    // 如果没有
    if (layers.length === 1) {
      return layers.concat(dict.buildingLayers);
    }

    return layers;

    // if(currentLayer)
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
    // this.mapService.setInitialExtent(extent);
  }
  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    this.initializeMap().then(mapView => {
      this.houseKeeping(mapView);
    });
  }
}
