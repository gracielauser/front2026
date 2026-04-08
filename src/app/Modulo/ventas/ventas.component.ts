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
import { CategoriaService } from '../../Servicios/categoria.service';
import { NroVentaPipe } from '../../Filtros/nro-venta.pipe';
import { ReportesVentaService } from '../../Servicios/reportes-venta.service';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { ClienteVentaPipe } from '../../Filtros/cliente-venta.pipe';
import { FechasPipe } from '../../Filtros/fechas.pipe';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule,
    FormsModule, NroVentaPipe, EstadoPipe, ClienteVentaPipe, FechasPipe],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit, AfterViewInit {

  @ViewChild('modalDetalle') modalDetalleRef!: ElementRef;
  @ViewChild('modalAnular') modalAnularRef!: ElementRef;

  private modalDetalle: any;
  private modalAnular: any;

  usu: any = JSON.parse(localStorage.getItem('usuario'))
  apiVentas: any[] = []
  apiProductos: Producto[] = []
  apiClientes: any[] = []
  apiCategorias: any[] = []

  codigo: string = ''
  nroventa:string=''
  estado=''
  nombreCliente: string = ''
  fechaDesde: string = ''
  fechaHasta: string = ''
  filtroFecha: string = ''
  enFiltroPersonalizado: boolean = false
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

  obtenerFechaActual(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatFechaRegistro(fecha: string | null | undefined): string {
    if (!fecha) {
      return '';
    }
    const [datePart, timePart] = fecha.split(' ');
    if (!datePart) {
      return fecha;
    }
    const [year, month, day] = datePart.split('-').map(val => parseInt(val, 10));
    if (!year || !month || !day) {
      return fecha;
    }
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const fechaFormateada = `${day} ${meses[month - 1]} ${year}`;
    return timePart ? `${fechaFormateada}, ${timePart}` : fechaFormateada;
  }

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
       // vendedor: this.usu.persona?.nombre + " " + this.usu.persona?.ap_paterno + " " + this.usu.persona?.ap_materno
      })
    })

    this.ventaForm.get('fecha')?.disable()

    // Escuchar mensajes de la ventana de nueva venta
    window.addEventListener('message', (event) => {
      if (event.data.type === 'VENTA_GUARDADA') {
        this.listarVentas();
      }
    });
  }

  ngAfterViewInit(): void {
    // Importar Modal de Bootstrap dinámicamente
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      const Modal = (window as any).bootstrap.Modal;
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
    // Abrir en nueva pestaña
    window.open('/nueva-venta', '_blank');
  }

  generarPdf(nota: boolean){
    this.ventaSer.notaVenta(this.DetVenta.id_venta,nota).subscribe((pdfBlob) => {
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        // Abre en una nueva pestaña
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      })
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

  // DETALLE-------------------------------------------
  DetVenta: any;
  detallesVenta: any[] = [];

  detalle(venta: any) {
    this.DetVenta = venta;
    this.detallesVenta = venta.det_venta;
    this.abrirModalDetalle();
  }

  onFiltroFechaChange(event: any): void {
    const valor = event.target.value;
    if (valor === 'rango personalizado') {
      this.enFiltroPersonalizado = true;
      this.fechaDesde = '';
      this.fechaHasta = '';
    } else {
      this.enFiltroPersonalizado = false;
      this.fechaDesde = '';
      this.fechaHasta = '';
    }
  }

  ponerFechaVenta(e: any, tipo: number): void {
    const fechaStr = e.target.value; // formato: YYYY-MM-DD
    if (!fechaStr) return;

    const partes = fechaStr.split('-').map(Number);
    const year = partes[0];
    const month = partes[1];
    const day = partes[2];

    // Crear fecha en timezone local (Bolivia GMT-4)
    const fecha = new Date(year, month - 1, day, 0, 0, 0);

    if (tipo === 1) {
      this.fechaDesde = fecha.toISOString().split('T')[0];
    } else if (tipo === 2) {
      this.fechaHasta = fecha.toISOString().split('T')[0];
    }
  }
}
