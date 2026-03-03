import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'genero',
  standalone: true
})
export class GeneroPipe implements PipeTransform {

   transform(lista: any[],genero:string): any[] {
    if(genero=='')return lista
    else return lista.filter(est => est.genero==genero)//cat es la representacion de cada entidad por iteracion
    //  y despues de flecha se pone la condicion verdadera, los que la cumplan seran devueltos en un array
  }

}
