import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Categoria } from '../../Modelos/categoria';
import { DetallePedido } from '../../Modelos/detalle-pedido';
import { DetalleVenta } from '../../Modelos/detalle-venta';
import { Devoluciones } from '../../Modelos/devoluciones';
import { Pedido } from '../../Modelos/pedido';
import { Producto } from '../../Modelos/producto';
import { Proveedor } from '../../Modelos/proveedor';
import { RecepcionCompra } from '../../Modelos/recepcion-compra';
import { Usuario } from '../../Modelos/usuario';
import { Venta } from '../../Modelos/venta';
import { DetallepedidoService } from '../../Servicios/detallepedido.service';
import { DetalleventaService } from '../../Servicios/detalleventa.service';
import { InventarioService } from '../../Servicios/inventario.service';
import { PedidoService } from '../../Servicios/pedido.service';
import { ProductoService } from '../../Servicios/producto.service';
import { ProveedorService } from '../../Servicios/proveedor.service';
import { VentaService } from '../../Servicios/venta.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario',
  standalone:true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {

  apiProductos: any[] = []
  apiPedidos: Pedido[] = []
  apiProveedores: Proveedor[] = []
  apiCategorias: Categoria[] = []
  apiVentas: Venta[] = []
  constructor(
    private ProSer: ProductoService,
    private PedSer: PedidoService,
    private DetCSer: DetallepedidoService,
    private InvSer: InventarioService,
    private ProveSer: ProveedorService,
    private VenSer: VentaService,
    private DetVSer: DetalleventaService
  ) {

  }
  rol:number
  obtenerUsuario(){
    const usuario:Usuario=JSON.parse(localStorage.getItem('usuario'))
    this.rol=usuario.persona.tipo
  }
  ngOnInit(): void {
   // this.obtenerUsuario()
    this.ListarProductos()
    this.ListarPedidos()
    this.ListarVentas()
    this.recepForm.get('fecha_registro').disable()

    this.productoForm.get('nombre').disable()
    this.productoForm.get('fecha_registro').disable()
    this.productoForm.get('cantidad').disable()
    this.productoForm.get('defectuosos').disable()
    this.productoForm.get('proveedor').disable()
    this.productoForm.get('precio_compra').disable()

    this.devoForm.get('usuario').disable()
    this.devoForm.get('fecha_registro').disable()
  }
  ListarProveedores() {
    this.ProveSer.getListaProveedor().subscribe((lista) => {
      this.apiProveedores = lista
    })
  }
  ListarProductos() {
    this.ProSer.getListaProductos().subscribe(data => {
      this.apiProductos = data
      console.log("productos",data);

    })
  }
  ListarPedidos() {
    this.PedSer.getListaPedidos().subscribe(data => {
      this.apiPedidos = data
    })
  }
  ListarVentas() {
    this.VenSer.getListaVentas().subscribe(data => {
      this.apiVentas = data
      console.log("ventas" + this.apiVentas);

    })
  }
  usuario: any = JSON.parse(localStorage.getItem('usuario'))
  // devoluciones
  devoForm = new UntypedFormGroup({
    fecha_registro: new UntypedFormControl(this.obtenerFechaActual()),
    usuario: new UntypedFormControl(this.usuario.empleado.nombre + " " + this.usuario.empleado.ap_paterno+' '+this.usuario.empleado.ap_materno),
    Cantidad: new UntypedFormControl(''),
    Reembolso: new UntypedFormControl(''),
    Observacion: new UntypedFormControl(''),
    detalle_venta: new UntypedFormControl('')
  })
  get controlrecep() {
    return this.devoForm.controls
  }
  mostrarventas: boolean = false
  MostrarVentas() {
    this.mostrarventas = !this.mostrarventas
  }
  mostrarDV: boolean = false
  DetVenta: Venta
  apiDetalleVenta: DetalleVenta[] = []
  apiDetalleVentaOriginal: DetalleVenta[] = []
  Seleccionar(ven: Venta, i: number) {
    this.DetVenta = ven
    this.mostrarDV = !this.mostrarDV
    this.DetVSer.detalles(ven.id_venta).subscribe(lista => {
      this.apiDetalleVenta = lista
      this.apiDetalleVentaOriginal = lista
    })
    this.ResaltarVenta(i)
  }
  resaltarVenta: number
  ResaltarVenta(index: number) {
    this.resaltarVenta = index
  }
  anular: boolean = false
  Anular(i: number) {
    this.anular = true
    this.resaltarVenta = i
  }
  AnularVentaAceptar() {
    this.resaltarFila = null
  }
  CancelaAnularVenta() {
    this.anular = false
    this.resaltarVenta = null
  }

  nuevaCantidad(event: any, i: number) {
    const nuevaCantidad: number = event.target.value
    const devueltos: number = this.apiDetalleVenta[i].cantidad - nuevaCantidad
    this.apiDetalleVenta[i].cantidad = nuevaCantidad
    this.apiDetalleVenta[i].subtotal = this.apiDetalleVenta[i].precio_venta * nuevaCantidad
  }
  totalGeneral: number = 0
  totalAhora(): number {
    let total: number = 0
    this.apiDetalleVenta.forEach(detalle => {
      total += detalle.subtotal
    })
    this.totalGeneral = total
    return total
  }
  crearDevolucion(i: number) {
    const devueltos = this.apiDetalleVentaOriginal[i].cantidad - this.apiDetalleVenta[i].cantidad
    console.log(this.apiDetalleVentaOriginal[i].cantidad + " - " + this.apiDetalleVenta[i].cantidad + " :" + devueltos);

  }
  // Recepcion de pedidos
  recepForm = new UntypedFormGroup({
    cantidad_recibida: new UntypedFormControl(''),
    fecha_registro: new UntypedFormControl(this.obtenerFechaActual()),
    defectuosos: new UntypedFormControl(''),
    detalle_pedido: new UntypedFormControl()
  })
  get control() {
    return this.recepForm.controls
  }
  // Productos
  productoForm = new UntypedFormGroup({
    nombre: new UntypedFormControl('', [Validators.required]),
    codigo: new UntypedFormControl('', [Validators.required]),
    descripcion: new UntypedFormControl('', [Validators.required]),
    estado: new UntypedFormControl('1', Validators.required),
    precio_compra: new UntypedFormControl('', [Validators.required]),
    precio_venta: new UntypedFormControl('', [Validators.required]),
    foto: new UntypedFormControl('', [Validators.required]),
    cantidad: new UntypedFormControl('', [Validators.required]),
    defectuosos: new UntypedFormControl('', [Validators.required]),
    fecha_registro: new UntypedFormControl(this.obtenerFechaActual()),
    stock_minimo: new UntypedFormControl('', []),
    categoria: new UntypedFormControl('', [Validators.required]),
    proveedor: new UntypedFormControl('', [Validators.required])
  })
  get controles() {
    return this.productoForm.controls
  }
  AgregarProducto() {
    const Producto: Producto = {
      nombre: (this.productoForm.get('nombre')?.value),
      codigo: (this.productoForm.get('codigo')?.value),
      descripcion: (this.productoForm.get('descripcion')?.value),
      estado: (this.productoForm.get('estado')?.value),
      precio_compra: (this.productoForm.get('precio_compra')?.value),
      precio_venta: (this.productoForm.get('precio_venta')?.value),
      foto: null,
      cantidad: (this.productoForm.get('cantidad')?.value),
      defectuosos: (this.productoForm.get('defectuosos')?.value),
      fecha_registro: (this.productoForm.get('fecha_registro')?.value),
      stock_minimo: (this.productoForm.get('stock_minimo')?.value),
      categoria: (this.productoForm.get('categoria')?.value),
      proveedor: (this.productoForm.get('proveedor')?.value),
    }
  }
  AgregarRecepcion() {
    const Recepcion: RecepcionCompra = {
      cantidad_recibida: this.recepForm.get('cantidad_recibida')?.value,
      fecha_registro: this.recepForm.get('fecha_registro')?.value,
      defectuosos: this.recepForm.get('defectuosos')?.value,
      detalle_pedido: this.recepForm.get('detalle_pedido')?.value
    }
    // this.InvSer.saveRecepcionCompra(Recepcion).subscribe(() => {
    //   console.log("ggggg", Recepcion);
    // })
  }
  mostrar: boolean = false
  pedido: Pedido
  ApiDetallesPedido: DetallePedido[] = []
  seleccionarFila(i: number, ped: Pedido) {
    this.VerificarPedido(ped)
    this.resaltarFila(i)
  }
  VerificarPedido(ped: Pedido) {
    this.pedido = ped
    this.mostrar = !this.mostrar;
    this.DetCSer.detalles(ped.nroorden).subscribe(lista => {
      this.ApiDetallesPedido = lista
    })
  }
  filaResaltada: number | null = null;
  resaltarFila(index: number) {
    this.filaResaltada = index;
    console.log('Fila resaltada:', index);
  }
  Cancelar() {
    this.mostrar = false;
    this.filaResaltada = null
  }
  CancelarP() {
    this.mostrarSegundo = false
  }
  obtenerFechaActual(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0]; // Formato yyyy-MM-dd
  }
  mostrarSegundo: boolean = false
  detProducto: DetallePedido
  MostrarProducto(det: DetallePedido) {
    this.detProducto = det
    this.mostrarSegundo = !this.mostrarSegundo;
    this.productoForm.patchValue({
      nombre: this.detProducto.producto,
      cantidad: this.recepForm.get('cantidad_recibida')?.value,
      defectuosos: this.recepForm.get('defectuosos')?.value,
      proveedor: this.pedido.proveedor.nombre_empresarial,
      precio_compra: this.detProducto.precio_unitario,

    })
  }
  botonhabi: number = -1
  permitido(index: number) {
    console.log("datos de cantidad: ", this.recepForm.get('cantidad_recibida')?.value);

    if (this.recepForm.get('cantidad_recibida')?.value == null) this.botonhabi = -1
    else this.botonhabi = index
  }

}
// VerificarPedido(ped: Pedido) {
//   this.pedido = ped
//   this.mostrar = !this.mostrar;
//   this.DetCSer.detalles(ped.nroorden).subscribe(lista => {
//     this.ApiDetallesPedido = lista
// console.log("lista del apidetalles ",this.ApiDetallesPedido);
// if (this.ApiDetallesPedido && this.ApiDetallesPedido.length > 0) {
//   this.recepForm.patchValue({
//     detalle_pedido: this.ApiDetallesPedido[0] ,// Selecciona el primero o ajusta según lógica
//   });
//   console.log("paso",this.ApiDetallesPedido)
// }
//   })
// }
