import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PortalService } from '../../services/portal.service';
import { ModalController, Events, MenuController } from '@ionic/angular';
@Component({
  selector: 'app-resource-detail',
  templateUrl: './resource-detail.component.html',
  styleUrls: ['./resource-detail.component.scss']
})
export class ResourceDetailComponent implements OnInit {
  constructor(
    private router: Router,
    private modalController: ModalController,
    private portalService: PortalService
  ) {}
  @Input() item?: any;
  ngOnInit() {
    console.log('详情显示', this.item);
  }

  dissModal() {
    this.modalController.dismiss();
  }
  onAdd2MapClick(evt) {
    this.router.navigateByUrl(`map?itemId=${this.item.id}`);
    this.dissModal();
  }

  getThumbnailUrl() {
    return this.portalService.getThumbnailUrl(
      this.item,
      this.portalService.getToken()
    );
  }
}
