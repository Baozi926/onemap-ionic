
import { MapService } from '../../services/map.service';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { loadModules } from 'esri-loader';

@Component({
  selector: 'app-map-legend',
  templateUrl: './map-legend.component.html',
  styleUrls: ['./map-legend.component.scss']
})
export class MapLegendComponent implements OnInit {
  constructor(private mapService: MapService) {}
  layers = [];



  @ViewChild('mapLegend') private mapLegendEl: ElementRef;

  ngOnInit() {
    this.layers = this.mapService.view.map.layers.items;
    // this.layers.for
    console.log('init legend');
    this.initLegend();
  }

  async initLegend() {
    const [Legend, Expand] = await loadModules([
      'esri/widgets/Legend',
      'esri/widgets/Expand'
    ]);

    const legend = new Legend({
      view: this.mapService.getView(),
      container: this.mapLegendEl.nativeElement
    });

    // Mobile

    // const expandLegend = new Expand({
    //   view: this.mapService.getView(),
    //   content: new Legend({
    //     view: this.mapService.getView(),
    //     container: this.mapLegendEl.nativeElement
    //   })
    // });
      // this.layers.forEach( async (v) => {
      //   const legendInfo = await this.mapService.fetchLengend(v);
      //   console.log(legendInfo);

      // });


  }
}
