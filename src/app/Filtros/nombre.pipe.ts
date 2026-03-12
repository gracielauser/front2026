import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombre',
  standalone: true
})
export class NombrePipe implements PipeTransform {

  transform(lista: any[], nombre: string): any[] {
    if (nombre == '') return lista;

    const busqueda = nombre.toLowerCase();

    return lista.filter(producto => {
      const nombreCoincide = producto.nombre?.toLowerCase().includes(busqueda);
      const codigoCoincide = producto.codigo?.toLowerCase().includes(busqueda);
      const marcaCoincide = producto.marca?.nombre?.toLowerCase().includes(busqueda);

      return nombreCoincide || codigoCoincide || marcaCoincide;
    });
  }

}
