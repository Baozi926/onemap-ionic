import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MapService } from '../../services/map.service';
import { loadModules } from 'esri-loader';
@Component({
  selector: 'app-layer-controller',
  templateUrl: './layer-controller.component.html',
  styleUrls: ['./layer-controller.component.scss']
})
export class LayerControllerComponent implements OnInit {
  constructor(
    public modalController: ModalController,
    private mapService: MapService
  ) {}
  layers = [];
  keyLayerIds = ['search-layer']; // 系统自己使用的图层id
  activeBasemapId = '';
  basemaps = [];
  async ngOnInit() {
    if (this.mapService.view) {
      const layers = this.mapService.view.map.layers.items;
      this.layers = layers.filter(v => {
        return this.keyLayerIds.some(vv => {
          return vv !== v.id;
        });
      });
      this.activeBasemapId = this.mapService.view.map.basemap.id;
    }

    const [EsriBasemap] = await loadModules(['esri/Basemap']);

    EsriBasemap.fromId('topo');
    this.basemaps = [
      EsriBasemap.fromId('topo'),
      EsriBasemap.fromId('streets-night-vector')
    ];
  }
  getBasemapThumbnail()  {
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
  dissModal() {
    this.modalController.dismiss();
  }
}
