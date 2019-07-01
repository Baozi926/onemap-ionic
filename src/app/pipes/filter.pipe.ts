import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  public transform(value, key: string, term: string) {
    // console.log('pipe filter', value);

    if (!term) { return []; }

    const termArr = term.split(',');

    return (value || []).filter(v => {
        return termArr.some(vv => {
            return v[key] === vv;
        });

    });

    // return (value || []).filter(item => keys.split(',').some(key => item.hasOwnProperty(key) && new RegExp(term, 'gi').test(item[key])));

  }

}
