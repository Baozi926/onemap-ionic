import { Component, ViewChild, OnInit, Renderer, Input } from '@angular/core';

/**
 * Generated class for the AccordionComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'accordion',
  templateUrl: 'accordion.html',
  styleUrls: ['./accordion.scss']
})
export class AccordionComponent implements OnInit {

  accordionExapanded = false;
  @ViewChild('cc') cardContent: any;
  @Input('title') title: string;

  icon = 'arrow-forward';

  constructor(public renderer: Renderer) {

  }

  ngOnInit() {
    // console.log(this.cardContent.el);
    this.renderer.setElementStyle(this.cardContent.el, 'webkitTransition', 'max-height 500ms, padding 500ms');
    this.toggleAccordion();
  }

  toggleAccordion() {

    if (this.accordionExapanded) {
      this.renderer.setElementStyle(this.cardContent.el, 'max-height', '0px');
      this.renderer.setElementStyle(this.cardContent.el, 'padding', '0px 16px');

    } else {
      this.renderer.setElementStyle(this.cardContent.el, 'max-height', '5000px');
      this.renderer.setElementStyle(this.cardContent.el, 'padding', '13px 16px');

    }

    this.accordionExapanded = !this.accordionExapanded;
    this.icon = this.icon === 'arrow-forward' ? 'arrow-down' : 'arrow-forward';

  }

}
