import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PortalService } from '../../services/portal.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  username = 'admin';
  password = 'nsbdgis123';
  constructor(
    public navCtrl: NavController,
    private portalService: PortalService,
    private toastController: ToastController
  ) {}

  ngOnInit() {}
  onLoginBtnClick(
    usernameNode?: HTMLInputElement,
    passwordNode?: HTMLInputElement
  ) {
    this.username = usernameNode.value;
    this.password = passwordNode.value;
    this.logIn();
  }

  async logIn() {
    console.log('do login');
    const res = await this.portalService
      .setUser({
        username: this.username,
        password: this.password
      })
      .login();
    if (res.success) {
      this.navCtrl.navigateForward('/map');
    } else {
      // todo show error
      const toast = await this.toastController.create({
        color: 'dark',
        message: `登录失败[${res.error}]`,
        duration: 2000,
        position: 'top'
      });
      toast.present();
      console.warn('login error');
      //  this.
    }
  }
  onConfigBtnClick() {
    this.navCtrl.navigateForward('/app-config');
  }
}
