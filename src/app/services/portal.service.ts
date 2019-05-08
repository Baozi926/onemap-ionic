import { Injectable } from '@angular/core';
import appConfig from '../configs/app';
import axios from 'axios';
import qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class PortalService {
  constructor() {}
  config = {
    username: '',
    password: '',
    token: '',
    expires: 0
  };

  islogin() {
    return !!this.config.token;
  }

  async login({ username, password }) {
    this.config.username = username;
    this.config.password = password;

    const url = appConfig.portal.generateTokenUrl;
    const res = await axios.post(
      url,
      qs.stringify({
        username,
        password,
        ip: '',
        referer: '',
        client: 'requestip',
        expiration: 3600,
        f: 'json'
      })
    );

    const data = res.data;

    if (data.token) {
      this.config.token = data.token;
      this.config.expires = data.expires;
    }

    return this;
  }

  getToken() {
    return this.config.token;
  }
  // 获取webmap的里的layer信息
  async getWebMapLayerInfoById({ id, token }) {
    const res = await axios.get(`${appConfig.portal.baseUrl}/sharing/rest/content/items/${id}/data?f=json&&token=${token || ''}`);
    return res.data;
  }

   async  getItemDetailById({ id, token }) {
    const res = await axios.get(`${appConfig.portal.baseUrl}/sharing/rest/content/items/${id}?f=json&&token=${token || ''}`);
    return res.data;
  }

  async search(params) {
    const url = appConfig.portal.portalSearchUrl;
    const res = await axios.get(url, {
      params
    });
    return res.data;
  }

   getThumbnailUrl(item, token?, noAuthCheck?) {
    if (item.access === 'public') {
      if (item.thumbnail) {
        return `${appConfig.portal.baseUrl}/sharing/rest/content/items/${item.id}/info/${item.thumbnail}`;
      } else {
        return 'images/map/basemaps/彩色中文.jpg';
      }
    } else {
      if (item._hasAuth || noAuthCheck) {
        return `${appConfig.portal.baseUrl}/sharing/rest/content/items/${item.id}/info/${item.thumbnail}?token=${token}`;
      } else {
        return 'images/lock.png';
      }
    }
  }
}
