import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'codigo',
  standalone: true
})
export class CodigoPipe implements PipeTransform {

    transform(lista: any[],codigo: string): any[] {
    if(codigo=='')return lista
    else return lista.filter(pro => String(pro.codigo).includes(codigo))
  }
}
