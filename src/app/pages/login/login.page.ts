import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PortalService } from '../../services/portal.service';

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
    private portalService: PortalService
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
       console.warn('login error');
    }
  }
  onConfigBtnClick() {
    this.navCtrl.navigateForward('/app-config');
  }
}
