import { Injectable } from '@angular/core';
import appConfig from '../configs/app';
import axios from 'axios';
import qs from 'qs';
import { Storage } from '@ionic/storage';
import esriLoader from 'esri-loader';
import app from '../configs/app';
import { Cacheable } from 'ngx-cacheable';
import { HttpClient } from '@angular/common/http';
import { loadModules } from 'esri-loader';
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

  portalInfo = null;
  basemaps;

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

  async registerServer() {
    const generateTokenUrl = `${this.portalUrl}/sharing/generateToken`;
    const profile = await this.fetchProfile({
      username: this.config.username,
      token: this.config.token
    });
    console.log('##portal profile##', profile);
    this.config.profile = profile;
    const servers = await this.fetchServersForPortal({
      orgId: profile.orgId,
      token: this.config.token
    });

    console.log('##portal servers##', servers);

    const [ServerInfo, esriId, EsriConfig] = await loadModules([
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
        token: this.config.token,
        serverUrl: v.url
      });
    });

    const resAll = await Promise.all(serversPromiseAll);
    resAll.forEach((v: any, k) => {
      console.log('portalServer', v);
      const serverInfo: any = {
        server: servers[k].url,
        token: v.token,
        userId: this.config.username,
        expires: v.expires
      };

      esriId.registerToken(serverInfo);
      console.log('##register token for server##', serverInfo);
    });
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
      await this.registerServer();
      this.config.token = data.token;
      this.config.expires = data.expires;
      await this.storage.set('loginInfo', this.config);

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
    // 将url强行转换成https
    data.results.forEach(v => {
      if (v.url) {
        v.url = v.url.replace('http://', 'https://');
      }
    });

    return data;
  }

  async fetchServiceInfo({ url }) {
    const token = await this.getServiceToken({ url });

    const data: any = await this.http
      .get(url, {
        params: {
          f: 'json',
          token
        }
      })
      .toPromise()
      .catch(err => {
        console.warn(err);
        throw new Error(err);
      });

    return data;
  }

  async getServiceToken({ url }) {
    const [esriId] = await loadModules(['esri/identity/IdentityManager']);
    const crede = await esriId.getCredential(url);

    return crede.token;
  }

  async fetchItemServiceInfo(param) {
    const token = '';

    const [esriId] = await loadModules(['esri/identity/IdentityManager']);

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
    if (this.portalInfo) {
      return this.portalInfo;
    }
    const url = `${
      this.portalUrl
    }/sharing/rest/portals/self?culture=zh-cn&f=json`;
    const res = await axios.get(url);
    this.portalInfo = res.data;
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

  async fetchBaseMaps() {
    if (this.basemaps) {
      return this.basemaps;
    }
    const basemaps = [];
    const portalinfo = await this.fetchPortalInfo();
    console.log('portalinfo', portalinfo);
    const basemapGalleryGroupQuery = portalinfo.basemapGalleryGroupQuery;
    const res = await this.search({
      q:
        basemapGalleryGroupQuery.replace('id', 'group') + ' AND type:"web map"',
      f: 'json',
      num: 999
    });

    const [
      Basemap,
      FeatureLayer,
      MapImageLayer,
      VectorTileLayer,
      TileLayer,
      WebTileLayer,
      TileInfo
    ] = await loadModules([
      'esri/Basemap',
      'esri/layers/FeatureLayer',
      'esri/layers/MapImageLayer',
      'esri/layers/VectorTileLayer',
      'esri/layers/TileLayer',
      'esri/layers/WebTileLayer',
      'esri/layers/support/TileInfo'
    ]);

    const baselayerWebMaps = res.results;

    const promises = baselayerWebMaps.map(v => {
      return this.getWebMapLayerInfoById({
        id: v.id,
        token: this.getToken()
      });
    });

    const resArr = await Promise.all(promises);

    resArr.map((item: any, index) => {
      const baseMapLayers = item.baseMap.baseMapLayers;
      const layers = [];
      baseMapLayers.forEach(v => {
        let basemaplayer;
        if (v.layerType === 'ArcGISTiledMapServiceLayer') {
          basemaplayer = new TileLayer({ url: v.url });
        } else if (v.layerType === 'WebTiledLayer') {
          const tileInfo = new TileInfo({
            dpi: 96,
            rows: 256,
            cols: 256,
            origin: {
              x: -2.0037508342787e7,
              y: 2.0037508342787e7
            },
            spatialReference: {
              wkid: 102100
            },
            lods: [
              {
                level: 0,
                resolution: 156543.033928,
                scale: 5.91657527591555e8
              },
              {
                level: 1,
                resolution: 78271.5169639999,
                scale: 2.95828763795777e8
              },
              {
                level: 2,
                resolution: 39135.7584820001,
                scale: 1.47914381897889e8
              },
              {
                level: 3,
                resolution: 19567.8792409999,
                scale: 7.3957190948944e7
              },
              {
                level: 4,
                resolution: 9783.93962049996,
                scale: 3.6978595474472e7
              },
              {
                level: 5,
                resolution: 4891.96981024998,
                scale: 1.8489297737236e7
              },
              {
                level: 6,
                resolution: 2445.98490512499,
                scale: 9244648.868618
              },
              {
                level: 7,
                resolution: 1222.99245256249,
                scale: 4622324.434309
              },
              {
                level: 8,
                resolution: 611.49622628138,
                scale: 2311162.217155
              },
              {
                level: 9,
                resolution: 305.748113140558,
                scale: 1155581.108577
              },
              {
                level: 10,
                resolution: 152.874056570411,
                scale: 577790.554289
              },
              {
                level: 11,
                resolution: 76.4370282850732,
                scale: 288895.277144
              },
              {
                level: 12,
                resolution: 38.2185141425366,
                scale: 144447.638572
              },
              {
                level: 13,
                resolution: 19.1092570712683,
                scale: 72223.819286
              },
              {
                level: 14,
                resolution: 9.55462853563415,
                scale: 36111.909643
              },
              {
                level: 15,
                resolution: 4.77731426794937,
                scale: 18055.954822
              },
              {
                level: 16,
                resolution: 2.38865713397468,
                scale: 9027.977411
              },
              {
                level: 17,
                resolution: 1.19432856685505,
                scale: 4513.988705
              },
              {
                level: 18,
                resolution: 0.597164283559817,
                scale: 2256.994353
              },
              {
                level: 19,
                resolution: 0.298582141647617,
                scale: 1128.497176
              },
              {
                level: 20,
                resolution: 0.14929107082380833,
                scale: 564.248588
              },
              {
                level: 21,
                resolution: 0.07464553541190416,
                scale: 282.124294
              },
              {
                level: 22,
                resolution: 0.03732276770595208,
                scale: 141.062147
              },
              {
                level: 23,
                resolution: 0.01866138385297604,
                scale: 70.5310735
              }
            ]
          });

          basemaplayer = new WebTileLayer({
            tileInfo,
            urlTemplate: v.templateUrl,
            subDomains: v.subDomains,
            copyright: v.copyright
          });
        } else if (v.layerType === 'Map Service') {
          basemaplayer = new MapImageLayer({ url: v.url });
        }
        if (basemaplayer) {
          layers.push(basemaplayer);
        }
      });

      const basemap = new Basemap({
        id: baselayerWebMaps[index].id,
        baseLayers: layers,
        thumbnailUrl: this.getThumbnailUrl(
          baselayerWebMaps[index],
          this.getToken()
        )
      });
      basemaps.push(basemap);
    });

    this.basemaps = basemaps;

    return basemaps;
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
