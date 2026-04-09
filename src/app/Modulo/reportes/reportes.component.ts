import { Component, OnInit } from '@angular/core';
import { DetalleVenta } from '../../Modelos/detalle-venta';
import { Usuario } from '../../Modelos/usuario';
import { Venta } from '../../Modelos/venta';
import { DetalleventaService } from '../../Servicios/detalleventa.service';
import { UsuarioService } from '../../Servicios/usuario.service';
import { VentaService } from '../../Servicios/venta.service';
//import * as pdfMake from 'pdfmake/build/pdfmake';
//import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../../Modelos/producto';
import { ProductoService } from '../../Servicios/producto.service';
import { Categoria } from '../../Modelos/categoria';
import { CategoriaService } from '../../Servicios/categoria.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CompraService } from '../../Servicios/compra.service';
import { ClienteService } from '../../Servicios/cliente.service';
import { GastoService } from '../../Servicios/gasto.service';
import { RecepcionCompra } from '../../Modelos/recepcion-compra';
import { ReportesVentaService } from '../../Servicios/reportes-venta.service';

//(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

@Component({
  selector: 'app-reportes',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent implements OnInit {
  tipo: string = ''//para filtrar por tipo
  apiUsuarios: Usuario[] = []
  apiVentas: Venta[] = []
  apiDetalleVenta: DetalleVenta[] = []
  apiProducto: Producto[] = []
  apiCategoria:Categoria[]=[]

  // Datos de inventario
  datosInventarioReporte: any = null
  filtroInventario = {
    categoria: '',
    marca: '',
    estado: '',
    busqueda: ''
  }

  // Datos de clientes
  datosClientesReporte: any = null
  filtroClientes = {
    desde: '',
    hasta: '',
    id_cliente: '',
    busqueda: ''
  }
  mostrarListaClientes: boolean = false

  // Datos de compras
  datosComprasReporte: any = null
  filtroCompras = {
    desde: '',
    hasta: '',
    id_proveedor: '',
    busqueda: '',
    estado: ''
  }
  mostrarListaProveedores: boolean = false

  // Datos de ventas
  datosVentasReporte: any = null
  filtroVentas = {
    desde: '',
    hasta: '',
    tipo_venta: '',
    estado: '',
    tipo_pago: '',
    busqueda: ''
  }

  // Datos de gastos
  datosGastosReporte: any = null
  filtroGastos = {
    desde: '',
    hasta: '',
    estado: '',
    categoria: '',
    busqueda: ''
  }
  filtroFechaGastos: string = '';
  fechaDesdeGastos: string = '';
  fechaHastaGastos: string = '';
  enFiltroPersonalizadoGastos: boolean = false;

  // Datos de estado de resultados (negocio)
  datosNegocioReporte: any = null
  filtroNegocio = {
    desde: '',
    hasta: ''
  }

  compras: any[] = [];
  constructor(
    private VenSer: VentaService,
    private UsuSer: UsuarioService,
    private DetvSer: DetalleventaService,
    private http: HttpClient,
    private ProSer: ProductoService,
    private CatSer:CategoriaService,
    private ComSer: CompraService,
    private CliSer: ClienteService,
    private GasSer: GastoService,
    private RepSer: ReportesVentaService
  ) { }
  //para los filtros

  ngOnInit(): void {

   this.compras = [
      {
        id_compra: 1,
        nro_compra: 'C-0001',
        monto_total: 1520.50,
        estado: 1,
        fecha_registro: '2025-10-10',
        proveedor: {
          id_proveedor: 3,
          nombre: 'Autorepuestos Tarija',
          ciudad: 'Tarija',
          direccion: 'Av. La Paz N°123',
          celular: 72956432,
          email: 'ventas@autorepuestos.com'
        },
        usuario: {
          id_usuario: 1,
          nombre: 'Juan Pérez'
        },
        detalles: [
          {
            id_detcompra: 1,
            producto: {
              id_producto: 10,
              nombre: 'Filtro de aceite Toyota',
              codigo: 'FA-001',
              precio_compra: 50,
              precio_venta: 75
            },
            cantidad: 10,
            precio_unitario: 50,
            sub_total: 500
          },
          {
            id_detcompra: 2,
            producto: {
              id_producto: 11,
              nombre: 'Bujía NGK',
              codigo: 'BJ-005',
              precio_compra: 25,
              precio_venta: 40
            },
            cantidad: 8,
            precio_unitario: 25,
            sub_total: 200
          }
        ]
      },
      {
        id_compra: 2,
        nro_compra: 'C-0002',
        monto_total: 800,
        estado: 1,
        fecha_registro: '2025-10-12',
        proveedor: {
          id_proveedor: 4,
          nombre: 'Repuestos La Torre',
          ciudad: 'Tarija',
          direccion: 'C. Cochabamba 456',
          celular: 76123456,
          email: 'contacto@latorre.com'
        },
        usuario: {
          id_usuario: 2,
          nombre: 'María López'
        },
        detalles: [
          {
            id_detcompra: 3,
            producto: {
              id_producto: 15,
              nombre: 'Pastillas de freno Bosch',
              codigo: 'PF-007',
              precio_compra: 100,
              precio_venta: 140
            },
            cantidad: 4,
            precio_unitario: 100,
            sub_total: 400
          },
          {
            id_detcompra: 4,
            producto: {
              id_producto: 16,
              nombre: 'Aceite Castrol 20W50',
              codigo: 'AC-010',
              precio_compra: 100,
              precio_venta: 130
            },
            cantidad: 4,
            precio_unitario: 100,
            sub_total: 400
          }
        ]
      }
    ];
  }
  reporteDatosNegocio(){
    this.RepSer.getResultados().subscribe((pdfBlob) => {
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });

      // Abre en una nueva pestaña
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }
datosVentas(){
  this.VenSer.datosVentas().subscribe((data)=>{
    console.log('ventas: ',data);
    this.datosVentasReporte = data;
  })
}
datosNegocio(){
  this.RepSer.datosNegocio().subscribe((data)=>{
    console.log('datos negocio: ',data);
    this.datosNegocioReporte = data;
  })
}
datosInventario(){
  this.ProSer.datosReporte().subscribe((data)=>{
    console.log('datos: ',data);
    this.datosInventarioReporte = data;
  })
}
datosGastos(){
  this.GasSer.datosGastos().subscribe((data)=>{
    console.log('gastos: ',data);
    this.datosGastosReporte = data;
  })
}

datosClientes(){
  this.CliSer.datosClientes().subscribe((data)=>{
    console.log('datos clientes: ', data);
    this.datosClientesReporte = data;
  })
}

datosCompras(){
  this.ComSer.datosReporte().subscribe((data)=>{
    console.log('datos compras: ', data);
    this.datosComprasReporte = data;
  })
}

onFiltroFechaGastosChange(event: any): void {
  const valor = event.target.value;
  if (valor === 'rango personalizado') {
    this.enFiltroPersonalizadoGastos = true;
    this.fechaDesdeGastos = '';
    this.fechaHastaGastos = '';
  } else {
    this.enFiltroPersonalizadoGastos = false;
    this.fechaDesdeGastos = '';
    this.fechaHastaGastos = '';
  }
}

ponerFechaGastos(e: any, tipo: number): void {
  const fechaStr = e.target.value; // formato: YYYY-MM-DD
  if (!fechaStr) return;

  // Guardar la fecha tal como la elige el usuario para evitar cambios por conversión UTC
  if (tipo === 1) {
    this.fechaDesdeGastos = fechaStr;
  } else if (tipo === 2) {
    this.fechaHastaGastos = fechaStr;
  }
}

get fechasFiltroGastos(): { desde: Date | null, hasta: Date | null } {
  const hoy = new Date();
  switch (this.filtroFechaGastos) {
    case 'hoy':
        const hoyComienzo = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
        const hoyFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
        return { desde: hoyComienzo, hasta: hoyFin };
      case 'ayer':
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        const ayerComienzo = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 0, 0, 0);
        const ayerFin = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 23, 59, 59);
        return { desde: ayerComienzo, hasta: ayerFin };
      case 'esta semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        inicioSemana.setHours(0, 0, 0, 0);
        return { desde: inicioSemana, hasta: hoy };
      case 'este mes':
        const inicioDeMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1, 0, 0, 0);
        return { desde: inicioDeMes, hasta: hoy };
      case 'mes anterior':
        const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1, 0, 0, 0);
        const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59);
        return { desde: mesAnterior, hasta: finMesAnterior };
      case 'rango personalizado':
        return {
          desde: this.fechaDesdeGastos ? new Date(this.fechaDesdeGastos + 'T00:00:00') : null,
          hasta: this.fechaHastaGastos ? new Date(this.fechaHastaGastos + 'T23:59:59') : null
        };
      default:
        return { desde: null, hasta: null };
  }
}

