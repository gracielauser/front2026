import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nroCompra',
  standalone: true
})
export class NroCompraPipe implements PipeTransform {
 transform(lista:any[],nrocompra:string): any [] {
    if(nrocompra=='')return lista
    else return lista.filter(compra=>String(compra.nro_compra).includes(nrocompra))
    return null;
  }

}
