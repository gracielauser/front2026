import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechas',
  standalone: true
})
export class FechasPipe implements PipeTransform {

  // Convierte un string en formato "YYYY-MM-DD" a Date en zona horaria local
  private parseStringToDate(fechaStr: string): Date | null {
    if (!fechaStr) return null;

    const [year, month, day] = fechaStr.split('-').map(Number);
    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day, 0, 0, 0);
  }

  // Convierte una cadena de fecha en formato "YYYY-MM-DD HH:MM:SS" a Date en zona horaria local
  private parseFechaLocal(fechaStr: string): Date | null {
    if (!fechaStr) return null;

    // Separar fecha y hora
    const [fechaParte, horaParte] = fechaStr.split(' ');
    if (!fechaParte) return null;

    const [year, month, day] = fechaParte.split('-').map(Number);
    let hora = 0, minutos = 0, segundos = 0;

    if (horaParte) {
      const [h, m, s] = horaParte.split(':').map(Number);
      hora = h || 0;
      minutos = m || 0;
      segundos = s || 0;
    }

    // Crear en zona horaria local (Bolivia)
    return new Date(year, month - 1, day, hora, minutos, segundos);
  }

  // Convierte Date de input type="date" a inicio y fin del día en zona horaria local
  private dateToDateLocal(date: Date): { inicio: Date; fin: Date } {
    if (!date) return { inicio: null!, fin: null! };

    // Extraer año, mes, día de la Date (en zona local)
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const inicio = new Date(year, month, day, 0, 0, 0);
    const fin = new Date(year, month, day, 23, 59, 59);
    return { inicio, fin };
  }

  transform(items: any[], filtro: string, fechaD?: string | Date, fechaA?: string | Date): any[] {
    if (!filtro || filtro === '') return items;

    let desde: Date | null = null;
    let hasta: Date | null = null;

    const hoy = new Date();
    const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const hoyFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

    switch (filtro) {
      case 'hoy':
        desde = hoyInicio;
        hasta = hoyFin;
        break;
      case 'ayer':
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        desde = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 0, 0, 0);
        hasta = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 23, 59, 59);
        break;
      case 'esta semana':
        const diaSemana = hoy.getDay(); // 0=domingo
        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1));
        desde = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate(), 0, 0, 0);
        const domingo = new Date(lunes);
        domingo.setDate(lunes.getDate() + 6);
        hasta = new Date(domingo.getFullYear(), domingo.getMonth(), domingo.getDate(), 23, 59, 59);
        break;
      case 'este mes':
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1, 0, 0, 0);
        const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        hasta = new Date(ultimoDiaMes.getFullYear(), ultimoDiaMes.getMonth(), ultimoDiaMes.getDate(), 23, 59, 59);
        break;
      case 'mes anterior':
        const mesAnt = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        desde = new Date(mesAnt.getFullYear(), mesAnt.getMonth(), 1, 0, 0, 0);
        const ultimoDiaMesAnt = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        hasta = new Date(ultimoDiaMesAnt.getFullYear(), ultimoDiaMesAnt.getMonth(), ultimoDiaMesAnt.getDate(), 23, 59, 59);
        break;
      case 'rango personalizado':
        if (fechaD) {
          const fechaDObj = typeof fechaD === 'string' ? this.parseStringToDate(fechaD) : fechaD;
          if (fechaDObj) {
            const desdeObj = this.dateToDateLocal(fechaDObj);
            desde = desdeObj.inicio;
          }
        }
        if (fechaA) {
          const fechaAObj = typeof fechaA === 'string' ? this.parseStringToDate(fechaA) : fechaA;
          if (fechaAObj) {
            const hastaObj = this.dateToDateLocal(fechaAObj);
            hasta = hastaObj.fin;
          }
        }
        break;
      default:
        return items;
    }

    return items.filter(item => {
      const fechaStr = item.fecha_registro;
      if (!fechaStr) return false;

      const fechaItem = this.parseFechaLocal(fechaStr);
      if (!fechaItem) return false;

      if (desde && !hasta) {
        return fechaItem >= desde;
      }
      if (!desde && hasta) {
        return fechaItem <= hasta;
      }
      if (desde && hasta) {
        return fechaItem >= desde && fechaItem <= hasta;
      }
      return true;
    });
  }

}
