import { Component, OnInit } from '@angular/core';
import { ModalController, Events, MenuController } from '@ionic/angular';
import { SearchService } from '../../services/search.service';
import { PortalService } from '../../services/portal.service';
import {trigger, transition, style, animate} from '@angular/animations';

import { myEnterAnimation } from '../../animations/my-enter. animations';
import { myLeaveAnimation } from '../../animations/my-leave. animations';


import { ResourceDetailComponent } from '../../components/resource-detail/resource-detail.component';
@Component({
  selector: 'app-resource-gallery',
  templateUrl: './resource-gallery.page.html',
  styleUrls: ['./resource-gallery.page.scss'],
  animations: [
    trigger('items', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),  // initial
        animate('0.7s cubic-bezier(.8, -0.6, 0.2, 1.5)',
        style({ transform: 'scale(1)', opacity: 1 }))  // final
      ])
    ])
  ]
})
export class ResourceGalleryPage implements OnInit {
  constructor(private searchService: SearchService,
              private portalService: PortalService,
              private modalController: ModalController) {}
  firstCateFilter: string;
  secondeCateFilter: string;
  category = [];
  data = [];
  subCate = [];
  ionViewDidEnter() {
    if (this.category.length) {
      // this.subCate = this.category[0].children;
      this.onFirstCategoryClick(null, this.category[0]);
    }
    console.log('subcate', this.subCate);
  }
  stopElasticity(evt) {
    evt.preventDefault();
    console.log('stopElasticity');
  }

  onFirstCategoryClick(evt, item) {
    this.subCate = item.children;
    this.firstCateFilter = item.code;
    this.secondeCateFilter = null;
    this.refreshData();
  }

  imgLoaded(evt) {
    console.log('imgloaded', evt);

  }

  onSecondeCategoryClick(evt, item) {
    this.secondeCateFilter = item.code;
    this.refreshData();
  }
 async onItemClick(evt, item) {
    const modal = await this.modalController.create({
      component: ResourceDetailComponent,
      cssClass: 'search-modal',
      keyboardClose: false,
      enterAnimation: myEnterAnimation,
      leaveAnimation: myLeaveAnimation,
      // animation: 'slide-in-right',
      showBackdrop: false,
      componentProps: {
        item
        // view: this.mapService.view
      }
    });
    return await modal.present();

  }

  getThumbnailUrl(item) {
    return this.portalService.getThumbnailUrl(
      item,
      this.portalService.getToken()
    );
  }

  async refreshData() {
    const filter = this.secondeCateFilter || this.firstCateFilter;
    const q = `tags:${filter}` || 'tags:1000';

    const res = await this.portalService.search({
      q,
      num: 100,
      sortField: 'modified',
      token: this.portalService.getToken(),
      f: 'json'
    });

    if (res) {

    this.data = res.results;
    }


    // this.data = res;
    // this.searchService.search({});
  }

  async ngOnInit() {
    this.category = await this.searchService.fetchCategroy();
  }
}
