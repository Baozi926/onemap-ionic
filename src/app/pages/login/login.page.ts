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

  ngOnInit() {
    if (this.username && this.password) {
      this.logIn();
    }
  }
  onLoginBtnClick(
    usernameNode?: HTMLInputElement,
    passwordNode?: HTMLInputElement
  ) {
    this.username = usernameNode.value;
    this.password = passwordNode.value;
    this.logIn();
  }
  async logIn() {
    const res = await this.portalService.login({
      username: this.username,
      password: this.password
    });

    if (res.islogin()) {
      this.navCtrl.navigateForward('/map');
    } else {
      // todo show error
    }
  }
}
