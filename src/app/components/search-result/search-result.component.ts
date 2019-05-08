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
import { Events } from '@ionic/angular';
import { AnimationBuilder, animate, style } from '@angular/animations';
import { DomController, Platform, IonList } from '@ionic/angular';
import anime from 'animejs';
import { loadModules } from 'esri-loader';
import { SearchService } from '../../services/search.service';
import { MapService } from '../../services/map.service';
import esri = __esri; // Esri TypeScript Types
import {
  IonInfiniteScroll,
  IonContent,
  IonSlides,
  LoadingController
} from '@ionic/angular';

@Component({
  selector: 'map-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit {
  constructor(
    private searchService: SearchService,
    private el: ElementRef,
    private events: Events,
    private animationBuilder: AnimationBuilder,
    private renderer: Renderer2,
    public domCtrl: DomController,
    private platform: Platform,
    private loadingController: LoadingController,
    private mapService: MapService
  ) {}
  @HostBinding('style.height') listHeightString: string;
  @ViewChild('listContainer') private listContainer: ElementRef;
  @ViewChild('listEle') private listEle: any; // IonList
  @ViewChild('infiniteScroll') infiniteScroll: IonInfiniteScroll;
  @ViewChild('listContent') listContent: IonContent;
  @ViewChild('resultSlides') resultSlides: IonSlides;
  loading: any;

  // @Input() view?: any;
  facet = [];
  // @imput
  detailData: any;
  public isOpen: boolean;
  private total: number;
  listHeight: number;
  yThreshold = 0;
  panStartEvt: any;
  animation: Animation;
  offsetY: number;
  graphicsLayer: esri.GraphicsLayer;
  results = [];
  searchParam: any;
  subsearchParam: any;
  highlight: any;
  subCateValue: string;
  cateInterfaceOptions = {
    // showBackdrop: false
  };
  ngOnInit() {
    this.total = 0;
    this.results = [];
    console.log('platform', this.platform);
    this.doSearch = this.doSearch.bind(this);
    this.viewLoaded = this.viewLoaded.bind(this);
    this.events.subscribe('search:doSearch', this.doSearch);
    this.events.subscribe('esriView:loaded', this.viewLoaded);

    this.listHeight = this.platform.height() / 2;
    this.listHeightString = this.listHeight + 'px';
    this.yThreshold = this.listHeight / 2;
    this.subCateValue = '*';

    // esri/layers/GraphicsLayer

    // anime({
    //   targets: this.listContainer.nativeElement,
    //   bottom: 0,
    //   duration: 200,
    //   height: this.listHeight + 'px'
    // });

    // this.open();
    this.hide();
  }

  onDetailClick(evt, data) {
    // this.resultSlides.lockSwipeToNext;
    evt.stopPropagation();
    console.log('show detail', data);
    this.resultSlides.lockSwipes(false);
    this.resultSlides.slideNext();
    this.detailData = data;
    this.locateItem(data);
  }

  async onSearchStart() {
    this.loading = await this.loadingController.create({
      // spinner: null,
      spinner: 'crescent',
      // duration: 5000,
      message: '正在搜索',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    this.loading.present();
  }
  async doSearch({ param, isNexPage /** 是否是滚动搜索 */ }) {
    this.onSearchStart();
    // this.loadingController.create();
    this.resultSlides.lockSwipes(true);
    if (isNexPage) {
      this.searchParam.start = this.searchParam.start + this.searchParam.rows;
    } else {
      this.searchParam = param;
      this.subsearchParam = null; // 重置分类搜索的条件
      this.subCateValue = '*';
      // this.listEle.
      this.listContent.scrollToTop();
    }
    const data = await this.searchService.search(this.searchParam);
    await this.setResult({ data, isNexPage });
    this.infiniteScroll.disabled = !(data.totalCount > data.start + data.rows);
    await this.open();
    await this.renderMap();
    this.mapService.view.goTo(this.results);
    this.onSearchEnd();
  }
  async ngOnDestroy() {
    console.log('销毁时销毁监听事件');
    this.events.unsubscribe('search:doSearch', this.doSearch);
    this.events.unsubscribe('esriView:loaded', this.viewLoaded);
  }

  async onSearchEnd() {
    if (this.loading) {
      this.loading.dismiss();
    }
    // console.log('onSearchEnd', data);
  }
  async renderMap() {
    if (!this.mapService.view) {
      return;
    }
    this.graphicsLayer.removeAll();

    this.graphicsLayer.addMany(this.results);
  }
  async viewLoaded() {
    console.log('检测到view loaded，加入graphicslayer');
    const [EsriGraphicsLayer] = await loadModules([
      'esri/layers/GraphicsLayer'
    ]);
    const graphicsLayer = new EsriGraphicsLayer({
      id: 'search-layer'
    });
    this.graphicsLayer = graphicsLayer;
    this.mapService.view.map.add(graphicsLayer);
  }
  async setResult({ data, isNexPage }) {
    const [EsriJsonUtils, EsriGraphic] = await loadModules([
      'esri/geometry/support/jsonUtils',
      'esri/Graphic'
    ]);

    console.log('result-show', data);
    const graphics = data.docList.map(v => {
      const geometry = EsriJsonUtils.fromJSON(v.SHAPE);
      v.SHAPE = undefined; // 去除该字段，减少缓存

      const graphic = new EsriGraphic({
        geometry,
        attributes: v,
        symbol: this.getSymbol4Geometry(geometry)
      });

      return graphic;
    });
    if (isNexPage) {
      this.results = [...this.results, ...graphics];
    } else {
      this.total = data.totalCount;
      this.results = graphics;
      if (data.facetList) {
        this.facet = data.facetList.map(v => {
          v = v || {};
          return {
            name: v.LAYER_ZH,
            layer: v.LAYER,
            count: v.count
          };
        });
      }
    }
  }
  onCategoryChange(evt) {
    if (this.isOpen) {
      const layer = evt.detail.value;
      this.subCateValue = layer;
      this.doSubSearch({ layer, isNexPage: false });
    }
  }
  async doSubSearch({ layer, isNexPage }) {
    this.onSearchStart();

    const [EsriJsonUtils, EsriGraphic] = await loadModules([
      'esri/geometry/support/jsonUtils',
      'esri/Graphic'
    ]);
    // let subsearchParam ;
    if (isNexPage && this.subsearchParam) {
      this.subsearchParam.start =
        this.subsearchParam.start + this.subsearchParam.rows;
    } else {
      this.subsearchParam = Object.assign({}, this.searchParam, { start: 0 });
      this.subsearchParam.layers = layer;
      this.listContent.scrollToTop();
    }

    const data = await this.searchService.searchByLayers(this.subsearchParam);
    this.infiniteScroll.disabled = !(data.totalCount > data.start + data.rows);
    const graphics = data.docList.map(v => {
      const geometry = EsriJsonUtils.fromJSON(v.SHAPE);
      v.SHAPE = undefined; // 去除该字段，减少缓存

      const graphic = new EsriGraphic({
        geometry,
        attributes: v,
        symbol: this.getSymbol4Geometry(geometry)
      });

      return graphic;
    });

    if (isNexPage) {
      this.results = [...this.results, ...graphics];
    } else {
      this.results = graphics;
    }

    this.renderMap();
    this.mapService.view.goTo(this.results);
    this.onSearchEnd();
  }
  async loadMoreData(evt) {
    console.log('touch bottom');
    if (this.subsearchParam) {
      await this.doSubSearch({ layer: null, isNexPage: true });
    } else {
      await this.doSearch({ param: null, isNexPage: true });
    }
    this.infiniteScroll.complete();
    // this.searchParam.start;
  }
  getSymbol4Geometry(geometry) {
    console.log(geometry.type);
    switch (geometry.type) {
      case 'polygon':
        return {
          type: 'simple-fill', // autocasts as new SimpleFillSymbol()
          color: [0, 0, 200, 0.5],
          style: 'solid',
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: [0, 0, 200, 1],
            width: 2
          }
        };
      case 'polyline':
        return {
          type: 'simple-line',
          color: [0, 0, 200],
          width: 3
        };

      default:
        return {
          type: 'simple-marker',
          color: [0, 0, 200],
          size: 12,
          outline: {
            type: 'simple-line',
            color: [0, 0, 0, 0.7],
            width: 1
          }
        };
    }
  }
  async open() {
    if (this.isOpen) {
      return;
    }
// this.renderer.aa
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'transform 0.5s'
    );
    this.domCtrl.write(async () => {
      this.renderer.setStyle(
        this.el.nativeElement,
        'transform',
        `translate3d(0px, 0px, 20px)`
      );
      // 将地图div上移
      this.renderer.setStyle(
        this.mapService.view.container,
        'transform',
        `translate3d(0px, ${-this.listHeight / 2}px, 0px)`
      );

      // 缩放到搜索结果
    });
    // anime({
    //   targets: this.el.nativeElement,
    //   duration: 500,
    //   translateY: 0,
    //   easing: 'easeInOutQuad'
    // });
    this.isOpen = true;
  }
  async locateItem(graphic) {
    this.mapService.view.goTo(graphic.geometry);
    this.mapService.view.whenLayerView(this.graphicsLayer).then(layerView => {
      if (this.highlight) {
        this.highlight.remove();
      }
      this.highlight = layerView.highlight(graphic);
    });
  }
  hide() {
    // anime({
    //   targets: this.el.nativeElement,
    //   duration: 500,
    //   translateY: this.listHeight,
    //   easing: 'easeInOutQuad'
    // });
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'transform 0.5s'
    );
    this.domCtrl.write(() => {
      this.renderer.setStyle(
        this.el.nativeElement,
        'transform',
        `translate3d(0px, ${this.listHeight}px, 0px)`
      );
      if (this.graphicsLayer) {
        this.graphicsLayer.removeAll();
      }

      // 还原地图div
      if (this.mapService.view) {
        this.renderer.setStyle(
          this.mapService.view.container,
          'transform',
          `translate3d(0px, 0px, 0px)`
        );
      }
    });
    if (this.highlight) {
      this.highlight.remove();
    }
    this.isOpen = false;
    this.subCateValue = '*'; // 将分类重置
  }
  getItemCategory({ attributes }) {
    return (attributes && attributes.LAYER_ZH) || '未分类';
  }
  getItemName({ attributes }) {
    return (attributes && attributes.NO) || '未命名';
  }
  createAnimation() {
    // this.an;÷
    const factory = this.animationBuilder.build([
      style({ width: 0 }),
      animate(0, style({ width: '100px' }))
    ]);

    // use the returned factory object to create a player
    const player = factory.create(this.listContainer.nativeElement);

    player.play();
  }
  onPan(evt) {
    return;
    console.log(evt);
    const offsetY = evt.center.y - this.panStartEvt.center.y;
    console.log(offsetY);

    if (offsetY < 0) {
      return;
    }
    // if(this.)
    this.domCtrl.write(() => {
      this.renderer.setStyle(
        this.listContainer.nativeElement,
        'transform',
        `translate3d(0px, ${offsetY}px, 0px)`
      );
      this.offsetY = offsetY;
    });
  }

  async onPanEnd(evt) {
    return;
    console.log('end');
    this.renderer.setStyle(
      this.listContainer.nativeElement,
      'transition',
      'transform 0.5s'
    );

    setTimeout(() => {
      if (this.offsetY < this.yThreshold) {
        this.domCtrl.write(() => {
          this.renderer.setStyle(
            this.listContainer.nativeElement,
            'transform',
            `translate3d(0px, 0px, 0px)`
          );
        });
      } else {
        this.domCtrl.write(() => {
          this.renderer.setStyle(
            this.listContainer.nativeElement,
            'transform',
            `translate3d(0px, ${this.listHeight}px, 0px)`
          );
        });
      }
    }, 10);
  }
  onPanStart(evt) {
    return;
    this.panStartEvt = evt;
    // this.domCtrl.write(() => {
    this.renderer.setStyle(
      this.listContainer.nativeElement,
      'transition',
      'none'
    );
    // });
  }

  onTap(evt) {
    // this.createAnimation();
  }
}
