import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { loadModules } from 'esri-loader';
import { HttpClient } from '@angular/common/http';
import { PortalService } from './portal.service';

import esriLoader from 'esri-loader';
import esri = __esri; // Esri TypeScript Types
const viewCache = null;

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor(
    public storage: Storage,
    private http: HttpClient,
    private portalService: PortalService
  ) {
    this.initQuality();
  }
  get view() {
    return this.view_;
  }
  set view(view) {
    this.view_ = view;
    // 在地图二三维切换时同步地图质量
    if (this.isSmartMode) {
      // this.preprocessLayersForMapTypeChange();
    }
    this.syncQuality();
  }

  mapView;
  sceneView;

  private view_: any;

  mode = 'mix';

  // 在二三维切换时选择最佳的显示图层
  isSmartMode = true;

  initialExtent: any;
  quality = 'low';

  private serviceStore = {};

  pointFeatureLayerMap = {};

  noPointFeatureServiceCache = {};

  addLayer(layer) {
    console.log('add layer', layer);
    if (
      layer.type !== 'integrated-mesh' ||
      layer.type !== 'scene' ||
      layer.type !== 'building-scene'
    ) {
      this.mapView.map.add(layer);
    }
    this.sceneView.map.add(layer);
  }

  removeLayer(layer) {
    console.log('remove layer', layer);
    this.mapView.map.remove(layer);
    this.sceneView.map.remove(layer);
  }

  setActiveView(view) {
    this.view = view;
  }
  setMapView(mapView) {
    this.mapView = mapView;
  }
  setSceneView(sceneView) {
    this.sceneView = sceneView;
  }

  // 对于有featureLayer
  // async preprocessLayersForMapTypeChange() {
  //   const [  FeatureLayer,
  //     MapImageLayer] = await esriLoader.loadModules([
  //     'esri/layers/FeatureLayer',
  //     'esri/layers/MapImageLayer',
  //   ]);

  //   const pointFeatureLayers = this.view.map.layers.filter(v => {
  //     return this.pointFeatureLayerMap[v.id];
  //   });

  //   pointFeatureLayers.forEach(v => {
  //     this.view.map.remove(v);
  //     let layer;
  //     let url;
  //     if (this.view.type === '2d') {
  //        url = v.url.replace('FeatureServer', 'MapServer');
  //        layer = new MapImageLayer({
  //         id: v.id,
  //         url,
  //         title: v.title
  //       });
  //     } else {
  //        url = v.url.replace('MapServer', 'FeatureServer');
  //        layer = new FeatureLayer({
  //         id: v.id,
  //         url,
  //         title: v.title,
  //         minScale: 0,
  //         maxScale: 0,
  //         featureReduction: {
  //           type: 'selection'
  //         }
  //       });
  //     }
  //     this.view.map.add(layer);
  //   });
  // }

  isItemMapService(item) {
    return item.type === 'Map Service';
    // if (!item || !item.typeKeywords) {
    //   return false;
    // }

    // return item.typeKeywords.some(v => {
    //   return v === 'Map Service';
    // });
  }

  isItemFeatureService(item) {
    return item.type === 'Feature Service';
    // if (!item || !item.typeKeywords) {
    //   return false;
    // }

    // return item.typeKeywords.some(v => {
    //   return v === 'Feature Service';
    // });
  }

  // async smartTransform(item) {
  //   console.log('智能转换');
  //   // 如果不是mapservice 或者featureservice 直接返回
  //   const isMapService = this.isItemMapService(item);
  //   const isFeatureService = this.isItemFeatureService(item);
  //   if (!isMapService && !isFeatureService) {
  //     return item;
  //   }

  //   if (item) {
  //     // var token =  await this.portalService.getServiceToken(item);
  //     if (this.isSmartMode) {
  //       try {
  //         const data = await this.portalService.fetchServiceInfo(item);
  //         if (data.currentVersion && data.currentVersion >= 10.7) {
  //           // 10.7以后可以直接通过主图层获取自图层的geometry类型
  //           alert('not implmented');
  //         } else {
  //           if (this.view.type === '3d') {
  //             // 地图为3d时，判断自图层是否都是点图层，若为点图层，则转换成featureLayer
  //             if (isMapService) {
  //               const promises = data.layers.map(v => {
  //                 return this.portalService.fetchServiceInfo({
  //                   url: item.url + '/' + v.id
  //                 });
  //               });

  //               const res = await Promise.all(promises);
  //               console.log(res);
  //               const hasNotPointLayer = res.some((v: any) => {
  //                 return (
  //                   v.geometryType && v.geometryType !== 'esriGeometryPoint'
  //                 );
  //               });

  //               if (!hasNotPointLayer) {
  //                 const featureLayerUrl = item.url.replace(
  //                   'MapServer',
  //                   'FeatureServer'
  //                 );

  //                 const featureServiceInfo = await this.portalService.fetchServiceInfo(
  //                   {
  //                     url: featureLayerUrl
  //                   }
  //                 );

  //                 // 如果featureService存在，改为加载FeatureService
  //                 if (featureServiceInfo && !featureServiceInfo.error) {
  //                   item.type = 'Feature Service';
  //                   item.url = featureLayerUrl;
  //                   this.pointFeatureLayerMap[item.id] = true;
  //                 }
  //               }
  //             }
  //           }

  //           // debugger;
  //         }
  //         // return item;
  //         // debugger;
  //       } catch (err) {
  //         console.warn(err);
  //       }
  //     }
  //   }
  //   return item;
  // }

  //  当服务有featureServer和MapServer时，只取FeatureServer
  mixItems(layers) {
    return layers;
  }

  async fetchLengend(item, token?) {
    const [esriId] = await esriLoader.loadModules([
      'esri/identity/IdentityManager'
    ]);

    // console.log('get service info', param);
    const url = item.url;
    if (url) {
      const crede = await esriId.getCredential(url);

      const data: any = await this.http
        .get(`${item.url}/legend`, {
          params: {
            f: 'json',
            token: token || crede.token
          }
        })
        .toPromise();

      return data;
    }
  }

  getView() {
    return this.view;
  }
  getInitialExtent() {
    return this.initialExtent;
  }
  setInitialExtent(extent) {
    this.initialExtent = extent;
  }

  async initQuality() {
    let quality = await this.storage.get('map.quality');
    quality = quality || 'medium';

    this.quality = quality;
    this.syncQuality();
    //  this.setQuality(quality);
  }

  setQuality(quality) {
    this.quality = quality;
    if (this.view_) {
      this.view_.qualityProfile = this.quality;
    } else {
      console.warn('view is none ', this);
    }

    this.storage.set('map.quality', quality);
  }

  syncQuality() {
    if (this.view_) {
      this.view_.qualityProfile = this.quality;
    }
  }
}
