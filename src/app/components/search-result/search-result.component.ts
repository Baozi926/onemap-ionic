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
  highlight: any;
  subCateValue: string;
  cateInterfaceOptions = {
    // showBackdrop: false
  };
  loadings = [];
  async ngOnInit() {
    this.total = 0;
    this.results = [];
    this.hide = this.hide.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.doGeometrySearch = this.doGeometrySearch.bind(this);

    this.checkGraphicsLayer = this.checkGraphicsLayer.bind(this);

    this.events.subscribe('search:doSearch', this.doSearch);
    this.events.subscribe('search:searchByGeometry', this.doGeometrySearch);
    this.events.subscribe('esriView:typeHasChanged', this.checkGraphicsLayer);
    this.events.subscribe('esriView:clearGraphics', this.hide);



    this.listHeight = this.platform.height() / 2;
    this.listHeightString = this.listHeight + 'px';
    this.yThreshold = this.listHeight / 2;
    this.resetCategory();

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

  onDetailClick(evt, data, notLocate = false) {
    // this.resultSlides.lockSwipeToNext;
    if (evt) {
      evt.stopPropagation();
    }

    console.log('show detail', data);
    this.resultSlides.lockSwipes(false);
    this.resultSlides.slideNext();
    this.detailData = data;
    if (!notLocate) {
      this.locateItem(data);
    }
  }

  async onSearchStart() {
    const loading = await this.loadingController.create({
      // spinner: null,
      spinner: 'crescent',
      // duration: 5000,
      backdropDismiss: true,
      message: '正在搜索',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    await loading.present();
    this.loadings.push(loading);
  }
  async doSearch({ param, isNexPage /** 是否是滚动搜索 */ }) {
    await this.onSearchStart();
    // this.loadingController.create();
    this.resultSlides.lockSwipes(true);
    if (isNexPage) {
      this.searchParam.start = this.searchParam.start + this.searchParam.rows;
    } else {
      this.searchParam = param;
      this.searchParam.layers = null;
      this.resetCategory();
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

    this.events.unsubscribe('search:doSearch', this.doSearch);
    this.events.unsubscribe('search:searchByGeometry', this.doGeometrySearch);
    this.events.unsubscribe('esriView:typeHasChanged', this.checkGraphicsLayer);
    this.events.unsubscribe('esriView:clearGraphics', this.hide);
  }
  async onSearchEnd() {
    console.log('onSearchEnd', this);

    // 防止未生成loading时已经出发dismiss
    // setTimeout(() => {
    if (this.loadings) {
      while (this.loadings.length > 0) {
        this.loadings.pop().dismiss();
      }
    }
    // }, 200);

    if (this.results.length === 1) {
      this.onDetailClick(null, this.results[0], true);
    } else {
      this.resultSlides.lockSwipes(false);
      this.resultSlides.slidePrev();
      this.resultSlides.lockSwipes(true);
    }

    // console.log('onSearchEnd', this);
    // console.log('onSearchEnd', data);
  }
  async renderMap() {
    if (!this.mapService.view) {
      return;
    }
    // 检查是否存在用于显示结果的图层
    await this.checkGraphicsLayer();

    this.graphicsLayer.removeAll();

    this.graphicsLayer.addMany(this.results);
  }
  async checkGraphicsLayer() {
    const id = 'search-layer';
    if (this.graphicsLayer) {
      if (!this.mapService.getView().map.findLayerById(id)) {
        this.mapService.getView().map.add(this.graphicsLayer);
      }
    } else {
      const [EsriGraphicsLayer] = await loadModules([
        'esri/layers/GraphicsLayer'
      ]);
      const graphicsLayer = new EsriGraphicsLayer({
        id
      });
      this.graphicsLayer = graphicsLayer;
      this.mapService.view.map.add(graphicsLayer);
    }

  }


  async doGeometrySearch({
    geometry,
    layers = '*',
    defaultDisplayLayer = '',
    isNexPage
  }) {
    // this.resultSlides.lockSwipes(true);
    if (isNexPage) {
      this.searchParam.start = this.searchParam.start + this.searchParam.rows;
    } else {
      this.searchParam = {
        geometry,
        start: 0,
        rows: 10,
        layers
      };

      if (layers === '*') {
        this.resetCategory();
      }
      this.listContent.scrollToTop();
    }
    const data: any = await this.searchService.searchByGeometry(
      this.searchParam
    );
    if (data.docList.length > 0) {
      await this.open();
      await this.setResult({ data, isNexPage });
      this.infiniteScroll.disabled = !(
        data.totalCount >
        data.start + data.rows
      );
      if (defaultDisplayLayer) {
        this.subCateValue = defaultDisplayLayer;
        this.searchParam.layers = this.subCateValue;
        this.doSubSearch({
          isNexPage: false
        });
      } else {
        await this.renderMap();
        this.mapService.view.goTo(this.results);
      }
    }
  }

  setListData(arr) {
    this.results = arr;
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
      this.setListData([...this.results, ...graphics]);
    } else {
      this.total = data.totalCount;
      this.setListData(graphics);
      // this.results = graphics;
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

  resetCategory() {
    this.subCateValue = '*';
  }
  onCategoryBlur(evt) {
    this.resultSlides.slidePrev();
    if (this.isOpen) {
      // const layer = evt.detail.value;
      setTimeout(() => {
        this.searchParam.layers = evt.target.value;
        this.doSubSearch({ isNexPage: false });
      }, 200);
    }
  }
  async doSubSearch({ isNexPage }) {
    await this.onSearchStart();

    const [EsriJsonUtils, EsriGraphic] = await loadModules([
      'esri/geometry/support/jsonUtils',
      'esri/Graphic'
    ]);
    if (isNexPage && this.searchParam) {
      this.searchParam.start = this.searchParam.start + this.searchParam.rows;
    } else {
      this.searchParam.start = 0;
      this.listContent.scrollToTop();
    }
    let data;
    if (this.searchParam.geometry) {
      data = await this.searchService.searchByGeometry(this.searchParam);
    } else {
      data = await this.searchService.searchByLayers(this.searchParam);
    }

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
    this.mapService.view.goTo(this.results).then(() => {});
    this.onSearchEnd();
  }
  async loadMoreData(evt) {
    console.log('touch bottom');
    if (this.searchParam.layers) {
      await this.doSubSearch({ isNexPage: true });
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
    this.resetCategory();
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
