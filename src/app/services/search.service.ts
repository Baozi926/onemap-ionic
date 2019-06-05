import { Injectable } from '@angular/core';
import appConfig from '../configs/app';
import axios from 'axios';
import qs from 'qs';
import { Events } from '@ionic/angular';

import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(public events: Events, private http: HttpClient) {
    this.fetchDictionary();
    // this.fetchCategroy();
  }

  dict: any;

  category: any;

  async search(param) {
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
    const data: any = await this.http
    .get(url)
    .toPromise();
    // const res = await axios.get(url);
    // this.category = res.data;
    // console.log('分类字典已获取', data);
    return data;
  }

  async fetchDictionary() {
    const url = 'assets/configs/dictionary.json';
    // const res = await axios.get(url);
    const data: any = await this.http
    .get(url)
    .toPromise();
    this.dict = data;
    // console.log('app 字典已获取', data);
  }

  getFieldDictForLayer(layer) {
    if (this.dict && this.dict.searchFieldDict) {
      return this.dict.searchFieldDict[layer];
    } else {
      throw new Error('字典为空');
    }


  }
}
