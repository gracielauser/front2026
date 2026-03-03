import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estado',
  standalone: true
})
export class EstadoPipe implements PipeTransform {

   transform(lista: any[],estado:string): any[] {
    if(estado=='')return lista
    else return lista.filter(est => est.estado==estado)//cat es la representacion de cada entidad por iteracion
    //  y despues de flecha se pone la condicion verdadera, los que la cumplan seran devueltos en un array
  }

}
