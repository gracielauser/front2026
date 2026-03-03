import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombre',
  standalone: true
})
export class NombrePipe implements PipeTransform {

 transform(lista: any[],nombre: string): any[] {
    if(nombre=='')return lista
    else return lista.filter(algo => (algo.nombre).toLowerCase().includes(nombre.toLowerCase()))
  }

}
