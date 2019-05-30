import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { loadModules } from 'esri-loader';
import esri = __esri; // Esri TypeScript Types
const viewCache = null;

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor(public storage: Storage) {

    this.initQuality();
  }
  get view() {
    return this.view_;
  }
  set view(view) {
    this.view_ = view;
    // 在地图二三维切换时同步地图质量
    this.syncQuality();
  }
  private view_: any;

  initialExtent: any;
  quality = 'low';

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
