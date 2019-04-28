import { Injectable } from '@angular/core';

import { loadModules } from 'esri-loader';
import esri = __esri; // Esri TypeScript Types
const viewCache = null;

@Injectable({
  providedIn: 'root'
})
export class MapService {
 private view = null;
  constructor() {}
  async createMap({ container, basemap, center, zoom }) {
    try {
      // Load the modules for the ArcGIS API for JavaScript
      const [EsriMap, EsriMapView, EsriSceneView] = await loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/views/SceneView'
      ]);

      // Configure the Map
      const mapProperties: esri.MapProperties = {
        basemap
      };

      const map: esri.Map = new EsriMap(mapProperties);

      // Initialize the MapView
      const mapViewProperties: esri.MapViewProperties = {
        container,
        center,
        zoom,
        map
      };

      const view = new EsriSceneView(mapViewProperties);
      this.view = view;

      view.ui.remove('zoom');
      view.ui.remove('navigation');
      return view;
    } catch (error) {
      console.log('EsriLoader: ', error);
    }
  }
}
