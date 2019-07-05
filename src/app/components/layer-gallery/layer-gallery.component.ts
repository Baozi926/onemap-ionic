import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  ModalController,
  IonContent,
  PopoverController,
  ToastController
} from '@ionic/angular';
import { PortalService } from '../../services/portal.service';
import { MapService } from '../../services/map.service';
import { SearchService } from '../../services/search.service';
import { Storage } from '@ionic/storage';
import esri = __esri; // Esri TypeScript Types
import { loadModules } from 'esri-loader';
import { trigger, transition, style, animate } from '@angular/animations';
import { ServiceTypeFilterComponent } from '../../components/service-type-filter/service-type-filter.component';
// import { SearchPipe } from '../../pipes/search.pipe';
import { Events } from '@ionic/angular';
// import { debug } from 'util';
// import { url } from 'inspector';
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
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1)' }),

        animate('0.7s', style({ opacity: 0, transform: 'scale(.7)' }))
      ])
    ])
  ]
})
export class LayerGalleryComponent implements OnInit {
  constructor(
    private popoverController: PopoverController,
    public modalCtrl: ModalController,
    public portalService: PortalService,
    public storage: Storage,
    private mapService: MapService,
    private searchService: SearchService,
    private events: Events,
    private toastController: ToastController
  ) {
    this.showFilter = !this.mapService.isSmartMode;
    if (this.mapService.isSmartMode) {
      this.serviceTypes = [
        {
          name: '栅格服务',
          value: 'Map Service',
          isChecked: true
        },
        {
          name: '矢量服务',
          value: 'Feature Service',
          isChecked: true
        },
        {
          name: '场景服务',
          value: 'Scene Service',
          isChecked: true
        }
      ];
    }
  }

  @ViewChild(IonContent) content: IonContent;
  private layerFilter: string;
  private category = [];
  private showFilter: boolean;

  // @Input() view?: any;
  private layers = [];

  private layersMap = {};

  private isFiltered = false;

  hideMapService = false;
  hideFeatureService = false;

  serviceTypes = [
    {
      name: '栅格服务',
      value: 'Map Service',
      isChecked: true
    },
    {
      name: '矢量服务',
      value: 'Feature Service',
      isChecked: false
    },
    {
      name: '场景服务',
      value: 'Scene Service',
      isChecked: true
    }
  ];

  // filterKeyword = ['Map Service', 'Feature Service'].join(',')

  getFilterKeywords() {
    return this.serviceTypes
      .filter(v => {
        return v.isChecked;
      })
      .map(v => {
        return v.value;
      })
      .join(',');
  }

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

