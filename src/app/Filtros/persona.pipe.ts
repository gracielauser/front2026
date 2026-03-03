import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'persona',
  standalone: true
})
export class PersonaPipe implements PipeTransform {

  transform(lista: any[],persona: string): any[] {
    if(persona=='')return lista
    else return lista.filter(usu => (usu.empleado.nombre +' '+usu.empleado.ap_paterno+ ' '+usu.empleado.ap_materno).toLowerCase().includes(persona.toLowerCase()))
  }

}
