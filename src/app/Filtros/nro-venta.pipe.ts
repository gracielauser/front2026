import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nroVenta',
  standalone: true
})
export class NroVentaPipe implements PipeTransform {

  transform(lista:any[],nroventa:string): any [] {
    if (!lista || !Array.isArray(lista)) return [];
    if(nroventa=='')return lista
    else return lista.filter(venta=>String(venta.nro_venta).includes(nroventa))
  }

}
