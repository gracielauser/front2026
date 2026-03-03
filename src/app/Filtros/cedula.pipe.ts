import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cedula',
  standalone: true
})
export class CedulaPipe implements PipeTransform {
  transform(lista: any[],ci: string): any[] {
    if(ci=='')return lista
    else return lista.filter(em => String(em.ci).includes(ci))
  }

}
