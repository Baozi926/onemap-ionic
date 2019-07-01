import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
// import {SafeHtml} from '@angular/platform-browser';
import { IonicImageLoader } from 'ionic-image-loader';
import { WebView } from '@ionic-native/ionic-webview/ngx';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PortalService } from './services/portal.service';
import { MapService } from './services/map.service';
import { SearchService } from './services/search.service';
import { CacheMapService } from './services/cache-map.service';
import { Cache } from './services/cache';
import { IonicStorageModule } from '@ionic/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { loadScript } from 'esri-loader';
import {httpInterceptorProviders} from './http-interceptors';

// import { IonicImageLoader } from 'ionic-image-loader';
// import 'hammerjs';

loadScript({
  url: 'assets/esri/4.10/init.js'
});

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'ios'
    }),
    // IonicImageLoader.forRoot(),
    IonicImageLoader.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    BrowserAnimationsModule,
    HttpClientModule
  ],
  providers: [
    WebView,
    httpInterceptorProviders,
    StatusBar,
    SplashScreen,
    PortalService,
    MapService,
    SearchService,
    Storage,
    CacheMapService,
    { provide: Cache, useClass: CacheMapService },
    // SafeHtmlPipe,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
