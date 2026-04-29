import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'usuarioVenta',
  standalone: true
})
export class UsuarioVentaPipe implements PipeTransform {
  transform(lista: any[], idUsuario: string): any[] {
    if (!lista || !Array.isArray(lista)) return [];
    if (!idUsuario || idUsuario === '') return lista;
    return lista.filter(v => v.id_usuario != null && v.id_usuario.toString() === idUsuario);
  }
}
