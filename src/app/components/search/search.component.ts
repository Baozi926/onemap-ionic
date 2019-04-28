import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {

  constructor(public modalCtrl: ModalController) {


  }

  layers = [];
  dissModal() {
    this.modalCtrl.dismiss();
  }



  ngOnInit() {


  }

}
