import { Pipe, PipeTransform } from '@angular/core';
import { Venta } from '../Modelos/venta';

@Pipe({
  name: 'reporteVentas'
})
export class ReporteVentasPipe implements PipeTransform {

  transform(lista: Venta[],criterio: string): Venta[] {
    if(criterio =='')return lista
    else {
      let n:number=0
      if(criterio=='fisico')n=1
      else if(criterio == 'pedido')n=2
      else return lista.filter(venta => venta.usuario.persona.nombres.includes(criterio))

      return lista.filter(venta => venta.tipo_venta==n)
    }
  }

}
