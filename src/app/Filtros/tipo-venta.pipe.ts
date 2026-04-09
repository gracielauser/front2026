import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tipoVenta',
  standalone: true
})
export class TipoVentaPipe implements PipeTransform {

  transform(lista: any[], tipoVenta: string): any[] {
    if (!lista || !Array.isArray(lista)) return [];
    if (tipoVenta === '') return lista;
    return lista.filter(ven => Number(ven.tipo_venta) === Number(tipoVenta));
  }

}
