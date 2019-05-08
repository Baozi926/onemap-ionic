import { Injectable } from '@angular/core';
import appConfig from '../configs/app';
import axios from 'axios';
import qs from 'qs';
import { Events } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(public events: Events) {
    this.fetchDictionary();
    // this.fetchCategroy();
  }

  dict: any;

  category: any;

  async search(param) {
    // this.events.publish('search:start');
    const res = await axios.post(
      appConfig.search.byKeywordUrl,
      qs.stringify(param)
    );

    return res.data;
  }

  async searchByLayers(param) {
    const res = await axios.post(
      appConfig.search.byKeywordAndLayersUrl,
      qs.stringify(param)
    );

    return res.data;
  }

  getCategory() {
    return this.category;
  }

  async fetchCategroy() {
    if  (this.category ) {
      return this.category;
    }
    const url = 'assets/configs/category.json';
    const res = await axios.get(url);
    this.category = res.data;
    console.log('分类字典已获取', res.data);
    return res.data;
  }

  async fetchDictionary() {
    const url = 'assets/configs/dictionary.json';
    const res = await axios.get(url);
    this.dict = res.data;
    console.log('app 字典已获取', res.data);
  }

  getFieldDictForLayer(layer) {
    if (this.dict && this.dict.searchFieldDict) {
      return this.dict.searchFieldDict[layer];
    } else {
      throw new Error('字典为空');
    }


  }
}
