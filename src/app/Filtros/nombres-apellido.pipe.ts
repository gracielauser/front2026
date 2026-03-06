import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombresApellido',
  standalone: true
})
export class NombresApellidoPipe implements PipeTransform {

transform(lista: any[],nombre: string): any[] {
    if(nombre=='')return lista
    else {
      if(isNaN(Number(nombre))){
        return lista.filter(em => (em.nombre +' '+em.ap_paterno+ ' '+em.ap_materno).toLowerCase().includes(nombre.toLowerCase()))
      }else{
        return lista.filter(em => {
          // Obtener el documento (ci_nit o ci), el que exista
          const documento = em.ci_nit || em.ci;
          // Verificar que existe antes de convertir a string
          return documento ? documento.toString().includes(nombre) : false;
        })
      }
    }
  }

}
