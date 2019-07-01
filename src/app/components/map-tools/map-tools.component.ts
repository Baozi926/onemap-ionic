import { Component, OnInit, Input } from '@angular/core';
import { loadModules } from 'esri-loader';
import esri = __esri; // Esri TypeScript Types
import { MapService } from 'src/app/services/map.service';
import {
  ModalController,
  Events,
  MenuController,
  PopoverController
} from '@ionic/angular';
import { LayerControllerComponent } from '../layer-controller/layer-controller.component';
import { MapLegendComponent } from '../map-legend/map-legend.component';

import { myEnterAnimation } from '../../animations/my-enter. animations';
import { myLeaveAnimation } from '../../animations/my-leave. animations';
@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss']
})
export class MapToolsComponent implements OnInit {
  constructor(
    private popoverController: PopoverController,
    private events: Events,
    private mapService: MapService,
    public modalController: ModalController
  ) {}
  private mapType: string;
  private mapTypeBtnText: string;
  private sceneView: esri.SceneView;
  private mapView: esri.MapView;
  // @Input() view?: any;

  ngOnInit() {
    this.mapTypeBtnText = '--';
    this.viewLoaded = this.viewLoaded.bind(this);
    this.switchMapType = this.switchMapType.bind(this);
    this.events.subscribe('esriView:loaded', this.viewLoaded);
    this.events.subscribe('esriView:changeType', this.switchMapType);
  }
  onMapClearAllBtnClick() {
    console.log('clear map');
    this.mapService.view.graphics.removeAll();
    this.mapService.view.map.removeAll();
  }
  async onLayerBtnClick() {
    const modal = await this.modalController.create({
      component: LayerControllerComponent,
      cssClass: 'transparent-modal',

      enterAnimation: myEnterAnimation,
      leaveAnimation: myLeaveAnimation,
      showBackdrop: false,
      componentProps: {
        view: this.mapService.view
      }
    });
    // this.layerGalleryModal = modal;
    return await modal.present();
  }
  async ngOnDestroy() {
    console.log('[map-tools]销毁时销毁监听事件');
    // this.events.unsubscribe('search:doSearch', this.doSearch);
    this.events.unsubscribe('esriView:loaded', this.viewLoaded);
    this.events.unsubscribe('esriView:changeType', this.switchMapType);
  }
  async onMapGobackBtnClick() {
    console.log('map goback ');
    this.mapService.view.goTo(this.mapService.getInitialExtent());
  }

  viewLoaded() {
    this.checkMapType();
  }

  checkMapType() {
    if (this.mapService.view.type === '3d') {
      this.mapTypeBtnText = '2D';
    } else {
      this.mapTypeBtnText = '3D';
    }
  }

  async switchMapType(type?) {
    console.log('23维切换');
    if (type === this.mapService.view.type) {
      return;
    }

    const [EsriMap, EsriMapView, EsriSceneView] = await loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/views/SceneView'
    ]);

    const map = this.mapService.view.map;

    const container = this.mapService.view.container;
    const viewpoint = this.mapService.view.viewpoint;

    this.mapService.view.container = null;

    let newView;

    if (this.mapService.view.type === '3d') {
      if (!this.mapView) {
        newView = new EsriMapView({
          container,
          map
        });
        this.mapService.view = this.mapView = newView;
        this.mapService.view.ui.remove('navigation-toggle');
        this.mapService.view.ui.remove('compass');
        this.mapService.view.ui.remove('zoom');
        newView.when(view => {
          view.viewpoint = viewpoint;
        });
      } else {
        this.mapView.container = container;
        this.mapView.viewpoint = viewpoint;
        this.mapService.view = this.mapView;
      }
    } else {
      if (!this.sceneView) {
        newView = new EsriSceneView({
          container,
          map
        });
        this.mapService.view = this.sceneView = newView;
        // this.mapService.view = sceneView;
        this.mapService.view.ui.remove('navigation-toggle');
        this.mapService.view.ui.remove('compass');
        this.mapService.view.ui.remove('zoom');
        newView.when(view => {
          view.viewpoint = viewpoint;
          // MapService
        });
      } else {
        this.sceneView.container = container;
        this.sceneView.viewpoint = viewpoint;
        this.mapService.view = this.sceneView;
      }
    }

    // tslint:disable-next-line
    // window.view = this.mapService.view;
    this.mapService.view.when(evt => {

      this.events.publish('esriView:typeHasChanged');
    });


    this.checkMapType();
  }
  async onMapTypeBtnClick() {
    this.switchMapType();
  }

  async onMeasureBtnClick(evt) {
    alert('not implement');
  }

  async onLegendBtnClick(evt) {
    console.log('show map legend', evt);
    const popover = await this.popoverController.create({
      component: MapLegendComponent,
      event: evt,
      // backdropDismiss: false,
      componentProps: {
        // serviceTypes: this.serviceTypes
      },
      translucent: false,
      showBackdrop: false
    });

    return await popover.present();
  }
}
