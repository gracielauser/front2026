import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unidadMedida',
  standalone: true
})
export class UnidadMedidaPipe implements PipeTransform {
  transform(lista: any[], unidadFilter: string): any[] {
    if (!lista || !unidadFilter || unidadFilter === '') {
      return lista;
    }

    return lista.filter(pro => pro.id_unidad_medida == unidadFilter || pro.unidad_medida?.id_unidad_medida == unidadFilter);
  }
}
