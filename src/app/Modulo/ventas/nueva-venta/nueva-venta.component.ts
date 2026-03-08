import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../Modelos/cliente';
import { Producto } from '../../../Modelos/producto';
import { Usuario } from '../../../Modelos/usuario';
import { ClienteService } from '../../../Servicios/cliente.service';
import { ProductoService } from '../../../Servicios/producto.service';
import { VentaService } from '../../../Servicios/venta.service';
import { CategoriaService } from '../../../Servicios/categoria.service';
import { ProductoGeneralPipe } from '../../../Filtros/producto-general.pipe';

@Component({
  selector: 'app-nueva-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ProductoGeneralPipe],
  templateUrl: './nueva-venta.component.html',
  styleUrls: ['./nueva-venta.component.css']
})
export class NuevaVentaComponent implements OnInit {

  usu: Usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  apiProductos: Producto[] = [];
  apiClientes: any[] = [];
  apiCategorias: any[] = [];
  apiSubcategorias: any[] = [];
  productosVender: any[] = [];
  productosVentaCantidades: number[] = [];
  busqueda: string = '';
  categoriaSeleccionada: any = '';
  subcategoriaSeleccionada: string = '';
  total: number = 0;
  tipo: number = 2;
  clienteSeleccionado: any = '';
  busquedaCliente: string = '';

  ventaForm = new UntypedFormGroup({
    tipov: new FormControl('2'),
    documento: new FormControl(''),
    ci_nit: new FormControl(''),
    nombre_cliente: new FormControl(''),
    descuento: new FormControl(''),
    id_cliente: new FormControl(''),
    descripcion: new FormControl('')
  });

  constructor(
    private ventaSer: VentaService,
    private proSer: ProductoService,
    private cliSer: ClienteService,
    private CatSer: CategoriaService
  ) { }

  ngOnInit(): void {
    this.cliSer.getListaClientes().subscribe(data => {
      this.apiClientes = data;
    });

    this.CatSer.getListaCategoria().subscribe((lista) => {
      this.apiCategorias = lista.filter((cat: any) => !cat.id_categoria_padre);
    });

    this.proSer.getListaProductos().subscribe(data => {
      this.apiProductos = data;
      console.log('productos: ', data);
    });

    this.ventaForm.get('documento')?.disable();
    this.ventaForm.get('ci_nit')?.disable();
    this.ventaForm.get('nombre_cliente')?.disable();
    this.ventaForm.get('id_cliente')?.disable();
  }

  refrescarProductos() {
    this.proSer.getListaProductos().subscribe(data => {
      this.apiProductos = data;
      console.log('Productos refrescados:', data);
    });
  }

  onCategoriaChange(event: any) {
    const idCategoria = event.target.value;
    this.subcategoriaSeleccionada = '';

    if (idCategoria) {
      const categoria = this.apiCategorias.find(cat => cat.id_categoria == idCategoria);
      if (categoria && categoria.subCategoria) {
        this.apiSubcategorias = categoria.subCategoria;
      } else {
        this.apiSubcategorias = [];
      }
      this.categoriaSeleccionada = idCategoria;
    } else {
      this.apiSubcategorias = [];
      this.categoriaSeleccionada = '';
    }
  }

  get productosFiltrados(): any[] {
    let productos = this.apiProductos;

    if (this.categoriaSeleccionada) {
      if (this.subcategoriaSeleccionada) {
        productos = productos.filter(p => p.id_categoria == Number(this.subcategoriaSeleccionada));
      } else {
        const subcategoriaIds = this.apiSubcategorias.map((sub: any) => sub.id_categoria);
        productos = productos.filter(p =>
          p.id_categoria == Number(this.categoriaSeleccionada) || subcategoriaIds.includes(p.id_categoria)
        );
      }
    }

    return productos;
  }

  agregarVenta(tipoPago: number) {
    const idCliente = this.tipo === 1 ? (this.ventaForm.get('id_cliente')?.value || 8) : 8;
    const tipoVenta = this.tipo === 1 ? 2 : 1; // 1 = normal (sin factura), 2 = facturado (con factura)
    const montoTotal = this.total;
    const descuento = Number(this.ventaForm.get('descuento')?.value) || 0;

    const venta: any = {
      id_venta: null,
      fecha_registro: this.obtenerFechaActualConHora(),
      monto_total: montoTotal,
      tipo_pago: tipoPago, // 1 = efectivo, 2 = QR
      tipo_venta: tipoVenta, // 1 = normal, 2 = facturado
      descripcion: this.ventaForm.get('descripcion')?.value || `Venta ${tipoPago === 1 ? 'en Efectivo' : 'por QR'}`,
      estado: 1, // 1 = válida, 2 = anulada
      descuento: descuento,
      id_usuario: this.usu.id_usuario,
      id_cliente: idCliente,
      nro_venta: 'V00'
    };

    venta.detallesVenta = [];
    for (let i = 0; i < this.productosVender.length; i++) {
      const detalle = {
        cantidad: this.productosVentaCantidades[i],
        sub_total: this.productosVentaCantidades[i] * this.productosVender[i].precio_venta,
        precio_unitario: this.productosVender[i].precio_venta,
        id_venta: 0,
        id_producto: this.productosVender[i].id_producto
      };
      venta.detallesVenta.push(detalle);
    }

    this.ventaSer.saveVenta(venta).subscribe( {
      next: (data) => {
      console.log('Venta guardada exitosamente:', data);
      this.ventaSer.notaVenta(Number(data.id_venta)).subscribe((pdfBlob) => {
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });

      // Abre en una nueva pestaña
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
      this.restaurarEstado();
    }, error: (error) => {
      console.error('Error al guardar venta:', error);
      alert('Error al guardar la venta. Por favor intente nuevamente.');
    }}
  );
  }

