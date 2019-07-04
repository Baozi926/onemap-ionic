import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MapService } from '../../services/map.service';
import { PortalService } from '../../services/portal.service';
import { loadModules } from 'esri-loader';

import { Events } from '@ionic/angular';
@Component({
  selector: 'app-layer-controller',
  templateUrl: './layer-controller.component.html',
  styleUrls: ['./layer-controller.component.scss']
})
export class LayerControllerComponent implements OnInit {
  constructor(
    public modalController: ModalController,
    private mapService: MapService,
    private events: Events,
    private portalService: PortalService
  ) {}

  mapQuality = 1;
  layers = [];
  keyLayerIds = ['search-layer']; // 系统自己使用的图层id
  activeBasemapId = '';
  basemaps = [];
  async ngOnInit() {
    console.log('[layer-controller] init');

    this.basemaps = await this.portalService.fetchBaseMaps();

    const mapQuality = this.mapService.view.qualityProfile;
    if (mapQuality === 'low') {
      this.mapQuality = 0;
    } else if (mapQuality === 'medium') {
      this.mapQuality = 1;
    } else {
      this.mapQuality = 2;
    }

    if (this.mapService.view) {
      const layers = this.mapService.view.map.layers.items;
      this.layers = layers.filter(v => {
        return this.keyLayerIds.some(vv => {
          return vv !== v.id;
        });
      });
      this.activeBasemapId = this.mapService.view.map.basemap.id;
    }

  }
  getBasemapThumbnail(basemap) {
    if (basemap) {
      return basemap.thumbnailUrl;
    }

    return 'assets/images/map-thumbnail.jpg';
  }
  onDeleteBtnClick(evt, layer) {
    this.layers = this.layers.filter(v => {
      return v.id !== layer.id;
    });

    this.mapService.view.map.remove(layer);
  }
  onBasemapClick(evt, basemap) {
    this.activeBasemapId = basemap.id;
    this.mapService.view.map.basemap = basemap;
  }

  onLocateBtnClick(evt, layer) {
    this.mapService.getView().goTo(layer.fullExtent);
  }

  onMapQualityChange(evt) {
    const value = evt.detail.value;
    if (value === 0) {
      this.mapService.setQuality('low');
    } else if (value === 1) {
      this.mapService.setQuality('medium');
    } else {
      this.mapService.setQuality('high');
    }
  }
  dissModal() {
    this.modalController.dismiss();
  }
}