get productosFiltradosInventario(): any[] {
  if (!this.datosInventarioReporte || !this.datosInventarioReporte.productos) {
    return [];
  }

  return this.datosInventarioReporte.productos.filter((p: any) => {
    const coincideCategoria = !this.filtroInventario.categoria ||
      p.categoria.id_categoria.toString() === this.filtroInventario.categoria;

    const coincideMarca = !this.filtroInventario.marca ||
      p.marca.id_marca.toString() === this.filtroInventario.marca;

    const coincideEstado = this.filtroInventario.estado === '' ||
      p.estado_valor.toString() === this.filtroInventario.estado;

    const coincideBusqueda = !this.filtroInventario.busqueda ||
      p.nombre.toLowerCase().includes(this.filtroInventario.busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(this.filtroInventario.busqueda.toLowerCase());

    return coincideCategoria && coincideMarca && coincideEstado && coincideBusqueda;
  });
}

get categorias(): any[] {
  if (!this.datosInventarioReporte || !this.datosInventarioReporte.productos) {
    return [];
  }
  const categoriasMap = new Map();
  this.datosInventarioReporte.productos.forEach((p: any) => {
    if (!categoriasMap.has(p.categoria.id_categoria)) {
      categoriasMap.set(p.categoria.id_categoria, p.categoria);
    }
  });
  return Array.from(categoriasMap.values());
}

get marcas(): any[] {
  if (!this.datosInventarioReporte || !this.datosInventarioReporte.productos) {
    return [];
  }
  const marcasMap = new Map();
  this.datosInventarioReporte.productos.forEach((p: any) => {
    if (!marcasMap.has(p.marca.id_marca)) {
      marcasMap.set(p.marca.id_marca, p.marca);
    }
  });
  return Array.from(marcasMap.values());
}

limpiarFiltrosInventario() {
  this.filtroInventario = {
    categoria: '',
    marca: '',
    estado: '',
    busqueda: ''
  };
}

get totalesFiltrados(): any {
  const productos = this.productosFiltradosInventario;

  if (productos.length === 0) {
    return {
      total_productos: 0,
      productos_activos: 0,
      productos_inactivos: 0,
      total_unidades_stock: 0,
      valor_inventario_compra: 0,
      valor_inventario_venta: 0,
      ganancia_potencial: 0,
      margen_ganancia_total_porcentaje: 0
    };
  }

  const productos_activos = productos.filter((p: any) => p.estado_valor === 1).length;
  const productos_inactivos = productos.filter((p: any) => p.estado_valor === 0).length;
  const total_unidades_stock = productos.reduce((sum: number, p: any) => sum + (p.stock || 0), 0);
  const valor_inventario_compra = productos.reduce((sum: number, p: any) =>
    sum + ((p.precio_compra || 0) * (p.stock || 0)), 0);
  const valor_inventario_venta = productos.reduce((sum: number, p: any) =>
    sum + ((p.precio_venta || 0) * (p.stock || 0)), 0);
  const ganancia_potencial = valor_inventario_venta - valor_inventario_compra;
  const margen_ganancia_total_porcentaje = valor_inventario_compra > 0
    ? (ganancia_potencial / valor_inventario_compra) * 100
    : 0;

  return {
    total_productos: productos.length,
    productos_activos,
    productos_inactivos,
    total_unidades_stock,
    valor_inventario_compra,
    valor_inventario_venta,
    ganancia_potencial,
    margen_ganancia_total_porcentaje
  };
}

// Métodos para clientes
get todosClientesParaDropdown(): any[] {
  if (!this.datosClientesReporte || !this.datosClientesReporte.clientes) {
    return [];
  }
  return this.datosClientesReporte.clientes;
}

get clientesFiltrados(): any[] {
  if (!this.datosClientesReporte || !this.datosClientesReporte.clientes) {
    return [];
  }

  return this.datosClientesReporte.clientes.filter((c: any) => {
    const coincideBusqueda = !this.filtroClientes.busqueda ||
      c.nombre_completo.toLowerCase().includes(this.filtroClientes.busqueda.toLowerCase()) ||
      c.ci_nit.toString().includes(this.filtroClientes.busqueda) ||
      (c.celular && c.celular.includes(this.filtroClientes.busqueda));

    // Filtro por rango de fechas
    let coincideFecha = true;
    if (this.filtroClientes.desde && c.fecha_registro) {
      const fechaCliente = new Date(c.fecha_registro);
      const fechaDesde = new Date(this.filtroClientes.desde);
      coincideFecha = fechaCliente >= fechaDesde;
    }
    if (this.filtroClientes.hasta && c.fecha_registro && coincideFecha) {
      const fechaCliente = new Date(c.fecha_registro);
      const fechaHasta = new Date(this.filtroClientes.hasta);
      coincideFecha = fechaCliente <= fechaHasta;
    }

    const coincideCliente = !this.filtroClientes.id_cliente ||
      c.id_cliente.toString() === this.filtroClientes.id_cliente;

    return coincideBusqueda && coincideFecha && coincideCliente;
  });
}

get totalesFiltradosClientes(): any {
  const clientes = this.clientesFiltrados;

  if (clientes.length === 0) {
    return {
      total_clientes: 0,
      clientes_con_compras: 0,
      total_compras: 0,
      total_beneficio: 0,
      promedio_compras_por_cliente: 0,
      promedio_beneficio_por_cliente: 0
    };
  }

  const clientes_con_compras = clientes.filter((c: any) => c.cantidad_compras > 0).length;
  const total_compras = clientes.reduce((sum: number, c: any) => sum + (c.cantidad_compras || 0), 0);
  const total_beneficio = clientes.reduce((sum: number, c: any) => sum + (c.beneficio_total || 0), 0);
  const promedio_compras_por_cliente = clientes.length > 0 ? total_compras / clientes.length : 0;
  const promedio_beneficio_por_cliente = clientes.length > 0 ? total_beneficio / clientes.length : 0;

  return {
    total_clientes: clientes.length,
    clientes_con_compras,
    total_compras,
    total_beneficio,
    promedio_compras_por_cliente,
    promedio_beneficio_por_cliente
  };
}

filtrarClienteModal(event: any) {
  this.mostrarListaClientes = this.filtroClientes.busqueda.length > 0;
}

ocultarListaClientesConRetraso() {
  setTimeout(() => {
    this.mostrarListaClientes = false;
  }, 200);
}

seleccionarClienteFiltro(cliente: any, input: HTMLInputElement) {
  this.filtroClientes.id_cliente = cliente.id_cliente.toString();
  this.filtroClientes.busqueda = cliente.nombre_completo;
  this.mostrarListaClientes = false;
  input.blur();
}

limpiarFiltrosClientes() {
  this.filtroClientes = {
    desde: '',
    hasta: '',
    id_cliente: '',
    busqueda: ''
  };
}

// Métodos para compras
get todosProveedoresParaDropdown(): any[] {
  if (!this.datosComprasReporte || !this.datosComprasReporte.compras) {
    return [];
  }
  // Extraer proveedores únicos
  const proveedoresMap = new Map();
  this.datosComprasReporte.compras.forEach((c: any) => {
    if (!proveedoresMap.has(c.proveedor.id_proveedor)) {
      proveedoresMap.set(c.proveedor.id_proveedor, c.proveedor);
    }
  });
  return Array.from(proveedoresMap.values());
}

get comprasFiltradas(): any[] {
  if (!this.datosComprasReporte || !this.datosComprasReporte.compras) {
    return [];
  }

  return this.datosComprasReporte.compras.filter((c: any) => {
    const coincideBusqueda = !this.filtroCompras.busqueda ||
      c.proveedor.nombre.toLowerCase().includes(this.filtroCompras.busqueda.toLowerCase()) ||
      c.nro_compra.toLowerCase().includes(this.filtroCompras.busqueda.toLowerCase()) ||
      c.usuario.nombre_completo.toLowerCase().includes(this.filtroCompras.busqueda.toLowerCase());

    // Filtro por rango de fechas
    let coincideFecha = true;
    if (this.filtroCompras.desde && c.fecha_registro) {
      const fechaCompra = new Date(c.fecha_registro);
      const fechaDesde = new Date(this.filtroCompras.desde);
      coincideFecha = fechaCompra >= fechaDesde;
    }
    if (this.filtroCompras.hasta && c.fecha_registro && coincideFecha) {
      const fechaCompra = new Date(c.fecha_registro);
      const fechaHasta = new Date(this.filtroCompras.hasta);
      coincideFecha = fechaCompra <= fechaHasta;
    }

    const coincideProveedor = !this.filtroCompras.id_proveedor ||
      c.proveedor.id_proveedor.toString() === this.filtroCompras.id_proveedor;

    const coincideEstado = this.filtroCompras.estado === '' || c.estado === this.filtroCompras.estado;

    return coincideBusqueda && coincideFecha && coincideProveedor && coincideEstado;
  });
}

get totalesFiltradosCompras(): any {
  const compras = this.comprasFiltradas;

  if (compras.length === 0) {
    return {
      total_compras: 0,
      monto_total: 0,
      total_productos: 0,
      compras_activas: 0
    };
  }

  const monto_total = compras.reduce((sum: number, c: any) => sum + (c.monto_total || 0), 0);
  const total_productos = compras.reduce((sum: number, c: any) => sum + (c.total_cantidad || 0), 0);
  const compras_activas = compras.filter((c: any) => c.estado === 'Activa').length;

  return {
    total_compras: compras.length,
    monto_total: monto_total,
    total_productos: total_productos,
    compras_activas: compras_activas
  };
}

filtrarProveedorModal(event: any) {
  this.mostrarListaProveedores = this.filtroCompras.busqueda.length > 0;
}

ocultarListaProveedoresConRetraso() {
  setTimeout(() => {
    this.mostrarListaProveedores = false;
  }, 200);
}

seleccionarProveedorFiltro(proveedor: any, input: HTMLInputElement) {
  this.filtroCompras.id_proveedor = proveedor.id_proveedor.toString();
  this.filtroCompras.busqueda = proveedor.nombre;
  this.mostrarListaProveedores = false;
  input.blur();
}

limpiarFiltrosCompras() {
  this.filtroCompras = {
    desde: '',
    hasta: '',
    id_proveedor: '',
    busqueda: '',
    estado: ''
  };
}

// Métodos para ventas
get ventasFiltradas(): any[] {
  if (!this.datosVentasReporte || !this.datosVentasReporte.ventas) {
    return [];
  }

  return this.datosVentasReporte.ventas.filter((v: any) => {
    const coincideBusqueda = !this.filtroVentas.busqueda ||
      v.cliente.nombre_completo.toLowerCase().includes(this.filtroVentas.busqueda.toLowerCase()) ||
      v.nro_venta.toLowerCase().includes(this.filtroVentas.busqueda.toLowerCase()) ||
      v.cliente.ci_nit.toString().includes(this.filtroVentas.busqueda);

    // Filtro por rango de fechas
    let coincideFecha = true;
    if (this.filtroVentas.desde && v.fecha_registro) {
      const fechaVenta = new Date(v.fecha_registro);
      const fechaDesde = new Date(this.filtroVentas.desde);
      coincideFecha = fechaVenta >= fechaDesde;
    }
    if (this.filtroVentas.hasta && v.fecha_registro && coincideFecha) {
      const fechaVenta = new Date(v.fecha_registro);
      const fechaHasta = new Date(this.filtroVentas.hasta);
      coincideFecha = fechaVenta <= fechaHasta;
    }

    const coincideTipoVenta = this.filtroVentas.tipo_venta === '' ||
      v.tipo_venta === this.filtroVentas.tipo_venta;

    const coincideEstado = this.filtroVentas.estado === '' ||
      v.estado === this.filtroVentas.estado;

    const coincideTipoPago = this.filtroVentas.tipo_pago === '' ||
      v.tipo_pago === this.filtroVentas.tipo_pago;

    return coincideBusqueda && coincideFecha && coincideTipoVenta && coincideEstado && coincideTipoPago;
  });
}

get totalesFiltradosVentas(): any {
  const ventas = this.ventasFiltradas;

  if (ventas.length === 0) {
    return {
      total_ventas: 0,
      ventas_validas: 0,
      ventas_anuladas: 0,
      monto_total_general: 0,
      total_efectivo: 0,
      total_qr: 0,
      cantidad_efectivo: 0,
      cantidad_qr: 0
    };
  }

  const ventas_validas = ventas.filter((v: any) => v.estado_valor === 1).length;
  const ventas_anuladas = ventas.filter((v: any) => v.estado_valor === 0).length;
  const monto_total_general = ventas.filter((v: any) => v.incluida_en_totales).reduce((sum: number, v: any) => sum + (v.total || 0), 0);
  const total_efectivo = ventas.filter((v: any) => v.tipo_pago === 'Efectivo' && v.incluida_en_totales).reduce((sum: number, v: any) => sum + (v.total || 0), 0);
  const total_qr = ventas.filter((v: any) => v.tipo_pago === 'QR' && v.incluida_en_totales).reduce((sum: number, v: any) => sum + (v.total || 0), 0);
  const cantidad_efectivo = ventas.filter((v: any) => v.tipo_pago === 'Efectivo' && v.incluida_en_totales).length;
  const cantidad_qr = ventas.filter((v: any) => v.tipo_pago === 'QR' && v.incluida_en_totales).length;

  return {
    total_ventas: ventas.length,
    ventas_validas,
    ventas_anuladas,
    monto_total_general,
    total_efectivo,
    total_qr,
    cantidad_efectivo,
    cantidad_qr
  };
}

limpiarFiltrosVentas() {
  this.filtroVentas = {
    desde: '',
    hasta: '',
    tipo_venta: '',
    estado: '',
    tipo_pago: '',
    busqueda: ''
  };
}

// Métodos para gastos
get todosGastosAplanados(): any[] {
  if (!this.datosGastosReporte || !this.datosGastosReporte.gastos_por_mes) {
    return [];
  }
  // Aplanar el array de gastos agrupados por mes
  const gastosAplanados: any[] = [];
  this.datosGastosReporte.gastos_por_mes.forEach((mes: any) => {
    mes.gastos.forEach((gasto: any) => {
      gastosAplanados.push({
        ...gasto,
        mes_anio: mes.mes_anio,
        nombre_mes: mes.nombre_mes
      });
    });
  });
  return gastosAplanados;
}

get gastosFiltrados(): any[] {
  const todosGastos = this.todosGastosAplanados;

  if (todosGastos.length === 0) {
    return [];
  }

  return todosGastos.filter((g: any) => {
    const coincideBusqueda = !this.filtroGastos.busqueda ||
      g.descripcion.toLowerCase().includes(this.filtroGastos.busqueda.toLowerCase()) ||
      g.usuario.nombre_completo.toLowerCase().includes(this.filtroGastos.busqueda.toLowerCase());

    // Extraer solo fecha (YYYY-MM-DD) de g.fecha que está en formato 'YYYY-MM-DD HH:MM:SS'
    const fechaGastoStr = g.fecha ? g.fecha.split(' ')[0] : null;

    // Filtro por rango de fechas
    let coincideFecha = true;
    if (this.filtroFechaGastos) {
      const fechasFiltro = this.fechasFiltroGastos;
      if (fechasFiltro.desde && fechaGastoStr) {
        const fechaDesdeStr = fechasFiltro.desde.toISOString().split('T')[0];
        coincideFecha = fechaGastoStr >= fechaDesdeStr;
      }
      if (fechasFiltro.hasta && fechaGastoStr && coincideFecha) {
        const fechaHastaStr = fechasFiltro.hasta.toISOString().split('T')[0];
        coincideFecha = fechaGastoStr <= fechaHastaStr;
      }
    } else {
      if (this.filtroGastos.desde && fechaGastoStr) {
        coincideFecha = fechaGastoStr >= this.filtroGastos.desde;
      }
      if (this.filtroGastos.hasta && fechaGastoStr && coincideFecha) {
        coincideFecha = fechaGastoStr <= this.filtroGastos.hasta;
      }
    }

    const coincideEstado = this.filtroGastos.estado === '' || g.estado === this.filtroGastos.estado;

    const coincideCategoria = this.filtroGastos.categoria === '' ||
      g.categoria.toString() === this.filtroGastos.categoria;

    return coincideBusqueda && coincideFecha && coincideEstado && coincideCategoria;
  });
}

get totalesFiltradosGastos(): any {
  const gastos = this.gastosFiltrados;

  if (gastos.length === 0) {
    return {
      total_gastos: 0,
      gastos_validos: 0,
      gastos_anulados: 0,
      monto_total_general: 0,
      monto_total_validos: 0,
      monto_total_anulados: 0
    };
  }

  const gastos_validos = gastos.filter((g: any) => g.estado_valor === 1).length;
  const gastos_anulados = gastos.filter((g: any) => g.estado_valor === 0 || g.estado_valor === 2).length;
  const monto_total_general = gastos.reduce((sum: number, g: any) => sum + (g.monto || 0), 0);
  const monto_total_validos = gastos.filter((g: any) => g.incluido_en_totales).reduce((sum: number, g: any) => sum + (g.monto || 0), 0);
  const monto_total_anulados = gastos.filter((g: any) => !g.incluido_en_totales).reduce((sum: number, g: any) => sum + (g.monto || 0), 0);

  return {
    total_gastos: gastos.length,
    gastos_validos,
    gastos_anulados,
    monto_total_general,
    monto_total_validos,
    monto_total_anulados
  };
}

get categoriasGastos(): any[] {
  if (!this.datosGastosReporte || !this.datosGastosReporte.gastos_por_mes) {
    return [];
  }
  const categoriasSet = new Set<number>();
  this.datosGastosReporte.gastos_por_mes.forEach((mes: any) => {
    mes.gastos.forEach((gasto: any) => {
      categoriasSet.add(gasto.categoria);
    });
  });
  return Array.from(categoriasSet).map(id => ({ id_categoria: id, nombre: `Categoría ${id}` }));
}

limpiarFiltrosGastos() {
  this.filtroGastos = {
    desde: '',
    hasta: '',
    estado: '',
    categoria: '',
    busqueda: ''
  };
  this.filtroFechaGastos = '';
  this.fechaDesdeGastos = '';
  this.fechaHastaGastos = '';
  this.enFiltroPersonalizadoGastos = false;
}

// Métodos para estado de resultados (negocio)
get estadoResultados(): any {
  if (!this.datosNegocioReporte || !this.datosNegocioReporte.estado_resultados) {
    return null;
  }
  return this.datosNegocioReporte.estado_resultados;
}

get indicadoresNegocio(): any {
  if (!this.datosNegocioReporte || !this.datosNegocioReporte.indicadores) {
    return {
      margen_bruto_porcentaje: 0,
      margen_operativo_porcentaje: 0,
      margen_neto_porcentaje: 0,
      ratio_costo_ingresos: 0,
      ratio_gastos_ingresos: 0
    };
  }
  return this.datosNegocioReporte.indicadores;
}

limpiarFiltrosNegocio() {
  this.filtroNegocio = {
    desde: '',
    hasta: ''
  };
}
   async descargarPDF(): Promise<void> {
    console.log("haciendo pdf");

    const imageUrl = 'assets/logo.jpg'; // Ruta de la imagen en assets

    // Convertimos la imagen a Base64
    const logoBase64 = await this.getImageBase64(imageUrl);
    // Generar las filas dinámicamente desde el array `ventas`
    const filas = this.apiVentas.map((venta, index) => [


      index + 1,
      venta.id_venta.toString(),
      venta.fecha_registro.toString(),
      venta.tipo_venta==1?"Fisico":"Pedido",
      venta.usuario.persona.nombre + " " + venta.usuario.persona.ap_paterno + " " + venta.usuario.persona.ap_materno,
      venta.monto_total.toString()+" Bs."
    ]
  );

    // Definición del contenido del PDF
    const documentDefinition: any = {
      content: [
        {
          columns: [
            {
              image: logoBase64,
              width: 100, // Ajusta el tamaño del logo
              alignment: 'left', // Alineación del logo
            },
            {
              text: 'Repuestos y Accesorios Pinedo', // El título que irá al lado del logo
              style: 'header', // Estilo para el título
              alignment: 'left', // Alineación del texto
              margin: [20, 0, 0, 0], // Espaciado entre el logo y el título
            },
          ],
        },
        { text: 'Reporte de Ventas', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              ['Nro', 'Nro venta', 'Fecha', 'Tipo', 'Vendedor', 'Total'], // Encabezados
              ...filas
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 20],
        },
      },
    };

    // Generar y descargar el PDF
    //pdfMake.createPdf(documentDefinition).download('reporte-ventas.pdf');
  }

  // Función para convertir imagen a Base64
  private getImageBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get(url, { responseType: 'blob' }).subscribe(
        (response: Blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(response);
        },
        (error) => reject(error)
      );
    });
  }
  async descargarIPDF(): Promise<void> {
    console.log("haciendo pdf");

    const imageUrl = 'assets/logo.jpg'; // Ruta de la imagen en assets

    // Convertimos la imagen a Base64
    const logoBase64 = await this.getImageBase64(imageUrl);
    // Generar las filas dinámicamente desde el array `ventas`
    const filas = this.apiProducto.map((producto, index) => [
      index + 1,
      producto.id_producto.toString(),
      producto.categoria.nombre,
      producto.cantidad.toString(),
      producto.precio_compra,
      producto.precio_compra*producto.cantidad
    ]);
    // Definición del contenido del PDF
    const documentDefinition: any = {
      content: [
        {
          columns: [
            {
              image: logoBase64,
              width: 100, // Ajusta el tamaño del logo
              alignment: 'left', // Alineación del logo
            },
            {
              text: 'Repuestos y Accesorios Pinedo', // El título que irá al lado del logo
              style: 'header', // Estilo para el título
              alignment: 'left', // Alineación del texto
              margin: [20, 0, 0, 0], // Espaciado entre el logo y el título
            },
          ],
        },
        { text: 'Reporte de Inventario', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              ['Nro', 'Cod producto', 'Categoria', 'Cantidad en Stock', 'Precio Unitario', 'Valor Total'], // Encabezados
              ...filas
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 20],
        },
      },
    };

    // Generar y descargar el PDF
    //pdfMake.createPdf(documentDefinition).download('reporte-inventario.pdf');
  }
reporteGastos(){
this.GasSer.getPDF({}).subscribe((pdfBlob) => {
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });
      // Abre en una nueva pestaña
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
}
reporteClientesPDF(){
this.CliSer.getPDF({}).subscribe((pdfBlob) => {
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });
      // Abre en una nueva pestaña
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
}

 ventasPDF(resumido:boolean){
 this.VenSer.getPDF({},resumido).subscribe((pdfBlob) => {
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });

      // Abre en una nueva pestaña
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
}
inventarioPDF(){
  console.log('llamando pdf en ts');

 this.ProSer.getPDF().subscribe((pdfBlob) => {
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });

      // Abre en una nueva pestaña
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
}
generarReporteCompras(resumido: boolean){
this.ComSer.getPDF({},resumido).subscribe((pdfBlob) => {
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });

      // Abre en una nueva pestaña
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
}
}
