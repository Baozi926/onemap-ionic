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
import { debug } from 'util';

@Component({
  selector: 'app-layer-gallery',
  templateUrl: './layer-gallery.component.html',
  styleUrls: ['./layer-gallery.component.scss']
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
    this.category.forEach(v => {
      this.fetchLayers4Category(v);
    });
    // await this.fetchLayers();
  }
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
    // this.layersMap[code] =  res.results;
  }

  async onThumbnailClick(data, evt) {
    // 如果存在，删除图层
    if (this.isLayerExists(data)) {
      this.mapService.view.map.remove(
        this.mapService.view.map.findLayerById(data.id)
      );
      return;
    }

    const [FeatureLayer, MapImageLayer] = await loadModules([
      'esri/layers/FeatureLayer',
      'esri/layers/MapImageLayer'
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
        default:
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
  async fetchLayers() {
    const cacheLayer = await this.storage.get('layers');
    if (cacheLayer) {
      this.layers = cacheLayer;
      return;
    }

    const q =
      '(orgid:0123456789ABCDEF OR accountid:0123456789ABCDEF) AND tags:1000 AND NOT type:"Geoprocessing Service" AND NOT type:"Geometry Service" AND NOT owner:{esrh TO esri_zzzzz}';

    const res = await this.portalService.search({
      q,
      num: 100,
      sortField: 'modified',
      token: this.portalService.getToken(),
      f: 'json'
    });

    this.layers = res.results;
    this.storage.set('layers', this.layers);
  }
}
