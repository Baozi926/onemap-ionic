import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { PortalService } from '../../services/portal.service';
import { MapService } from '../../services/map.service';
import { SearchService } from '../../services/search.service';
import { Storage } from '@ionic/storage';
import esri = __esri; // Esri TypeScript Types
import { loadModules } from 'esri-loader';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-layer-gallery',
  templateUrl: './layer-gallery.component.html',
  styleUrls: ['./layer-gallery.component.scss'],
  animations: [
    trigger('items', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }), // initial
        animate(
          '0.7s cubic-bezier(.8, -0.6, 0.2, 1.5)',
          style({ transform: 'scale(1)', opacity: 1 })
        ) // final
      ])
    ])
  ]
})
export class LayerGalleryComponent implements OnInit {
  constructor(
    public modalCtrl: ModalController,
    public portalService: PortalService,
    public storage: Storage,
    private mapService: MapService,
    private searchService: SearchService
  ) {}

  @ViewChild(IonContent) content: IonContent;
  private layerFilter: string;
  private category = [];

  // @Input() view?: any;
  private layers = [];

  private layersMap = {};

  private isFiltered = false;

  mapTypes = [
    {
      name: '栅格服务',
      value: 'Map Service',
      isChecked: true
    },
    {
      name: '矢量服务',
      value: 'Feature Service',
      isChecked: true
    }
  ];

  hideMapService = false;
  hideFeatureService = false;

  onFilterChange(evt, item) {
    // debugger;
    if (item.value === 'Map Service') {
      this.hideMapService = !item.isChecked;
    } else if (item.value === 'Feature Service') {
      this.hideFeatureService = !item.isChecked;
    }
  }

  dissModal() {
    this.modalCtrl.dismiss();
  }
  onCategoryChange(evt) {
    const cate = evt.detail.value;
    if (!cate) {
      this.content.scrollToTop();
    } else {
      const target = window.document.getElementById('title_' + cate);
      this.content.scrollToPoint(0, target.offsetTop, 200);
    }
  }
  isLayerExists(layer) {
    if (this.mapService.view) {
      return !!this.mapService.view.map.findLayerById(layer.id);
    }
  }
  async ngOnInit() {
    await this.fetchCategory();
    this.category.forEach((v, k) => {
      // setTimeout(() => {
      this.fetchLayers4Category(v);
      // }, 0);
    });
  }

  // async ngAfterContentInit() {

  // }

  // async onOn
  async fetchLayers4Category(param) {
    const q = `tags:${
      param.code
    } AND NOT type:"Geoprocessing Service" AND NOT type:"Geometry Service" AND NOT owner:{esrh TO esri_zzzzz}`;

    const res = await this.portalService.search({
      q,
      num: 100,
      sortField: 'modified',
      token: this.portalService.getToken(),
      f: 'json'
    });

    param.layers = res.results;
  }

  async onThumbnailClick(data, evt) {
    // 如果存在，删除图层
    if (this.isLayerExists(data)) {
      this.mapService.view.map.remove(
        this.mapService.view.map.findLayerById(data.id)
      );
      return;
    }

    const [FeatureLayer, MapImageLayer,  IntegratedMeshLayer] = await loadModules([
      'esri/layers/FeatureLayer',
      'esri/layers/MapImageLayer',
      'esri/layers/IntegratedMeshLayer'
    ]);
    let layer;

    if (data.url) {
      switch (data.type) {
        case 'Map Service':
          layer = new MapImageLayer({
            id: data.id,
            url: data.url,
            title: data.title
          });
          break;

        case 'Feature Service':
          layer = new FeatureLayer({
            id: data.id,
            url: data.url,
            title: data.title
          });
          break;

        case 'Scene Service':
          const layerInfo = await this.portalService.fetchItemServiceInfo(
            data
          );
          console.log(layerInfo);
          const layerType = layerInfo.layers[0].layerType;

          if (layerType === 'IntegratedMesh') {
            layer = new IntegratedMeshLayer({
              id: data.id,
              url: data.url,
              title: data.title
            });

          } else {
            console.log(data);
            alert('not implement');
          }
          break;
        default:
          console.log(data);
          alert('not implement');
      }
      if (layer) {
        this.mapService.view.map.add(layer);
        layer.when(
          () => {
            this.mapService.view.goTo(layer.fullExtent);
          },
          err => {
            console.log('加载图层失败', err);
          }
        );
      }
    } else {
      console.log('url is none');
    }
  }

  getThumbnailUrl(item) {
    return this.portalService.getThumbnailUrl(
      item,
      this.portalService.getToken()
    );
  }

  async fetchCategory() {
    const category = await this.searchService.fetchCategroy();

    this.category = category.map(v => {
      v.layers = [];
      return v;
    });
    // this.category.forEac
  }
}
