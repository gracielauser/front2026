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
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

//(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

@Component({
  selector: 'app-reportes',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxEchartsModule],
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
    busqueda: '',
    unidad: ''
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
  filtroFechaClientes: string = 'este año'
  fechaDesdeClientesR: string = ''
  fechaHastaClientesR: string = ''
  mostrarRangoPersonalizadoClientes: boolean = false

  // Datos de compras
  datosComprasReporte: any = null
  filtroCompras = {
    desde: '',
    hasta: '',
    id_proveedor: '',
    busqueda: '',
    estado: '',
    tipo_compra: '',
    id_usuario: ''
  }
  mostrarListaProveedores: boolean = false
  filtroFechaCompras: string = ''
  mostrarRangoPersonalizadoCompras: boolean = false
  mostrarListaUsuariosCompras: boolean = false
  usuarioSeleccionadoCompras: any = null
  busquedaUsuarioCompras: string = ''

  // Datos de ventas
  datosVentasReporte: any = null
  filtroVentas = {
    desde: '',
    hasta: '',
    tipo_venta: '',
    estado: '',
    tipo_pago: '',
    busqueda: '',
    id_cliente: '',
    id_usuario: ''
  }
  filtroFechaVentas: string = '';
  fechaDesdeVentasR: string = '';
  fechaHastaVentasR: string = '';
  enFiltroPersonalizadoVentasR: boolean = false;
  mostrarListaClientesVentas: boolean = false;
  clienteSeleccionadoVentas: any = null;
  mostrarListaUsuariosVentas: boolean = false
  usuarioSeleccionadoVentas: any = null
  busquedaUsuarioVentas: string = ''

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

  // Datos de tendencia de productos
  datosTendenciaReporte: any[] = []
  filtroTendencia = {
    nombre_codigo: '',
    categoria: '',
    marca: '',
    desde: '',
    hasta: '',
    tipo_venta: ''
  }
  periodoTendencia: string = ''
  mostrarRangoPersonalizadoTendencia: boolean = false
  chartOptionTendencia!: EChartsOption
  categoriasParaTendencia: any[] = []
  marcasParaTendencia: any[] = []

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
    this.datosTendencia();
    this.UsuSer.getListaUsuario().subscribe((data: any[]) => {
      this.apiUsuarios = data;
    });
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
  this.RepSer.datosNegocio(this.filtroNegocio.desde, this.filtroNegocio.hasta).subscribe((data)=>{
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
  const body = this.construirBodyClientes();
  this.CliSer.datosClientes(body).subscribe((data)=>{
    console.log('datos clientes: ', data);
    this.datosClientesReporte = data;
  })
}

construirBodyClientes(): { desde: string, hasta: string, id_cliente: string } {
  const hoy = new Date();
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  let desde = '';
  let hasta = '';
  switch (this.filtroFechaClientes) {
    case 'hoy':
      desde = fmt(hoy);
      hasta = fmt(hoy);
      break;
    case 'ayer':
      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1);
      desde = fmt(ayer);
      hasta = fmt(ayer);
      break;
    case 'esta semana':
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      desde = fmt(inicioSemana);
      hasta = fmt(hoy);
      break;
    case 'este mes':
      desde = fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
      hasta = fmt(hoy);
      break;
    case 'mes anterior':
      desde = fmt(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1));
      hasta = fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 0));
      break;
    case 'este año':
      desde = fmt(new Date(hoy.getFullYear(), 0, 1));
      hasta = fmt(hoy);
      break;
    case 'rango personalizado':
      desde = this.fechaDesdeClientesR;
      hasta = this.fechaHastaClientesR;
      break;
    default:
      desde = '';
      hasta = '';
  }
  return { desde, hasta, id_cliente: this.filtroClientes.id_cliente };
}

