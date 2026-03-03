import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoria',
  standalone: true
})
export class CategoriaPipe implements PipeTransform {

     transform(lista: any[],categoria:string): any[] {
    if(categoria==='')return lista
    else return lista.filter(pro => pro.id_categoria==categoria)//cat es la representacion de cada entidad por iteracion
    //  y despues de flecha se pone la condicion verdadera, los que la cumplan seran devueltos en un array
  }

}
