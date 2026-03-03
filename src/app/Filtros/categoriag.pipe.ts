import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoriag',
  standalone: true
})
export class CategoriagPipe implements PipeTransform {

  transform(lista: any[],categoria:string): any[] {
    if(categoria==='')return lista
    else return lista.filter(gas => gas.categoria==categoria)
  }

}
