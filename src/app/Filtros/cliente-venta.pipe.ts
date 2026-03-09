import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clienteVenta',
  standalone: true
})
export class ClienteVentaPipe implements PipeTransform {

  transform(lista: any[], nombreCliente: string): any[] {
    if (!lista || !Array.isArray(lista)) return [];
    if (!nombreCliente || nombreCliente === '') return lista;

    const termino = nombreCliente.toLowerCase().trim();

    return lista.filter(venta => {
      // Si la venta no tiene cliente, es público general
      if (!venta.cliente) {
        // Permitir buscar "publico", "general", etc.
        return 'público general'.includes(termino);
      }

      // Construir nombre completo del cliente
      const nombre = venta.cliente.nombre || '';
      const apPaterno = venta.cliente.ap_paterno || '';
      const apMaterno = venta.cliente.ap_materno || '';
      const nombreCompleto = `${nombre} ${apPaterno} ${apMaterno}`.toLowerCase().trim();

      return nombreCompleto.includes(termino);
    });
  }

}
