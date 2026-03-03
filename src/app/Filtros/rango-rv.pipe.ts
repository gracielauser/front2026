import { Pipe, PipeTransform } from '@angular/core';
import { Venta } from '../Modelos/venta';

@Pipe({
  name: 'rangoRV'
})
export class RangoRVPipe implements PipeTransform {
  transform(ventas: Venta[], rango: string): Venta[] {
    if (!ventas || !rango) return ventas;

    const now = new Date();
    const filteredVentas = ventas.filter(venta => {
      const ventaFecha = new Date(venta.fecha_registro); // Asegúrate de que `fecha` sea una propiedad válida

      switch (rango) {
        case 'semanal':
          // Filtra las ventas que están dentro de la misma semana
          return this.isSameWeek(ventaFecha, now);

        case 'mensual':
          // Filtra las ventas que están dentro del mismo mes
          return this.isSameMonth(ventaFecha, now);

        case 'anual':
          // Filtra las ventas que están dentro del mismo año
          return this.isSameYear(ventaFecha, now);

        default:
          return true;
      }
    });

    return filteredVentas;
  }

  // Función para verificar si dos fechas están en la misma semana
  private isSameWeek(date1: Date, date2: Date): boolean {
    // Aseguramos que las dos fechas estén en formato Date
  const startDate1 = new Date(date1);
  const startDate2 = new Date(date2);

  // Obtener el día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const day1 = startDate1.getDay() || 7;  // Si es domingo (0), lo cambiamos a 7
  const day2 = startDate2.getDay() || 7;

  // Ajustar las fechas al lunes de esa semana
  startDate1.setDate(startDate1.getDate() - day1 + 1); // Cambiamos al lunes de la semana de date1
  startDate2.setDate(startDate2.getDate() - day2 + 1); // Cambiamos al lunes de la semana de date2

  // Aseguramos que la fecha de inicio de la semana está correctamente alineada
  const startOfWeek = startDate2.getTime();
  const endOfWeek = startOfWeek + 6 * 24 * 60 * 60 * 1000; // Fin de la semana, 7 días después

  // Depuración: Imprimir las fechas de inicio y fin de la semana
  console.log(`startDate1: ${startDate1}, startOfWeek: ${startOfWeek}, endOfWeek: ${endOfWeek}`);

  // Comparar si la fecha de la venta está dentro de esta semana (entre el inicio y fin)
  return startDate1.getTime() >= startOfWeek && startDate1.getTime() <= endOfWeek;
  }

  // Función para verificar si dos fechas están en el mismo mes
  private isSameMonth(date1: Date, date2: Date): boolean {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  }
  private isSameYear(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear();
  }
}