onFiltroFechaClientesChange(): void {
  if (this.filtroFechaClientes === 'rango personalizado') {
    this.mostrarRangoPersonalizadoClientes = true;
    this.fechaDesdeClientesR = '';
    this.fechaHastaClientesR = '';
  } else {
    this.mostrarRangoPersonalizadoClientes = false;
    this.fechaDesdeClientesR = '';
    this.fechaHastaClientesR = '';
    this.datosClientes();
  }
}

ponerFechaClientesR(e: any, tipo: number): void {
  const fechaStr = e.target.value;
  if (!fechaStr) return;
  if (tipo === 1) {
    this.fechaDesdeClientesR = fechaStr;
  } else if (tipo === 2) {
    this.fechaHastaClientesR = fechaStr;
  }
  if (this.fechaDesdeClientesR && this.fechaHastaClientesR) {
    this.datosClientes();
  }
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

    const coincideUnidad = !this.filtroInventario.unidad ||
      p.unidad_medida?.id_unidad_medida == this.filtroInventario.unidad;

    return coincideCategoria && coincideMarca && coincideEstado && coincideBusqueda && coincideUnidad;
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

get unidades(): any[] {
  if (!this.datosInventarioReporte || !this.datosInventarioReporte.productos) {
    return [];
  }
  const unidadesMap = new Map();
  this.datosInventarioReporte.productos.forEach((p: any) => {
    if (p.unidad_medida && !unidadesMap.has(p.unidad_medida.id_unidad_medida)) {
      unidadesMap.set(p.unidad_medida.id_unidad_medida, p.unidad_medida);
    }
  });
  return Array.from(unidadesMap.values());
}

limpiarFiltrosInventario() {
  this.filtroInventario = {
    categoria: '',
    marca: '',
    estado: '',
    busqueda: '',
    unidad: ''
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
      c.ci_nit?.toString().includes(this.filtroClientes.busqueda) ||
      (c.celular && c.celular.includes(this.filtroClientes.busqueda));

    const coincideCliente = !this.filtroClientes.id_cliente ||
      c.id_cliente.toString() === this.filtroClientes.id_cliente;

    return coincideBusqueda && coincideCliente;
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
  this.datosClientes();
}

limpiarFiltrosClientes() {
  this.filtroClientes = {
    desde: '',
    hasta: '',
    id_cliente: '',
    busqueda: ''
  };
  this.filtroFechaClientes = 'este año';
  this.fechaDesdeClientesR = '';
  this.fechaHastaClientesR = '';
  this.mostrarRangoPersonalizadoClientes = false;
  this.datosClientes();
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

    const coincideEstado = this.filtroCompras.estado === '' ||
      (c.estado_valor !== undefined && c.estado_valor !== null && c.estado_valor.toString() === this.filtroCompras.estado);

    const coincideTipoCompra = this.filtroCompras.tipo_compra === '' ||
      (c.tipo_compra !== undefined && c.tipo_compra !== null && c.tipo_compra.toString() === this.filtroCompras.tipo_compra);

    const coincideUsuario = !this.filtroCompras.id_usuario ||
      (c.usuario?.id_usuario && c.usuario.id_usuario.toString() === this.filtroCompras.id_usuario);

    return coincideBusqueda && coincideFecha && coincideProveedor && coincideEstado && coincideTipoCompra && coincideUsuario;
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
  const compras_activas = compras.filter((c: any) => c.estado_valor === 1).length;

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

get usuariosFiltradosCompras(): any[] {
  const activos = this.apiUsuarios.filter((u: any) => u.estado === 1);
  if (!this.busquedaUsuarioCompras) return activos;
  const q = this.busquedaUsuarioCompras.toLowerCase();
  return activos.filter((u: any) => {
    const nombre = (u.empleado?.nombre || '').toLowerCase();
    const ap = (u.empleado?.ap_paterno || '').toLowerCase();
    const apM = (u.empleado?.ap_materno || '').toLowerCase();
    return nombre.includes(q) || ap.includes(q) || apM.includes(q) || (nombre + ' ' + ap).includes(q);
  });
}

seleccionarUsuarioCompras(u: any) {
  this.usuarioSeleccionadoCompras = u;
  this.filtroCompras.id_usuario = u.id_usuario.toString();
  this.busquedaUsuarioCompras = [u.empleado?.nombre, u.empleado?.ap_paterno, u.empleado?.ap_materno].filter(Boolean).join(' ');
  this.mostrarListaUsuariosCompras = false;
}

limpiarUsuarioCompras() {
  this.usuarioSeleccionadoCompras = null;
  this.filtroCompras.id_usuario = '';
  this.busquedaUsuarioCompras = '';
}

mostrarDropdownUsuariosCompras() {
  this.mostrarListaUsuariosCompras = true;
}

ocultarDropdownUsuariosCompras() {
  setTimeout(() => { this.mostrarListaUsuariosCompras = false; }, 200);
}

limpiarFiltrosCompras() {
  this.filtroCompras = {
    desde: '',
    hasta: '',
    id_proveedor: '',
    busqueda: '',
    estado: '',
    tipo_compra: '',
    id_usuario: ''
  };
  this.filtroFechaCompras = '';
  this.mostrarRangoPersonalizadoCompras = false;
  this.usuarioSeleccionadoCompras = null;
  this.busquedaUsuarioCompras = '';
  this.mostrarListaUsuariosCompras = false;
}

onFiltroFechaComprasChange(): void {
  const hoy = new Date();
  this.mostrarRangoPersonalizadoCompras = false;
  this.filtroCompras.desde = '';
  this.filtroCompras.hasta = '';
  switch (this.filtroFechaCompras) {
    case 'hoy': {
      const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      this.filtroCompras.desde = d.toISOString().split('T')[0];
      this.filtroCompras.hasta = d.toISOString().split('T')[0];
      break;
    }
    case 'ayer': {
      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1);
      this.filtroCompras.desde = ayer.toISOString().split('T')[0];
      this.filtroCompras.hasta = ayer.toISOString().split('T')[0];
      break;
    }
    case 'esta semana': {
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - hoy.getDay());
      this.filtroCompras.desde = inicio.toISOString().split('T')[0];
      this.filtroCompras.hasta = hoy.toISOString().split('T')[0];
      break;
    }
    case 'este mes': {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      this.filtroCompras.desde = inicioMes.toISOString().split('T')[0];
      this.filtroCompras.hasta = hoy.toISOString().split('T')[0];
      break;
    }
    case 'mes anterior': {
      const inicioMA = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const finMA = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      this.filtroCompras.desde = inicioMA.toISOString().split('T')[0];
      this.filtroCompras.hasta = finMA.toISOString().split('T')[0];
      break;
    }
    case 'rango personalizado': {
      this.mostrarRangoPersonalizadoCompras = true;
      return;
    }
    default: break;
  }
}

comprasExcel(): void {
  console.log('Exportar Excel de compras - pendiente de implementación en servicio');
}

onFiltroFechaVentasChange(event: any): void {
  const valor = event.target.value;
  if (valor === 'rango personalizado') {
    this.enFiltroPersonalizadoVentasR = true;
    this.fechaDesdeVentasR = '';
    this.fechaHastaVentasR = '';
  } else {
    this.enFiltroPersonalizadoVentasR = false;
    this.fechaDesdeVentasR = '';
    this.fechaHastaVentasR = '';
  }
}

ponerFechaVentasR(e: any, tipo: number): void {
  const fechaStr = e.target.value;
  if (!fechaStr) return;
  if (tipo === 1) {
    this.fechaDesdeVentasR = fechaStr;
  } else if (tipo === 2) {
    this.fechaHastaVentasR = fechaStr;
  }
}

get fechasFiltroVentas(): { desde: Date | null, hasta: Date | null } {
  const hoy = new Date();
  switch (this.filtroFechaVentas) {
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
        desde: this.fechaDesdeVentasR ? new Date(this.fechaDesdeVentasR + 'T00:00:00') : null,
        hasta: this.fechaHastaVentasR ? new Date(this.fechaHastaVentasR + 'T23:59:59') : null
      };
    default:
      return { desde: null, hasta: null };
  }
}

