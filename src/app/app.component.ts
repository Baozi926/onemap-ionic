import { Component , ViewChild} from '@angular/core';

import { Platform , MenuController , IonMenu} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    // {
    //   title: 'Home',
    //   url: '/home',
    //   icon: 'home'
    // },
    {
      title: '我的地图',
      url: '/map',
      icon: 'map'
    },
    {
      title: '我的资源',
      url: '/resource',
      icon: 'list'
    },
    {
      title: '我的信息',
      url: '/test',
      icon: 'person'
    }
  ];
  // @ViewChild('ionMenu') private ionMenu: IonMenu;


  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private menuController: MenuController
  ) {
    this.initializeApp();
    // this.menuController.swipeEnable(false);
    // this.menuController.swipeEnable(false);
    // this.ionMenu.swipeGesture();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  onMenuDidOpen(evt) {
    console.log('meunu open', evt);
    this.menuController.get('main').then((menu: HTMLIonMenuElement) => {
      menu.swipeGesture = true;
    });
  }
  onMenuDidClose(evt) {
    console.log('meunu close', evt);
    this.menuController.get('main').then((menu: HTMLIonMenuElement) => {
      menu.swipeGesture = false;
    });
  }
}
