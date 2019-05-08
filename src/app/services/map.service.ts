import { Injectable } from '@angular/core';

import { loadModules } from 'esri-loader';
import esri = __esri; // Esri TypeScript Types
const viewCache = null;

@Injectable({
  providedIn: 'root'
})
export class MapService {
 private view_: any;
  constructor() {}
  initialExtent: any;
  get view() {
    return this.view_;
  }
  set view(view) {
    this.view_ = view;
  }


  getInitialExtent() {
    return this.initialExtent;
  }
  setInitialExtent(extent) {
    this.initialExtent = extent;

  }


}
