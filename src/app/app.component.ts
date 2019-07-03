import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  Platform,
  MenuController,
  IonMenu,
  ActionSheetController
} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { PortalService } from './services/portal.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { async } from 'q';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private router: Router,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private menuController: MenuController,
    private portalService: PortalService,
    private actionSheetController: ActionSheetController,
    public screenOrientation: ScreenOrientation
  ) {
    this.initializeApp();
    // this.menuController.swipeEnable(false);
    // this.menuController.swipeEnable(false);
    // this.ionMenu.swipeGesture();
  }
  public appPages = [
    {
      title: '我的地图',
      url: '/map',
      icon: 'map'
    },
    {
      title: '我的资源',
      url: '/resource',
      icon: 'logo-buffer'
    },
    {
      title: '我的信息',
      url: '/my-profile',
      icon: 'person'
    },
    {
      title: '我的申请',
      url: '/my-request',
      icon: 'clipboard'
    },
    {
      title: '我的审批',
      url: '/my-approval',
      icon: 'create'
    }
    // {
    //   title: '系统设置',
    //   url: '/app-config',
    //   icon: 'options'
    // }
  ];
  // @ViewChild('ionMenu') private ionMenu: IonMenu;

  async initializeApp() {
    this.platform.ready().then(async () => {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

      const loginInfo = await this.portalService.getUserFromStorage();
      this.portalService.setUser(loginInfo);
      const res = await this.portalService.login();

      console.log('check login');
      if (res.success) {
        // await this.router.navigateByUrl('map');
      } else {
        await this.router.navigateByUrl('login');
      }
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

  async onLogoutBtnClick(evt) {
    const actionSheet = await this.actionSheetController.create({
      header: '确认退出？',
      buttons: [
        {
          text: '确定',
          icon: 'walk',
          role: 'destructive',
          handler: () => {
            this.menuController.close();
            this.portalService.logout();
            this.router.navigateByUrl('login');
          }
        },
        {
          text: '取消',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await actionSheet.present();
  }
}
