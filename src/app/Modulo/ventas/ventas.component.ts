import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControlName, UntypedFormGroup, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Cliente } from '../../Modelos/cliente';
import { DetalleVenta } from '../../Modelos/detalle-venta';
import { Producto } from '../../Modelos/producto';
import { Usuario } from '../../Modelos/usuario';
import { Venta } from '../../Modelos/venta';
import { ClienteService } from '../../Servicios/cliente.service';
import { DetalleventaService } from '../../Servicios/detalleventa.service';
import { ProductoService } from '../../Servicios/producto.service';
import { UsuarioService } from '../../Servicios/usuario.service';
import { VentaService } from '../../Servicios/venta.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { CodigoPipe } from '../../Filtros/codigo.pipe';
import { NombrePipe } from '../../Filtros/nombre.pipe';
import { CategoriaPipe } from '../../Filtros/categoria.pipe';
import { CategoriaService } from '../../Servicios/categoria.service';
import { NroVentaPipe } from '../../Filtros/nro-venta.pipe';
import { ReportesVentaService } from '../../Servicios/reportes-venta.service';
import { EstadoPipe } from '../../Filtros/estado.pipe';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule,
    FormsModule, CodigoPipe, NombrePipe, NroVentaPipe, EstadoPipe],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit, AfterViewInit {

  @ViewChild('modalAgregar') modalAgregarRef!: ElementRef;
  @ViewChild('modalDetalle') modalDetalleRef!: ElementRef;
  @ViewChild('modalAnular') modalAnularRef!: ElementRef;

  private modalAgregar: any;
  private modalDetalle: any;
  private modalAnular: any;

  usu: Usuario = JSON.parse(localStorage.getItem('usuario'))
  apiVentas: any[] = []
  apiProductos: Producto[] = []
  apiClientes: any[] = []
  apiCategorias: any[] = []
  productosVender: any[] = []
  productosVentaCantidades: number[] = []

  codigo: string = ''
  nroventa:string=''
  estado='1'
    page:number=1
  ponerCodigo(e: any) {
    this.codigo = e.target.value.toUpperCase()
  }
  nombre: string = ''
  ponerNombre(e: any) {
    this.nombre = e.target.value
  }
  categoria = ''
  ponerCat(e: any) {
    this.categoria = e.target.value
  }
  constructor(
    private ventaSer: VentaService,
    private usuSer: UsuarioService,
    private proSer: ProductoService,
    private cliSer: ClienteService,
    private CatSer: CategoriaService,
    private detalleSer: DetalleventaService,
    private detalleVentaSer: DetalleventaService,
    private reportesSer: ReportesVentaService
  ) { }
  listarVentas() {
    this.ventaSer.getListaVentas().subscribe(data => {
      this.apiVentas = data
      console.log("lista de ventas", this.apiVentas);

    }
    )
  }
  ngOnInit(): void {
    this.listarVentas()
    this.cliSer.getListaClientes().subscribe(data => {
      this.apiClientes = data
      console.log("clientes-----------",this.apiClientes);

    })
    this.CatSer.getListaCategoria().subscribe((lista) => {
      this.apiCategorias = lista
    })
    this.proSer.getListaProductos().subscribe(data => {
      this.apiProductos = data
    }
    )
    this.usuSer.getListaUsuario().subscribe(lista => {
      console.log(this.usu);
      this.ventaForm.patchValue({
        vendedor: this.usu.persona?.nombre + " " + this.usu.persona?.ap_paterno + " " + this.usu.persona?.ap_materno
      })
    })
    this.ventaForm.get('nro_venta')?.disable()
    this.ventaForm.get('vendedor')?.disable()

    // para controlar los datos de cliente
    this.ventaForm.get('documento').disable()
    this.ventaForm.get('ci_nit').disable()
    this.ventaForm.get('nombre_cliente').disable()
    this.ventaForm.get('fecha').disable()
  }

  ngAfterViewInit(): void {
    // Importar Modal de Bootstrap dinámicamente
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      const Modal = (window as any).bootstrap.Modal;
      this.modalAgregar = new Modal(this.modalAgregarRef.nativeElement, {
        backdrop: 'static',
        keyboard: false
      });
      this.modalDetalle = new Modal(this.modalDetalleRef.nativeElement, {
        backdrop: 'static',
        keyboard: false
      });
      this.modalAnular = new Modal(this.modalAnularRef.nativeElement, {
        backdrop: 'static',
        keyboard: false
      });
    }
  }

  abrirModalAgregar(): void {
    if (this.modalAgregar) {
      this.modalAgregar.show();
    }
  }

  cerrarModalAgregar(): void {
    if (this.modalAgregar) {
      this.modalAgregar.hide();
      this.limpiarBackdrop();
    }
  }

  abrirModalDetalle(): void {
    if (this.modalDetalle) {
      this.modalDetalle.show();
    }
  }

  cerrarModalDetalle(): void {
    if (this.modalDetalle) {
      this.modalDetalle.hide();
      this.limpiarBackdrop();
    }
  }

  abrirModalAnular(): void {
    if (this.modalAnular) {
      this.modalAnular.show();
    }
  }

  cerrarModalAnular(): void {
    if (this.modalAnular) {
      this.modalAnular.hide();
      this.limpiarBackdrop();
    }
  }

  limpiarBackdrop(): void {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
  }
  ventaForm = new UntypedFormGroup({
    //para la venta
    //nroVenta: new FormControl(this.apiVentas.length + 1),
    nro_venta: new FormControl('V00'),
    fecha: new FormControl(this.obtenerFechaActual()),
    id_usuario: new FormControl(''),
    tipo_venta: new FormControl('1'),//fisico o pedido
    tipov: new FormControl('2'),//si o no factura
    tipo_pago: new FormControl('1'),
    // pa los detalles
    documento: new FormControl(''),
    ci_nit: new FormControl(''),
    nombre_cliente: new FormControl(''),
    cliente: new FormControl([1]),
    //pa control de ultimo
    descuento: new FormControl(''),
    total: new FormControl('0')
  })

  nuevaVenta(): void {
    this.ventaForm.reset({
      nro_venta: 'V00',
      fecha: this.obtenerFechaActual(),
      tipo_venta: '1',
      tipov: '2',
      tipo_pago: '1',
      descuento: '',
      total: '0'
    });
    this.ventaForm.patchValue({
      vendedor: this.usu.persona?.nombre + " " + this.usu.persona?.ap_paterno + " " + this.usu.persona?.ap_materno
    });
    this.productosVender = [];
    this.productosVentaCantidades = [];
    this.total = 0;
    this.tipo = 2;
    this.abrirModalAgregar();
  }

  agregarVenta() {
    const venta: any = {
      tipo_venta: this.ventaForm.get('tipo_venta')?.value,
      tipo_pago: Number(this.ventaForm.get('tipo_pago')?.value),
      fecha_registro: this.ventaForm.get('fecha')?.value,
      confactura: Number(this.tipo),
      monto_total: this.total,
      estado: 1,
      nro_venta: this.ventaForm.get('nro_venta')?.value,
      descuento: Number(this.ventaForm.get('descuento')?.value),
      id_usuario: this.usu.id_usuario,
      id_cliente: 8,//cliente temporal generico luego cambiar si se elige por el dinamico
    }
    venta.detallesVenta = []
    for (let i = 0; i < this.productosVender.length; i++) {
      const detalle = {
        cantidad: this.productosVentaCantidades[i],
        sub_total: this.productosVentaCantidades[i] * this.productosVender[i].precio_venta,
        precio_unitario: this.productosVender[i].precio_venta,
        id_venta: 0,
        id_producto: this.productosVender[i].id_producto
      }
      venta.detallesVenta.push(detalle)
    }
    console.log('DETALLES DE VENTA------', venta);

    this.ventaSer.saveVenta(venta).subscribe(data => {//data es la venta creada que volvio ya con id_venta
      this.listarVentas();
      this.cerrarModalAgregar();
    })
  }
  agregarProducto(pro: Producto) {
    if (this.productosVender.includes(pro)) {
      const index = this.productosVender.indexOf(pro)
      this.productosVentaCantidades[index] += 1
    }
    else {
      this.productosVender.push(pro)
      this.agregarCantidad(1)
    }
    this.calcularTotal()
  }
  generarPdf(){
    this.reportesSer.getReporteVenta(this.DetVenta.id_venta).subscribe((pdfBlob) => {
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        // Abre en una nueva pestaña
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      })
  }
  Cancelar(){
    this.ventaForm.reset();
    this.cerrarModalAgregar();
  }

  ventaParaAnular: any;

  anularVenta(venta: any){
    this.ventaParaAnular = venta;
    this.abrirModalAnular();
  }

  confirmarAnular(){
    console.log('confirmando anulacion');
    this.ventaSer.anular(this.ventaParaAnular.id_venta).subscribe((data)=>{
      console.log('Respuesta despues de anular: ',data);
      this.listarVentas();
      this.cerrarModalAnular();
    })
  }
  agregarCantidad(cantidad: number) {
    this.productosVentaCantidades.push(cantidad)
    this.calcularTotal()
  }
  nuevaCantidad(i: number, event: any) {
    const valor = Number(event.target.value);
  if (valor < 1) {
    event.target.value = 1;
    this.productosVentaCantidades[i] = 1;
  } else {
    this.productosVentaCantidades[i] = valor;
     this.calcularTotal()
  }

    //console.log("agregando cantidad ", Number(event.target.value));
    //this.productosVentaCantidades[i] = Number(event.target.value)
   // this.calcularTotal()
  }
  bloquearTeclasInvalidas(event: KeyboardEvent) {
  const teclasBloqueadas = ['-', 'e', 'E', '+', '.', '0'];
  if (teclasBloqueadas.includes(event.key)) {
    event.preventDefault();
  }
}

  total: number = 0
  calcularTotal() {
    let sumaSubTotales = 0
    for (let i = 0; i < this.productosVentaCantidades.length; i++) {
      sumaSubTotales = sumaSubTotales + Number(this.productosVentaCantidades[i]) * Number(this.productosVender[i].precio_venta)
    }
    this.total = sumaSubTotales
  }
  descontar(e: any) {
    this.calcularTotal()
    if (e.target.value != null && !isNaN(e.target.value)) {
      this.ventaForm.patchValue({
        total: this.total - e.target.value
      })
    }
    else this.calcularTotal()
  }
  quitarProducto(i: number) {
    this.productosVender.splice(i, 1)//i= opsicion 1 es la cantidad de borrado desde la posision
    this.productosVentaCantidades.splice(i, 1)
    this.calcularTotal()
  }
  tipo: number = 2
  observarFactura(n: number) {
    const tipo: number = n
    this.tipo = n
    if (tipo == 2) {
      this.ventaForm.get('documento').disable()
      this.ventaForm.get('ci_nit').disable()
      this.ventaForm.get('nombre_cliente').disable()
    } else {
      this.ventaForm.get('documento').enable()
      this.ventaForm.get('ci_nit').enable()
      this.ventaForm.get('nombre_cliente').enable()
    }
  }
  obtenerFechaActual(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0'); // meses empiezan en 0
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // DETALLE-------------------------------------------
  DetVenta: any;
  detallesVenta: any[] = [];

  detalle(venta: any) {
    this.DetVenta = venta;
    this.detallesVenta = venta.det_venta;
    this.abrirModalDetalle();
  }
}
// this.ventaForm.patchValue({ es para dar valores cuando se requiera
//   fecha:new Date()
// })
