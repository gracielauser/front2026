import { Pipe, PipeTransform } from '@angular/core';
import { Usuario } from '../Modelos/usuario';

@Pipe({
  name: 'usuario',
  standalone: true
})
export class usuarioPipe implements PipeTransform {
transform(lista: any[],usuario: string): any[] {
    if(usuario=='')return lista
    else return lista.filter(em => (em.usuario).toLowerCase().includes(usuario.toLowerCase()))
  }

}
