import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MapService } from '../../services/map.service';
import { loadModules } from 'esri-loader';
import {
  ModalController,
  IonContent,
  PopoverController,
  ToastController
} from '@ionic/angular';
@Component({
  selector: 'app-maintenance-record',
  templateUrl: './maintenance-record.component.html',
  styleUrls: ['./maintenance-record.component.scss']
})
export class MaintenanceRecordComponent implements OnInit {
  constructor(
    private modalController: ModalController,
    private httpClient: HttpClient,
    private mapService: MapService
  ) {}

  features = [];
  total = 0;

  graphics = [];

  async ngOnInit() {
    const url =
      'https://nsbdgis.ysy.com.cn/arcgis/rest/services/zhuanti/equipmentReport/FeatureServer/0/query';

    const [QueryTask, Query] = await loadModules([
      'esri/tasks/QueryTask',
      'esri/tasks/support/Query'
    ]);

    const queryTask = new QueryTask({
      url
    });
    const query = new Query();
    query.returnGeometry = true;
    query.outFields = ['*'];
    query.where = '1=1';

    queryTask.execute(query).then(results => {
      this.features = results.features;
    });

    queryTask.executeForCount(query).then(results => {
      this.total = results;
    });

    // this.features = res.features;
  }
  onLocateBtnClick(evt, graphic) {
    this.mapService.getView().graphics.removeMany(this.graphics);

    this.graphics = [];

    console.log('地图显示', graphic);
    // const graphic = item.graphic;
    graphic.symbol = {
      type: 'simple-fill', // autocasts as new SimpleFillSymbol()
      color: [0, 0, 200, 0.5],
      style: 'solid',
      outline: {
        color: [0, 0, 200, 1],
        width: 2
      }
    };
    this.graphics.push(graphic);
    this.mapService
      .getView()
      .goTo(graphic)
      .then(() => {
        this.mapService.getView().graphics.add(graphic);
      });

    this.dissModal();
  }
  dissModal() {
    this.modalController.dismiss();
  }
}
