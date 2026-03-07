import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoria',
  standalone: true
})
export class CategoriaPipe implements PipeTransform {

  transform(lista: any[], categoria: string, subcategoria?: string): any[] {
    // Si hay subcategoría seleccionada, filtrar solo por ella
    if (subcategoria && subcategoria !== '') {
      return lista.filter(pro => pro.id_categoria == subcategoria);
    }

    // Si hay categoría pero no subcategoría, filtrar por categoría padre y sus subcategorías
    if (categoria && categoria !== '') {
      return lista.filter(pro => {
        // Producto tiene directamente la categoría padre seleccionada
        if (pro.id_categoria == categoria) {
          return true;
        }
        // Producto tiene una subcategoría cuyo padre es la categoría seleccionada
        if (pro.categorium && pro.categorium.id_categoria_padre == categoria) {
          return true;
        }
        return false;
      });
    }

    // Si no hay filtros, devolver toda la lista
    return lista;
  }

}
