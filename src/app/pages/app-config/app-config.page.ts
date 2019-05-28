import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PortalService } from '../../services/portal.service';
import {
  ModalController,
  Events,
  AlertController,
  IonInput
} from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-app-config',
  templateUrl: './app-config.page.html',
  styleUrls: ['./app-config.page.scss']
})
export class AppConfigPage implements OnInit {
  constructor(
    private portalService: PortalService,
    private alertController: AlertController,
    private router: Router
  ) {}
  private portalUrl: string;

  @ViewChild('portalUrlInput') private portalUrlInput: IonInput;
  async ngOnInit() {
    this.portalUrl = await this.portalService.getPortalUrl();
    console.log('portalUrl', this.portalUrl);
  }
  async onChangePortalUrlBtnClick() {
    const url = this.portalUrlInput.value;

    const alert = await this.alertController.create({
      header: `将Portal地址更改为:${url}`,
      // message: 'Message <strong>text</strong>!!!',
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          cssClass: 'secondary',
          handler: blah => {
            console.log('Confirm Cancel: blah');
          }
        },
        {
          text: '确定',
          handler: async () => {
            await this.portalService.setPortalUrl(url);
            this.router.navigateByUrl('login');
          }
        }
      ]
    });

    alert.present();


  }
}
