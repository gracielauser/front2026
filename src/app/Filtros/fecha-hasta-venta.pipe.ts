import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaHastaVenta',
  standalone: true
})
export class FechaHastaVentaPipe implements PipeTransform {

  transform(lista: any[], fechaHasta: string): any[] {
    if (!lista || !Array.isArray(lista)) return [];
    if (!fechaHasta || fechaHasta === '') return lista;

    // Convertir fecha hasta a Date (al final del día)
    const hasta = new Date(fechaHasta);
    hasta.setHours(23, 59, 59, 999);

    return lista.filter(venta => {
      if (!venta.fecha_registro) return false;

      // Extraer solo la parte de fecha de 'YYYY-MM-DD hh:mm:ss'
      const fechaVentaStr = venta.fecha_registro.split(' ')[0];
      const fechaVenta = new Date(fechaVentaStr);
      fechaVenta.setHours(0, 0, 0, 0);

      // La fecha de la venta debe ser menor o igual a la fecha hasta
      return fechaVenta <= hasta;
    });
  }

}
