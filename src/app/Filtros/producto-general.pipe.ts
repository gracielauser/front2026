import { Pipe, PipeTransform } from '@angular/core';
import { Producto } from '../Modelos/producto';

@Pipe({
  name: 'productoGeneral',
  standalone: true
})
export class ProductoGeneralPipe implements PipeTransform {
  transform(productos: Producto[], searchTerm: string): Producto[] {
    if (!productos || !searchTerm) {
      return productos;
    }

    const termino = searchTerm.toLowerCase().trim();

    return productos.filter(producto => {
      const nombre = (producto.nombre || '').toLowerCase();
      const codigo = (producto.codigo || '').toLowerCase();
      const marca = (producto.marca?.nombre || '').toLowerCase();

      return nombre.includes(termino) ||
             codigo.includes(termino) ||
             marca.includes(termino);
    });
  }
}
