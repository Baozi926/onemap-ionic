import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from '../../services/search.service';
@Component({
  selector: 'app-search-result-detail',
  templateUrl: './search-result-detail.component.html',
  styleUrls: ['./search-result-detail.component.scss']
})
export class SearchResultDetailComponent implements OnInit {
  constructor(private searchService: SearchService) {}
  @Input() data?: any;
  attr = [];
  // data: any;
  ngOnInit() {
    // this.data = {
    //   test: 1,
    //   a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, qwq: 1, aaa: 1, sadad: 1, asdasd: 1
    // };
  }
  ngOnChanges() {
    console.log(this.data);
    if (this.data && this.data.attributes) {
      const layer = this.data.attributes.LAYER;
      const dict =  this.searchService.getFieldDictForLayer(layer);
      if (dict) {
        const attrMap = this.data.attributes;
        // const tmpAttr = [];
        this.attr = dict.map(v => {
          return {
            name: v.name,
            value: attrMap[v.key]
          };
        });
        console.log(this.attr);
      }

    // this.load
      // this.attr = this.data.attributes;
    }
  }

}
