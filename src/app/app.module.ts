import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
// import {SafeHtml} from '@angular/platform-browser';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PortalService } from './services/portal.service';
import { MapService } from './services/map.service';
import { SearchService } from './services/search.service';
import { IonicStorageModule } from '@ionic/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { loadScript } from 'esri-loader';
import 'hammerjs';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

loadScript({
  url: 'assets/esri/4.10/init.js'
});

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    // SafeHtmlPipe,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    BrowserAnimationsModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    PortalService,
    MapService,
    SearchService,
    Storage,
    // SafeHtmlPipe,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