  agregarProducto(pro: Producto) {
    if (this.productosVender.includes(pro)) {
      const index = this.productosVender.indexOf(pro);
      this.productosVentaCantidades[index] += 1;
    } else {
      this.productosVender.push(pro);
      this.agregarCantidad(1);
    }
    this.calcularTotal();
  }

  Cancelar() {
    if (this.productosVender.length > 0 || this.ventaForm.get('descuento')?.value) {
      if (confirm('¿Está seguro de cancelar? Se perderán todos los datos ingresados.')) {
        this.restaurarEstado();
      }
    } else {
      this.restaurarEstado();
    }
  }

  restaurarEstado() {
    // Limpiar arrays
    this.productosVender = [];
    this.productosVentaCantidades = [];

    // Resetear variables
    this.busqueda = '';
    this.categoriaSeleccionada = '';
    this.subcategoriaSeleccionada = '';
    this.total = 0;
    this.tipo = 2;
    this.clienteSeleccionado = '';
    this.busquedaCliente = '';
    this.apiSubcategorias = [];

    // Resetear formulario
    this.ventaForm.reset({
      tipov: '2',
      documento: '',
      ci_nit: '',
      nombre_cliente: '',
      descuento: '',
      id_cliente: '',
      descripcion: ''
    });

    // Deshabilitar campos de cliente
    this.ventaForm.get('documento')?.disable();
    this.ventaForm.get('ci_nit')?.disable();
    this.ventaForm.get('nombre_cliente')?.disable();
    this.ventaForm.get('id_cliente')?.disable();
  }

  agregarCantidad(cantidad: number) {
    this.productosVentaCantidades.push(cantidad);
    this.calcularTotal();
  }

  nuevaCantidad(i: number, event: any) {
    const valor = Number(event.target.value);
    if (valor < 1) {
      event.target.value = 1;
      this.productosVentaCantidades[i] = 1;
    } else {
      this.productosVentaCantidades[i] = valor;
    }
    this.calcularTotal();
  }

  bloquearTeclasInvalidas(event: KeyboardEvent) {
    const teclasBloqueadas = ['-', 'e', 'E', '+', '.', '0'];
    if (teclasBloqueadas.includes(event.key)) {
      event.preventDefault();
    }
  }

  calcularTotal() {
    let sumaSubTotales = 0;
    for (let i = 0; i < this.productosVentaCantidades.length; i++) {
      sumaSubTotales = sumaSubTotales + Number(this.productosVentaCantidades[i]) * Number(this.productosVender[i].precio_venta);
    }
    this.total = sumaSubTotales;
  }

  descontar(e: any) {
    this.calcularTotal();
    if (e.target.value != null && !isNaN(e.target.value)) {
      this.ventaForm.patchValue({
        total: this.total - e.target.value
      });
    } else {
      this.calcularTotal();
    }
  }

  quitarProducto(i: number) {
    this.productosVender.splice(i, 1);
    this.productosVentaCantidades.splice(i, 1);
    this.calcularTotal();
  }

  observarFactura(n: number) {
    const tipo: number = n;
    this.tipo = n;
    if (tipo == 2) {
      this.ventaForm.get('documento')?.disable();
      this.ventaForm.get('ci_nit')?.disable();
      this.ventaForm.get('nombre_cliente')?.disable();
      this.ventaForm.get('id_cliente')?.disable();
      this.clienteSeleccionado = '';
    } else {
      this.ventaForm.get('documento')?.enable();
      this.ventaForm.get('ci_nit')?.enable();
      this.ventaForm.get('nombre_cliente')?.enable();
      this.ventaForm.get('id_cliente')?.enable();
    }
  }

  onClienteChange(event: any) {
    const idCliente = event.target.value;
    if (idCliente) {
      const cliente = this.apiClientes.find(c => c.id_cliente == idCliente);
      if (cliente && cliente.persona) {
        this.ventaForm.patchValue({
          ci_nit: cliente.persona.ci,
          nombre_cliente: `${cliente.persona.nombre} ${cliente.persona.apellido_paterno}`
        });
      }
    } else {
      this.ventaForm.patchValue({
        ci_nit: '',
        nombre_cliente: ''
      });
    }
  }

  get clientesFiltrados() {
    if (!this.busquedaCliente) return this.apiClientes;
    const termino = this.busquedaCliente.toLowerCase();
    return this.apiClientes.filter(c =>
      c.persona?.nombre?.toLowerCase().includes(termino) ||
      c.persona?.apellido_paterno?.toLowerCase().includes(termino) ||
      c.persona?.ci?.toLowerCase().includes(termino)
    );
  }

  obtenerFechaActual(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  obtenerFechaActualConHora(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    const hours = String(hoy.getHours()).padStart(2, '0');
    const minutes = String(hoy.getMinutes()).padStart(2, '0');
    const seconds = String(hoy.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
