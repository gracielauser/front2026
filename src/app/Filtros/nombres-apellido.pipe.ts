import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombresApellido',
  standalone: true
})
export class NombresApellidoPipe implements PipeTransform {

transform(lista: any[],nombre: string): any[] {
    if(nombre=='')return lista
    else return lista.filter(em => (em.nombre +' '+em.ap_paterno+ ' '+em.ap_materno).toLowerCase().includes(nombre.toLowerCase()))
  }

}
