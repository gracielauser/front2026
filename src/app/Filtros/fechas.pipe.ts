import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechas',
  standalone: true
})
export class FechasPipe implements PipeTransform {

  transform(lista: any[], fechaD: Date, fechaA: Date): any[] {
    // Normalizar/parsear entradas que pueden venir como string o Date
    const parseDate = (d: any): Date | null => {
      if (d == null || d === '' ) return null;
      const dt = d instanceof Date ? d : new Date(d);
      return isNaN(dt.getTime()) ? null : dt;
    };

    const desde = parseDate(fechaD);
    const hasta = parseDate(fechaA);

    // Si no hay criterios válidos devolvemos la lista completa
    if (!desde && !hasta) return lista;

    // Función para parsear la fecha del item de forma segura
    const parseItemDate = (item: any): Date | null => {
      if (!item) return null;
      const val = item.fecha_registro ?? item.fecha ?? item.fechaRegistro ?? item;
      if (val == null || val === '') return null;
      const dt = val instanceof Date ? val : new Date(val);
      return isNaN(dt.getTime()) ? null : dt;
    };

    return lista.filter(item => {
      const itemDate = parseItemDate(item);
      // Si la fecha del item no es válida, no lo incluyas en resultados filtrados
      if (!itemDate) return false;

      if (desde && !hasta) {
        return itemDate >= desde;
      }
      if (!desde && hasta) {
        return itemDate <= hasta;
      }
      // ambos definidos
      return itemDate >= desde! && itemDate <= hasta!;
    });
  }

}
