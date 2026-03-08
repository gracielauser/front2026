import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estado',
  standalone: true
})
export class EstadoPipe implements PipeTransform {

   transform(lista: any[],estado:string): any[] {
    if (!lista || !Array.isArray(lista)) return [];
    if(estado=='')return lista
    else return lista.filter(est => Number(est.estado)==Number(estado))//cat es la representacion de cada entidad por iteracion
    //  y despues de flecha se pone la condicion verdadera, los que la cumplan seran devueltos en un array
  }

}
