import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormat'
})
export class PriceFormatPipe implements PipeTransform {
  transform(value: number): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }
    
    const priceStr = Math.floor(value).toString();
    let formattedPrice = '';
    
    for (let i = 0; i < priceStr.length; i++) {
      if (i > 0 && (priceStr.length - i) % 3 === 0) {
        formattedPrice += ' ';
      }
      formattedPrice += priceStr[i];
    }
    
    return formattedPrice + ' Ft';
  }
}
