import { Component, OnInit, Input } from '@angular/core';
import { loadModules } from 'esri-loader';
import { Events } from '@ionic/angular';
import esri = __esri; // Esri TypeScript Types
import { MapService } from 'src/app/services/map.service';
@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss']
})
export class MapToolsComponent implements OnInit {
  constructor(private events: Events, private mapService: MapService) {}
  private mapType: string;
  private mapTypeBtnText: string;
  private sceneView: esri.SceneView;
  private mapView: esri.MapView;
  // @Input() view?: any;


  ngOnInit() {
    this.mapTypeBtnText = '--';
    this.viewLoaded = this.viewLoaded.bind(this);
    this.events.subscribe('esriView:loaded', this.viewLoaded);
  }
  onMapClearAllBtnClick() {
    console.log('clear map');
    this.mapService.view.graphics.removeAll();
    this.mapService.view.map.removeAll();
  }
  async ngOnDestroy() {
    console.log('销毁时销毁监听事件');
    // this.events.unsubscribe('search:doSearch', this.doSearch);
    this.events.unsubscribe('esriView:loaded', this.viewLoaded);
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
  async onMapTypeBtnClick() {
    console.log('23维切换');
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
        this.mapService.view  = this.mapView = newView;
        this.mapService.view.ui.remove('navigation-toggle');
        this.mapService.view.ui.remove('compass');
        this.mapService.view.ui.remove('zoom');
        newView.when(view => {
          view.viewpoint = viewpoint;

        });
      }  else {
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
        this.mapService.view  = this.sceneView = newView;
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

    this.checkMapType();

  }
}
