import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaDesdeVenta',
  standalone: true
})
export class FechaDesdeVentaPipe implements PipeTransform {

  transform(lista: any[], fechaDesde: string): any[] {
    if (!lista || !Array.isArray(lista)) return [];
    if (!fechaDesde || fechaDesde === '') return lista;

    // Convertir fecha desde a Date (solo la parte de fecha, ignorar hora)
    const desde = new Date(fechaDesde);
    desde.setHours(0, 0, 0, 0);

    return lista.filter(venta => {
      if (!venta.fecha_registro) return false;

      // Extraer solo la parte de fecha de 'YYYY-MM-DD hh:mm:ss'
      const fechaVentaStr = venta.fecha_registro.split(' ')[0];
      const fechaVenta = new Date(fechaVentaStr);
      fechaVenta.setHours(0, 0, 0, 0);

      // La fecha de la venta debe ser mayor o igual a la fecha desde
      return fechaVenta >= desde;
    });
  }

}
