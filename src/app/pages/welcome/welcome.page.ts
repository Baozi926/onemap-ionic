import { Component, OnInit } from '@angular/core';
import {PortalService} from '../../services/portal.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  constructor(private portalService: PortalService, private router: Router) {


   }

  ngOnInit() {



  }

}
