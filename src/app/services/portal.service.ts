import { Injectable } from '@angular/core';
import appConfig from '../configs/app';
import axios from 'axios';
import qs from 'qs';
import { Storage } from '@ionic/storage';
import esriLoader from 'esri-loader';
import app from '../configs/app';
import { Cacheable } from 'ngx-cacheable';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class PortalService {
  constructor(private storage: Storage, private http: HttpClient) {
    this.initPortalUrl();
  }

  private portalUrl: string;
  config = {
    username: '',
    password: '',
    profile: {},
    token: '',
    expires: 0
  };

  // 初始化portalUrl
  async initPortalUrl() {
    const url = await this.storage.get('portalUrl');
    if (url) {
      this.portalUrl = url;
    } else {
      this.portalUrl = appConfig.portal.baseUrl;
      await this.storage.set('portalUrl', this.portalUrl);
    }
  }

  async setPortalUrl(url) {
    this.portalUrl = url;
    await this.storage.set('portalUrl', url);
  }

  async getPortalUrl() {
    const url = await this.storage.get('portalUrl');
    return url;
  }

  async islogin() {
    const loginInfo = await this.storage.get('loginInfo');
    this.config = Object.assign(this.config, loginInfo);
    console.log('loginInfo,', loginInfo);

    // 若token到期，则尝试刷新
    if (
      this.config &&
      this.config.expires &&
      new Date().getTime() > this.config.expires
    ) {
      const res = await this.login();
      return res.success;
    }
    return (
      this.config &&
      !!this.config.username &&
      !!this.config.password &&
      !!this.config.token
    );
  }

  setUser({ username, password }) {
    this.config.username = username;
    this.config.password = password;

    return this;
  }

  async getUserFromStorage() {
    const result = await this.storage.get('loginInfo');
    return result;
  }
  async login() {
    const username = this.config.username;
    const password = this.config.password;

    const generateTokenUrl = `${this.portalUrl}/sharing/generateToken`;
    const res = await axios.post(
      generateTokenUrl,
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
      const token = data.token;
      this.config.token = data.token;
      this.config.expires = data.expires;
      await this.storage.set('loginInfo', this.config);

      const profile = await this.fetchProfile({ username, token });
      console.log('##portal profile##', profile);
      this.config.profile = profile;
      const servers = await this.fetchServersForPortal({
        orgId: profile.orgId,
        token
      });

      console.log('##portal servers##', servers);

      const [ServerInfo, esriId, EsriConfig] = await esriLoader.loadModules([
        'esri/identity/ServerInfo',
        'esri/identity/IdentityManager',
        'esri/config'
      ]);
      EsriConfig.portalUrl = this.portalUrl;

      const serverinfos = servers.map(v => {
        const serverInfo = new ServerInfo();
        serverInfo.server = v.url;
        serverInfo.tokenServiceUrl = generateTokenUrl;
        return serverInfo;
      });

      esriId.registerServers(serverinfos);

      // 给每个server注册token
      const serversPromiseAll = servers.map(v => {
        // let url = v.url
        return this.fetchServerTokenByPortalToken({
          token,
          serverUrl: v.url
        });
      });

      const resAll = await Promise.all(serversPromiseAll);
      resAll.forEach((v: any, k) => {
        console.log('portalServer', v);
        const serverInfo: any = {
          server: servers[k].url,
          token: v.token,
          userId: username,
          expires: v.expires
        };

        esriId.registerToken(serverInfo);
        console.log('##register token for server##', serverInfo);
        // mapService.registerToken(serverInfo)
        //
        // state.servers.push(serverInfo)
      });

      return {
        success: true,
        token: data.token
      };
    }

    return {
      success: false
    };
  }

  logout() {
    this.config = {
      username: '',
      password: '',
      token: '',
      expires: 0,
      profile: {}
    };
  }
  async fetchServerTokenByPortalToken({ serverUrl, token }) {
    const url = `${this.portalUrl}/sharing/generateToken`;
    const params = {
      request: 'getToken',
      serverUrl,
      token,
      referer: window.location.host || 'localhost',
      f: 'json'
    };

    const res = await axios.get(url, { params });
    return res.data;
  }

  getToken() {
    return this.config.token;
  }
  // 获取webmap的里的layer信息
  async getWebMapLayerInfoById({ id, token }) {
    const res = await axios.get(
      `${
        this.portalUrl
      }/sharing/rest/content/items/${id}/data?f=json&&token=${token || ''}`
    );
    return res.data;
  }

  async getItemDetailById({ id, token }) {
    const res = await axios.get(
      `${
        this.portalUrl
      }/sharing/rest/content/items/${id}?f=json&&token=${token || ''}`
    );
    return res.data;
  }

  // @Cacheable()
  async search(params) {
    const url = `${this.portalUrl}/sharing/rest/search`;
    const data: any = await this.http
      .get(url, {
        params
      })
      .toPromise();
    return data;
  }

  async fetchServiceInfo({url}) {
    const token = await this.getServiceToken({url});

    const data: any = await this.http
    .get(url, {
      params: {
        f: 'json',
        token
      }
    })
    .toPromise().catch(err => {

      console.warn(err);
      throw new Error(err);
    });

    return data;


  }

  async getServiceToken({
    url
  }) {
    const [esriId] = await esriLoader.loadModules([
      'esri/identity/IdentityManager'
    ]);
    const crede = await esriId.getCredential(url);

    return crede.token;
  }

  async fetchItemServiceInfo(param) {
    const token = '';


    const [esriId] = await esriLoader.loadModules([
      'esri/identity/IdentityManager'
    ]);

    console.log('get service info', param);
    const url = param.url;
    if (url) {

    const crede = await esriId.getCredential(url);
    const data: any = await this.http
        .get(url, {
          params: {
            f: 'json',
            token: crede.token
          }
        })
        .toPromise();
    return data;
    } else {
      console.warn('url is null', param);
    }
  }
  async fetchServersForPortal({ token, orgId }) {
    const url = `${
      this.portalUrl
    }/sharing/rest/portals/${orgId}/servers?f=json&token=${token}`;
    const res = await axios.get(url);

    return res.data.servers;
  }

  async fetchPortalInfo() {
    const url = `${
      this.portalUrl
    }/sharing/rest/portals/self?culture=zh-cn&f=json`;
    const res = await axios.get(url);
    return res.data;
  }

  async fetchProfile({ username, token }) {
    const url = `${this.portalUrl}/sharing/rest/community/users/`;
    const res = await axios.post(
      url + '/' + username,
      qs.stringify({ username, token, f: 'json' })
    );
    return res.data;
  }

  getThumbnailUrl(item, token?, noAuthCheck?) {
    if (item.thumbnail) {
      if (item.access === 'public') {
        return `${this.portalUrl}/sharing/rest/content/items/${item.id}/info/${
          item.thumbnail
        }`;
      } else {
        if (item._hasAuth || noAuthCheck) {
          return `${this.portalUrl}/sharing/rest/content/items/${
            item.id
          }/info/${item.thumbnail}?token=${token}`;
        } else {
          if (item.owner && item.owner === this.config.username) {
            return `${this.portalUrl}/sharing/rest/content/items/${
              item.id
            }/info/${item.thumbnail}?token=${token}`;
          }

          return 'assets/images/lock.png';
        }
      }
    } else {
      return 'images/map/basemaps/彩色中文.jpg';
    }
  }
}