  async onFilterBtnClick(evt) {
    // popoverController.
    const popover = await this.popoverController.create({
      component: ServiceTypeFilterComponent,
      event: evt,
      componentProps: {
        serviceTypes: this.serviceTypes
      },
      translucent: true
    });

    return await popover.present();
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
      // console.log('判断是否存在', layer.id, layer);
      return !!this.mapService.view.map.findLayerById(layer.id);
    }
  }
  async ionViewDidEnter() {
    if (this.category.length === 0) {
      await this.fetchCategory();
    }

    this.category.forEach(async (v, k) => {
      setTimeout(async () => {
        await this.fetchLayers4Category(v);
        v.layers.forEach(layer => {
          layer.active = this.isLayerExists(layer);
        });
      }, 0);
    });
  }
  async ngOnInit() {
    await this.fetchCategory();
    // await Promise.all(promises);
  }

  // async ngAfterContentInit() {

  // }

  // async onOn
  async fetchLayers4Category(param) {
    console.log('获取分类数据', param);
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

    let layers = res.results;

    if (this.mapService.isSmartMode) {
      // 找出同事有FeatureService和MapService的服务
      layers.forEach(v => {
        const filter = layers.filter(vv => {
          return vv.title === v.title;
        });

        if (filter.length > 1) {
          filter.forEach(vvv => {
            if (vvv.type === 'Map Service') {
              v.mapServiceUrl = vvv.url;
            } else if (vvv.type === 'Feature Service') {
              v.featureServiceUrl = vvv.url;
            }
          });
        }
      });

      // 剔除FeatureService
      layers = layers.filter(v => {
        return v.type !== 'Feature Service';
      });
    }

    param.layers = layers;
  }

  async onThumbnailClick(data, evt) {
    console.log('img-click', data);
    // 如果存在，删除图层
    if (data.active) {
      this.mapService.removeLayer(
        this.mapService.view.map.findLayerById(data.id)
      );
      data.active = false;
      return;
    }

    const [
      FeatureLayer,
      MapImageLayer,
      IntegratedMeshLayer,
      SceneLayer,
      GroupLayer,
      BuildingSceneLayer
    ] = await loadModules([
      'esri/layers/FeatureLayer',
      'esri/layers/MapImageLayer',
      'esri/layers/IntegratedMeshLayer',
      'esri/layers/SceneLayer',
      'esri/layers/GroupLayer',
      'esri/layers/BuildingSceneLayer'
    ]);
    let layer;

    if (data.url) {
      switch (data.type) {
        case 'Map Service': {
          if (this.mapService.isSmartMode && data.featureServiceUrl) {
            const layerInfo = await this.portalService.fetchServiceInfo({
              url: data.featureServiceUrl
            });

            const hasNotPointLayer = layerInfo.layers.some(v => {
              return v.geometryType !== 'esriGeometryPoint';
            });

            if (hasNotPointLayer) {
              layer = new MapImageLayer({
                id: data.id,
                url: data.url,
                title: data.title
              });
            } else {
              layer = new GroupLayer({
                title: data.title,
                id: data.id
              });

              layerInfo.layers.forEach(v => {
                if (v.geometryType && v.defaultVisibility) {
                  layer.layers.add(
                    new FeatureLayer({
                      url: data.featureServiceUrl + '/' + v.id
                    })
                  );
                }
              });
            }
          } else {
            layer = new MapImageLayer({
              id: data.id,
              url: data.url,
              title: data.title
            });
          }

          break;
        }
        case 'Feature Service':
          layer = new FeatureLayer({
            id: data.id,
            url: data.url,
            title: data.title
          });
          break;

        case 'Scene Service':
          // const layerInfo = await this.portalService.fetchItemServiceInfo(data);
          // console.log(layerInfo);
          // const layerType = layerInfo.layers[0].layerType;
          // 通过keywords 判断具体的类型
          this.events.publish('esriView:changeType', '3d');
          if (this.mapService.view.type === '2d') {
            const toast = await this.toastController.create({
              color: 'dark',
              message: '自动切换到三维地图',
              duration: 2000,
              position: 'top'
            });
            toast.present();
          }
          if (
            data.typeKeywords.some(v => {
              return v === 'IntegratedMesh';
            })
          ) {
            layer = new IntegratedMeshLayer({
              id: data.id,
              url: data.url,
              title: data.title
            });
          } else if (
            data.typeKeywords.some(v => {
              return v === '3DObject';
            })
          ) {
            layer = new SceneLayer({
              id: data.id,
              url: data.url,
              title: data.title
            });
          } else if (
            data.typeKeywords.some(v => {
              return v === 'Building';
            })
          ) {
            layer = new BuildingSceneLayer({
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
        this.mapService.addLayer(layer);

        // 如果是grouplayer 则获取子图层的extent
        if (layer.type === 'group') {
          data.active = true;
          layer.layers.items[0].when(sublayer => {
            this.mapService.view.goTo(sublayer.fullExtent);
            layer.fullExtent = sublayer;
          });
        } else {
          layer.when(
            () => {
              data.active = true;
              this.mapService.view.goTo(layer.fullExtent);
            },
            err => {
              console.warn('加载图层失败', err);
            }
          );
        }
      }
    } else {
      console.warn('url is none');
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