// Métodos para ventas
get clientesDisponiblesVentas(): any[] {
  if (!this.datosVentasReporte || !this.datosVentasReporte.ventas) {
    return [];
  }
  // Obtener clientes únicos de las ventas
  const clientesMap = new Map();
  this.datosVentasReporte.ventas.forEach((v: any) => {
    if (v.cliente && v.cliente.id_cliente) {
      clientesMap.set(v.cliente.id_cliente, v.cliente);
    }
  });
  return Array.from(clientesMap.values());
}

get clientesFiltradosVentas(): any[] {
  return this.clientesDisponiblesVentas.filter((c: any) => {
    if (!this.filtroVentas.busqueda) return true;
    const busqueda = this.filtroVentas.busqueda.toLowerCase();
    return (
      c.nombre_completo?.toLowerCase().includes(busqueda) ||
      c.ci_nit?.toString().includes(this.filtroVentas.busqueda)
    );
  });
}

get ventasFiltradas(): any[] {
  if (!this.datosVentasReporte || !this.datosVentasReporte.ventas) {
    return [];
  }

  return this.datosVentasReporte.ventas.filter((v: any) => {
    const coincideBusqueda = !this.filtroVentas.busqueda ||
      (v.cliente?.nombre_completo?.toLowerCase().includes(this.filtroVentas.busqueda.toLowerCase())) ||
      (v.nro_venta?.toLowerCase().includes(this.filtroVentas.busqueda.toLowerCase())) ||
      (v.cliente?.ci_nit?.toString().includes(this.filtroVentas.busqueda));

    // Filtro por fecha mediante selector
    let coincideFecha = true;
    if (this.filtroFechaVentas) {
      const fechasFiltro = this.fechasFiltroVentas;
      const fechaVentaStr = v.fecha_registro ? v.fecha_registro.split(' ')[0] : null;
      if (fechasFiltro.desde && fechaVentaStr) {
        const fechaDesdeStr = fechasFiltro.desde.toISOString().split('T')[0];
        coincideFecha = fechaVentaStr >= fechaDesdeStr;
      }
      if (fechasFiltro.hasta && fechaVentaStr && coincideFecha) {
        const fechaHastaStr = fechasFiltro.hasta.toISOString().split('T')[0];
        coincideFecha = fechaVentaStr <= fechaHastaStr;
      }
    }

    const coincideTipoVenta = this.filtroVentas.tipo_venta === '' ||
      v.tipo_venta === this.filtroVentas.tipo_venta;

    const coincideEstado = this.filtroVentas.estado === '' ||
      v.estado === this.filtroVentas.estado;

    const coincideTipoPago = this.filtroVentas.tipo_pago === '' ||
      v.tipo_pago === this.filtroVentas.tipo_pago;

    const coincideCliente = !this.filtroVentas.id_cliente ||
      (v.cliente?.id_cliente && v.cliente.id_cliente.toString() === this.filtroVentas.id_cliente);

    const coincideUsuario = !this.filtroVentas.id_usuario ||
      (v.usuario?.id_usuario && v.usuario.id_usuario.toString() === this.filtroVentas.id_usuario);

    return coincideBusqueda && coincideFecha && coincideTipoVenta && coincideEstado && coincideTipoPago && coincideCliente && coincideUsuario;
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
    busqueda: '',
    id_cliente: '',
    id_usuario: ''
  };
  this.filtroFechaVentas = '';
  this.fechaDesdeVentasR = '';
  this.fechaHastaVentasR = '';
  this.enFiltroPersonalizadoVentasR = false;
  this.clienteSeleccionadoVentas = null;
  this.mostrarListaClientesVentas = false;
  this.usuarioSeleccionadoVentas = null;
  this.busquedaUsuarioVentas = '';
  this.mostrarListaUsuariosVentas = false;
}

seleccionarClienteVentas(cliente: any) {
  this.clienteSeleccionadoVentas = cliente;
  this.filtroVentas.id_cliente = cliente.id_cliente.toString();
  this.filtroVentas.busqueda = cliente.nombre_completo;
  this.mostrarListaClientesVentas = false;
}

mostrarDropdownClientesVentas() {
  this.mostrarListaClientesVentas = true;
}

ocultarDropdownClientesVentas() {
  setTimeout(() => {
    this.mostrarListaClientesVentas = false;
  }, 200);
}

limpiarClienteVentas() {
  this.clienteSeleccionadoVentas = null;
  this.filtroVentas.id_cliente = '';
  this.filtroVentas.busqueda = '';
  this.mostrarListaClientesVentas = false;
}

get usuariosFiltradosVentas(): any[] {
  const activos = this.apiUsuarios.filter((u: any) => u.estado === 1);
  if (!this.busquedaUsuarioVentas) return activos;
  const q = this.busquedaUsuarioVentas.toLowerCase();
  return activos.filter((u: any) => {
    const nombre = (u.empleado?.nombre || '').toLowerCase();
    const ap = (u.empleado?.ap_paterno || '').toLowerCase();
    const apM = (u.empleado?.ap_materno || '').toLowerCase();
    return nombre.includes(q) || ap.includes(q) || apM.includes(q) || (nombre + ' ' + ap).includes(q);
  });
}

seleccionarUsuarioVentas(u: any) {
  this.usuarioSeleccionadoVentas = u;
  this.filtroVentas.id_usuario = u.id_usuario.toString();
  this.busquedaUsuarioVentas = [u.empleado?.nombre, u.empleado?.ap_paterno, u.empleado?.ap_materno].filter(Boolean).join(' ');
  this.mostrarListaUsuariosVentas = false;
}

limpiarUsuarioVentas() {
  this.usuarioSeleccionadoVentas = null;
  this.filtroVentas.id_usuario = '';
  this.busquedaUsuarioVentas = '';
}

mostrarDropdownUsuariosVentas() {
  this.mostrarListaUsuariosVentas = true;
}

ocultarDropdownUsuariosVentas() {
  setTimeout(() => { this.mostrarListaUsuariosVentas = false; }, 200);
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
  this.datosNegocio();
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
  const body = this.construirBodyClientes();
  const datosReporte = {
    filtros: {
      desde: body.desde || null,
      hasta: body.hasta || null,
      id_cliente: body.id_cliente || null,
      busqueda: this.filtroClientes.busqueda || null
    },
    resumenes: this.totalesFiltradosClientes,
    lista: this.clientesFiltrados
  };

  console.log('Datos enviados al PDF:', datosReporte);

  this.CliSer.getPDF(datosReporte).subscribe((pdfBlob) => {
    const blob = new Blob([pdfBlob], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  });
}

reporteClientesExcel(){
  const body = this.construirBodyClientes();
  const datosReporte = {
    filtros: {
      desde: body.desde || null,
      hasta: body.hasta || null,
      id_cliente: body.id_cliente || null,
      busqueda: this.filtroClientes.busqueda || null
    },
    resumenes: this.totalesFiltradosClientes,
    lista: this.clientesFiltrados
  };

  console.log('Datos enviados al Excel:', datosReporte);

  // Aquí deberías llamar al servicio para generar Excel
  // this.CliSer.getExcel(datosReporte).subscribe((excelBlob) => {
  //   const blob = new Blob([excelBlob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'reporte-clientes.xlsx';
  //   a.click();
  // });
}

 ventasPDF(resumido:boolean){
  const datosReporte = {
    filtros: {
      desde: this.filtroVentas.desde || null,
      hasta: this.filtroVentas.hasta || null,
      tipo_venta: this.filtroVentas.tipo_venta || null,
      estado: this.filtroVentas.estado || null,
      tipo_pago: this.filtroVentas.tipo_pago || null,
      id_cliente: this.filtroVentas.id_cliente || null,
      id_usuario: this.filtroVentas.id_usuario ? +this.filtroVentas.id_usuario : null,
      busqueda: this.filtroVentas.busqueda || null
    },
    lista: this.ventasFiltradas
  };
  console.log('Datos enviados al PDF de ventas:', datosReporte);
  this.VenSer.getPDF(datosReporte, resumido).subscribe((pdfBlob) => {
    const blob = new Blob([pdfBlob], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  });
}

ventasExcel() {
  const datosReporte = {
    filtros: {
      desde: this.filtroVentas.desde || null,
      hasta: this.filtroVentas.hasta || null,
      tipo_venta: this.filtroVentas.tipo_venta || null,
      estado: this.filtroVentas.estado || null,
      tipo_pago: this.filtroVentas.tipo_pago || null,
      id_cliente: this.filtroVentas.id_cliente || null,
      id_usuario: this.filtroVentas.id_usuario ? +this.filtroVentas.id_usuario : null,
      busqueda: this.filtroVentas.busqueda || null
    },
    lista: this.ventasFiltradas
  };
  console.log('Datos para Excel de ventas:', datosReporte);
  this.VenSer.getExcel(datosReporte).subscribe((excelBlob) => {
    const blob = new Blob([excelBlob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ventas-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
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
  const body: any = {};
  if (this.filtroCompras.desde)       body['desde']       = this.filtroCompras.desde;
  if (this.filtroCompras.hasta)       body['hasta']       = this.filtroCompras.hasta;
  if (this.filtroCompras.id_proveedor) body['id_proveedor'] = this.filtroCompras.id_proveedor;
  if (this.filtroCompras.busqueda)    body['busqueda']    = this.filtroCompras.busqueda;
  if (this.filtroCompras.estado)      body['estado']      = +this.filtroCompras.estado;
  if (this.filtroCompras.tipo_compra) body['tipo_compra'] = +this.filtroCompras.tipo_compra;
  if (this.filtroCompras.id_usuario)  body['id_usuario']  = +this.filtroCompras.id_usuario;
  this.ComSer.getPDF(body, resumido).subscribe((pdfBlob) => {
    const blob = new Blob([pdfBlob], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  });
}

// ========================
// TENDENCIA DE PRODUCTOS
// ========================

construirBodyTendencia(): any {
  const body: any = {};
  if (this.filtroTendencia.nombre_codigo) body['nombre_codigo'] = this.filtroTendencia.nombre_codigo;
  if (this.filtroTendencia.categoria) body['id_categoria'] = this.filtroTendencia.categoria;
  if (this.filtroTendencia.marca) body['id_marca'] = this.filtroTendencia.marca;
  if (this.filtroTendencia.desde) body['desde'] = this.filtroTendencia.desde;
  if (this.filtroTendencia.hasta) body['hasta'] = this.filtroTendencia.hasta;
  if (this.filtroTendencia.tipo_venta) body['tipo_venta'] = this.filtroTendencia.tipo_venta;
  return body;
}

onPeriodoTendenciaChange(): void {
  const hoy = new Date();
  this.mostrarRangoPersonalizadoTendencia = false;
  this.filtroTendencia.desde = '';
  this.filtroTendencia.hasta = '';

  switch (this.periodoTendencia) {
    case 'hoy': {
      const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      this.filtroTendencia.desde = d.toISOString().split('T')[0];
      this.filtroTendencia.hasta = d.toISOString().split('T')[0];
      break;
    }
    case 'ayer': {
      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1);
      this.filtroTendencia.desde = ayer.toISOString().split('T')[0];
      this.filtroTendencia.hasta = ayer.toISOString().split('T')[0];
      break;
    }
    case 'esta_semana': {
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - hoy.getDay());
      this.filtroTendencia.desde = inicio.toISOString().split('T')[0];
      this.filtroTendencia.hasta = hoy.toISOString().split('T')[0];
      break;
    }
    case 'semana_pasada': {
      const inicioSP = new Date(hoy);
      inicioSP.setDate(hoy.getDate() - hoy.getDay() - 7);
      const finSP = new Date(inicioSP);
      finSP.setDate(inicioSP.getDate() + 6);
      this.filtroTendencia.desde = inicioSP.toISOString().split('T')[0];
      this.filtroTendencia.hasta = finSP.toISOString().split('T')[0];
      break;
    }
    case 'este_mes': {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      this.filtroTendencia.desde = inicioMes.toISOString().split('T')[0];
      this.filtroTendencia.hasta = hoy.toISOString().split('T')[0];
      break;
    }
    case 'mes_anterior': {
      const inicioMA = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const finMA = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      this.filtroTendencia.desde = inicioMA.toISOString().split('T')[0];
      this.filtroTendencia.hasta = finMA.toISOString().split('T')[0];
      break;
    }
    case 'personalizado': {
      this.mostrarRangoPersonalizadoTendencia = true;
      return;
    }
    default: {
      break;
    }
  }
  this.datosTendencia();
}

datosTendencia(): void {
  const body = this.construirBodyTendencia();
  this.RepSer.tendenciaVentas(body).subscribe((data: any[]) => {
    this.datosTendenciaReporte = data || [];
    this.actualizarCategoriasYMarcasTendencia();
    this.actualizarChartTendencia();
  });
}

actualizarCategoriasYMarcasTendencia(): void {
  const catMap = new Map();
  const marcaMap = new Map();
  this.datosTendenciaReporte.forEach((item: any) => {
    const prod = item.producto;
    if (prod?.categorium && !catMap.has(prod.categorium.id_categoria)) {
      catMap.set(prod.categorium.id_categoria, prod.categorium);
    }
    if (prod?.marca && !marcaMap.has(prod.marca.id_marca)) {
      marcaMap.set(prod.marca.id_marca, prod.marca);
    }
  });
  this.categoriasParaTendencia = Array.from(catMap.values());
  this.marcasParaTendencia = Array.from(marcaMap.values());
}

actualizarChartTendencia(): void {
  const top5 = [...this.datosTendenciaReporte]
    .sort((a, b) => +b.total_vendido - +a.total_vendido)
    .slice(0, 5);

  if (top5.length === 0) {
    this.chartOptionTendencia = {} as EChartsOption;
    return;
  }

  const nombres = top5.map(item => item.producto?.nombre ?? 'Producto');
  const valores = top5.map(item => +item.total_vendido);
  const ingresos = top5.map(item => +(item.total_ingresos ?? 0));

  this.chartOptionTendencia = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const p0 = params[0];
        const p1 = params[1];
        return `<b>${p0.name}</b><br/>
          ${p0.marker} Unidades vendidas: <b>${p0.value}</b><br/>
          ${p1.marker} Ingresos: <b>Bs. ${p1.value.toFixed(2)}</b>`;
      }
    },
    legend: { data: ['Unidades vendidas', 'Ingresos (Bs.)'] },
    grid: { left: '3%', right: '5%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: nombres,
      axisLabel: {
        width: 120,
        overflow: 'truncate'
      }
    },
    series: [
      {
        name: 'Unidades vendidas',
        type: 'bar',
        data: valores,
        itemStyle: { color: '#667eea' },
        label: { show: true, position: 'right' }
      },
      {
        name: 'Ingresos (Bs.)',
        type: 'bar',
        data: ingresos,
        itemStyle: { color: '#43e97b' },
        label: { show: true, position: 'right', formatter: (p: any) => `Bs. ${(+p.value).toFixed(0)}` }
      }
    ]
  } as EChartsOption;
}

reporteTendenciaPDF(): void {
  const body = this.construirBodyTendencia();
  this.RepSer.tendenciaPDF(body).subscribe((pdfBlob: Blob) => {
    const blob = new Blob([pdfBlob], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  });
}
}
