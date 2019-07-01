import { FilterPipe } from './filter.pipe';
import {SafeHtmlPipe} from './safe-html.pipe';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [FilterPipe, SafeHtmlPipe],
  exports: [FilterPipe, SafeHtmlPipe]
})
export class PipesModule {}
