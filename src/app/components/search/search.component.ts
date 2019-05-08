import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SearchService } from '../../services/search.service';
import { Events, IonSearchbar } from '@ionic/angular';
@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  constructor(
    private events: Events,
    public modalCtrl: ModalController,
    public searchService: SearchService
  ) {}

  @ViewChild('searchbar') searchbar: IonSearchbar;

  layers = [];

  ionViewDidEnter() {
    // console.log('ionViewDidEnter page');
    this.searchbar.setFocus();
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter page');
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave page');
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave page');
  }
  async onPressEnter(evt) {
    const keyword = evt.target.value;
    // this.events.publish('search:start');
    const param = {
      keyword: keyword || '荥阳',
      outField: '*',
      geometryType: 'arcgis',
      start: 0,
      rows: 10,
      facetField: 'LAYER',
      layers: '*'
    };
    await this.dissModal();

    setTimeout(() => {
      this.events.publish('search:doSearch', {
        param
      });
    }, 100);
  }
  dissModal() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {}
}
