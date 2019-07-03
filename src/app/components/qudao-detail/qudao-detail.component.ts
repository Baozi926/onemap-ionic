import { SearchService } from '../../services/search.service';
import axios from 'axios';
import qs from 'qs';
import { loadModules } from 'esri-loader';

import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import {
  NgxImageGalleryComponent,
  GALLERY_IMAGE,
  GALLERY_CONF
} from 'ngx-image-gallery';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Renderer,
  HostBinding,
  Renderer2,
  Input
} from '@angular/core';
import {
  ModalController,
  IonContent,
  PopoverController,
  ToastController
} from '@ionic/angular';
import { debug } from 'util';

@Component({
  selector: 'app-qudao-detail',
  templateUrl: './qudao-detail.component.html',
  styleUrls: ['./qudao-detail.component.scss']
})
export class QudaoDetailComponent implements OnInit {
  constructor(
    private screenOrientation: ScreenOrientation,
    public modalCtrl: ModalController,
    private searchService: SearchService
  ) {}
  @Input() data?: any;
  @ViewChild(NgxImageGalleryComponent)
  ngxImageGallery: NgxImageGalleryComponent;
  gcdzImgUrl =
    'https://nsbdgis.ysy.com.cn/geoplat/onemap/images/temp/nopic.png';
  zhuanghao = '--';
  teshudizhi_active_data = [];
  dizhigongcheng_imgUrls = [];
  imageGalleryConf = {
    imageOffset: '0px',
    showDeleteControl: false,
    showImageTitle: false
  };
  teshudizhi = [
    {
      name: '湿陷土',
      layer: 'zx_channel_process_collapsiblesoil_0320',
      active: false,
      dict: [
        {
          name: '挖填情',
          key: 'FILLEXCAVATION'
        },
        {
          name: '左岸渠堤处理措施',
          key: 'LEFTBANKPROCESS'
        },
        {
          name: '右岸渠堤处理措施',
          key: 'RIGHTBANKPROCESS'
        },
        {
          name: '渠底处理措施',
          key: 'BOTTOMPROCESS'
        },
        {
          name: '夯击能',
          key: 'TAMPINGENERGY'
        },
        {
          name: '土挤密桩参数桩长桩径间距',
          key: 'EARTHPILEPARAMETERS'
        }
      ],
      data: []
    },
    {
      name: '膨胀岩土',
      layer: 'zx_channel_process_swellingrock_0314',
      active: false,
      dict: [
        {
          name: '膨胀等级',
          key: 'EXPANSIONGRADE'
        },
        {
          name: '换填措施',
          key: 'REPLACEMENTTHICKNESS'
        },
        {
          name: '排水措施',
          key: 'PROCESS1'
        },
        {
          name: '抗滑桩',
          key: 'PROCESS2'
        },
        {
          name: '位置',
          key: 'POS'
        }
      ],
      data: []
    },
    {
      name: '河滩段',
      layer: 'zx_channel_process_floodland_0320',
      active: false,
      dict: [
        {
          name: '排水',
          key: 'DRAINAGE'
        },
        {
          name: '换填',
          key: 'REPLACEMENT'
        },
        {
          name: '渠底换填厚度',
          key: 'BOTTOMREPLACEMENTTHICKNESS'
        },
        {
          name: '渠坡换填厚度',
          key: 'SLOPEREPLACEMENTHICKNESS'
        }
      ],
      data: []
    },
    {
      name: '高地下水位砂质渠坡 ',
      layer: 'zx_channel_process_highwater_0320',
      active: false,
      dict: [
        {
          name: '坡比',
          key: 'SLOPERATIO'
        },
        {
          name: '渠坡换填厚度',
          key: 'SLOPEREPLACEMENTTHICKNESS'
        },
        {
          name: '渠底换填厚度',
          key: 'BOTTOMREPLACEMENTTHICKNESS'
        },
        {
          name: '换填土料',
          key: 'REPLACESOIL'
        }
      ],
      data: []
    },
    {
      name: '饱和砂土',
      layer: 'zx_channel_process_saturatedsand_0320',
      active: false,
      dict: [
        {
          name: '处理措施',
          key: 'PROCESS1'
        },
        {
          name: '深度',
          key: 'DEPTH'
        },
        {
          name: '液化等级',
          key: 'LIQUEFACTIONGRADE'
        }
      ],
      data: []
    },
    {
      name: '采空区',
      layer: 'zx_channel_process_gob_0320',
      active: false,
      dict: [
        {
          name: '类型',
          value: 'TYPE'
        },
        {
          name: '灌浆处理',
          value: 'GROUTINGPROCESS'
        },
        {
          name: '注浆材料',
          value: 'GROUTINGMATERIAL'
        },
        {
          name: '不均匀沉降处理',
          value: 'DRFFERENTIALSETTLEMENTPROCESS'
        },
        {
          name: '左岸保护宽度',
          value: 'LEFTBANKPROTECTIONWIDTH'
        },
        {
          name: '右岸保护宽度',
          value: 'RIGHTBANKPROTECTIONWIDTH'
        }
      ],
      data: []
    }
  ];
  qudao = {
    layer: 'zx_channel_irrigationditch',
    data: [],
    dict: null
  };
  cunqie = {
    layer: 'zx_channel_lining',
    data: [],
    dict: null
  };
  paishui = {
    layer: 'zx_channel_drainage',
    data: [],
    dict: null
  };
  fanghuti = {
    layer: 'zx_channel_embangkment_0314',
    data: [],
    dict: [
      { name: '位置', key: 'POSITION' },
      { name: '堤顶高程(m)', key: 'STARTLEVEEELEVATION' },
      { name: '堤顶宽度(m)', key: 'TOPWIDTH' },
      { name: '边坡系数', key: 'SLOPE' },
      { name: '护砌形式', key: 'unknow', defaultValue: '浆砌石' }
    ]
  };
  jieliugou = {
    layer: 'zx_channel_drainageditch_0314',
    data: [],
    dict: [
      { name: '位置', key: 'unknow', defaultValue: '左岸' },
      { name: '沟底高程(m)', key: 'STARTBOTTOMELEVATION' },
      { name: '沟底宽度(m)', key: 'BOTTOMWIDTH' },
      { name: '边坡系数', key: 'SLOPE' },
      { name: '排入河道', key: 'TORIVER' }
    ]
  };
  ngOnInit() {
    this.initData();
  }
  async initData() {
    const geometry = this.data.geometry;
    if (!geometry) {
      console.warn('geometry is null');
    }

    this.zhuanghao =
      this.data.attributes.POINT ||
      this.data.attributes.STARTSTAKENUMBER ||
      this.data.attributes.STAKENUMBER ||
      '--';

    const [GeometryEngine, WebMercatorUtils] = await loadModules([
      'esri/geometry/geometryEngine',
      'esri/geometry/support/webMercatorUtils'
    ]);

    let calcGeometry = geometry.clone();
    if (calcGeometry.spatialReference.isGeographic) {
      calcGeometry = WebMercatorUtils.geographicToWebMercator(calcGeometry);
    }
    calcGeometry = GeometryEngine.buffer(calcGeometry, 50, 'meters');

    calcGeometry = WebMercatorUtils.webMercatorToGeographic(calcGeometry);

    const searchParam = {
      geometry,
      start: 0,
      rows: 1000,
      layers: '*'
    };

    const data: any = await this.searchService.searchByGeometry(searchParam);

    const info = data.docList;

    const displayItem = [
      this.qudao,
      this.cunqie,
      this.paishui,
      this.fanghuti,
      this.jieliugou
    ];

    // 渠道，村砌，排水、防护提、截流沟
    displayItem.forEach(v => {
      const filter = info.filter(vv => {
        return v.layer === vv.LAYER;
      });

      let data = {};

      const dict = this.searchService.getFieldDictForLayer(v.layer) || v.dict;
      if (filter.length > 0) {
        data = filter[0];
      }

      const dislayData = dict.map(field => {
        return {
          name: field.name,
          value: data[field.key] || field.defaultValue || ' -- '
        };
      });

      v.data = dislayData;
    });

    info.forEach(v => {});
    console.log('渠道信息', displayItem);

    // 特殊地质
    this.teshudizhi.forEach(v => {
      const filter = info.filter(vv => {
        return v.layer === vv.LAYER;
      });
      let data = {};
      if (filter.length > 0) {
        v.active = true;
        const dict = v.dict || this.searchService.getFieldDictForLayer(v.layer);
        data = filter[0];
        const dislayData = dict.map(field => {
          return {
            name: field.name,
            value: data[field.key] || field.defaultValue || ' -- '
          };
        });

        v.data = dislayData;
      }
    });

    // 工程地质

    const filter = info.filter(v => {
      return 'zx_channel_profile' === v.LAYER;
    });

    if (filter.length > 0) {
      const gcdz = filter[0];
      let gcdzImgUrl = null;
      if (gcdz && gcdz.PICTURE) {
        // https://nsbdgis.ysy.com.cn/pic/transverse/hz_hd_48/28_5.png
        // https://nsbdgis.ysy.com.cn/pic/transverse/hz_hd_48/29_1.png
        // https://nsbdgis.ysy.com.cn/pic/vertical/huanghe2zhanghe/hz_zd_55.png
        gcdzImgUrl = 'https://nsbdgis.ysy.com.cn//pic/' + gcdz.PICTURE;
      }

      this.gcdzImgUrl = gcdzImgUrl;

      const getImgsUrl =
        'https://nsbdgis.ysy.com.cn/proxy/nsbdgisRest/transverse/findSection';

      const imgBaseUrl = 'https://nsbdgis.ysy.com.cn//pic/';

      const res = await axios.post(
        getImgsUrl,
        qs.stringify({
          id: gcdz.OBJECTID
        })
      );
      if (res.data && res.data.data) {
        console.log('地质工程图片', res.data.data);
        const verticalpathMap = {};
        const transversepathMap = {};

        // const verticalpaths = [];
        // const transversepaths = [];

        res.data.data.forEach(v => {
          if (v.verticalpath) {
            verticalpathMap[v.verticalpath] = v.verticalid;
          }
          if (v.transversepath) {
            transversepathMap[v.transversepath] = v.transversecode;
          }
        });

        const verticalpaths = Object.keys(verticalpathMap).map(v => {
          const name = '纵剖面' + verticalpathMap[v];
          return {
            title: name,
            url: imgBaseUrl + v,
            altText: name
          };
        });

        const transversepaths = Object.keys(transversepathMap).map(v => {
          const name = '横剖面' + transversepathMap[v];
          return {
            title: name,
            url: imgBaseUrl + v,
            altText: name
          };
        });

        this.dizhigongcheng_imgUrls = verticalpaths.concat(transversepaths);
        console.log('img_urls', this.dizhigongcheng_imgUrls);
      }
    }
  }

  onTeshudizhiClick(evt, item) {
    console.log('特殊地质被点击', evt, item);
    this.teshudizhi_active_data = item.data;
  }

  onDizhigongchengImgClick() {
    if (this.dizhigongcheng_imgUrls.length > 0) {
      this.ngxImageGallery.open(0);
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    }

  }

  onDizhigongchenggalleryClosed() {
    if (window.screen) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }
  }

  dissModal() {
    this.modalCtrl.dismiss();
  }
}
