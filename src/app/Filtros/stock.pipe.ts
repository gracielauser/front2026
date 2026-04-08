import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stock',
  standalone: true
})
export class StockPipe implements PipeTransform {

  transform(lista: any[], stockFilter: string): any[] {
    if (!lista || !stockFilter || stockFilter === '') {
      return lista;
    }

    return lista.filter(pro => {
      if (stockFilter === 'normal') {
        return pro.stock > pro.stock_minimo;
      }
      if (stockFilter === 'bajo') {
        return pro.stock <= pro.stock_minimo || pro.stock <= 10;
      }
      return true;
    });
  }
}
