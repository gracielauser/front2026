import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
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
  clienteSeleccionado: any = null;
  busquedaCliente: string = '';
  mostrarDropdownCliente: boolean = false;
  clientesFiltradosList: any[] = [];

  // Propiedades para modal de clientes
  isEditModeCliente: boolean = false;
  isViewModeCliente: boolean = false;
  modalTitleCliente: string = 'Adicionar Cliente';
  idClienteEditar: number = 0;
  mensajeExito: string = '';
  exito: boolean = false;
  ciudades: string[] = ['Tarija', 'La Paz', 'Pando', 'Cochabamba', 'Chuquisaca', 'Santa Cruz', 'Potosi', 'Beni', 'Oruro'];

  clienteForm = new UntypedFormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]),
    ap_paterno: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]),
    ap_materno: new FormControl('', [Validators.minLength(3), Validators.maxLength(40)]),
    direccion: new FormControl('', [Validators.minLength(5), Validators.maxLength(40)]),
    ci_nit: new FormControl('', [Validators.minLength(5), Validators.maxLength(15)]),
    estado: new FormControl('1'),
    celular: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]),
    email: new FormControl('', [Validators.email, Validators.minLength(5), Validators.maxLength(40)]),
    ciudad: new FormControl('Tarija'),
    tipo_documento: new FormControl('1'),
    fecha_registro: new FormControl(this.obtenerFechaHoraActual()),
  });

  get controlCliente() {
    return this.clienteForm.controls;
  }

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
      console.log('clientes: ',data);

      this.clientesFiltradosList = [];
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
    this.clienteSeleccionado = null;
    this.busquedaCliente = '';
    this.mostrarDropdownCliente = false;
    this.clientesFiltradosList = [];
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
      this.limpiarCliente();
    } else {
      this.ventaForm.get('documento')?.enable();
      this.ventaForm.get('ci_nit')?.enable();
      this.ventaForm.get('nombre_cliente')?.enable();
      this.ventaForm.get('id_cliente')?.enable();
    }
  }

  get clientesFiltrados() {
    if (!this.busquedaCliente) return this.apiClientes;
    const termino = this.busquedaCliente.toLowerCase();
    return this.apiClientes.filter(c =>
      c.nombre?.toLowerCase().includes(termino) ||
      c.ap_paterno?.toLowerCase().includes(termino) ||
      c.ap_materno?.toLowerCase().includes(termino) ||
      c.ci_nit?.toString().includes(termino)
    );
  }

  filtrarClientes() {
    this.mostrarDropdownCliente = true;
    this.clientesFiltradosList = this.clientesFiltrados;
  }

  seleccionarCliente(cliente: any) {
    this.clienteSeleccionado = cliente;
    this.busquedaCliente = `${cliente.nombre || ''} ${cliente.ap_paterno || ''} ${cliente.ap_materno || ''}`.trim();
    this.ventaForm.patchValue({
      id_cliente: cliente.id_cliente,
      ci_nit: cliente.ci_nit,
      nombre_cliente: `${cliente.nombre || ''} ${cliente.ap_paterno || ''}`.trim(),
      documento: cliente.tipo_documento
    });
    this.mostrarDropdownCliente = false;
  }

  ocultarDropdownCliente() {
    setTimeout(() => {
      this.mostrarDropdownCliente = false;
    }, 200);
  }

  limpiarCliente() {
    this.clienteSeleccionado = null;
    this.busquedaCliente = '';
    this.ventaForm.patchValue({
      id_cliente: '',
      ci_nit: '',
      nombre_cliente: '',
      documento: ''
    });
  }

  formatearCliente(cliente: any): string {
    const nombre = cliente.nombre || '';
    const apPaterno = cliente.ap_paterno || '';
    const apMaterno = cliente.ap_materno || '';
    const tipoDoc = cliente.tipo_documento == 1 ? 'CI: ' : 'NIT: ';
    const ciNit = cliente.ci_nit || '';
    return `${nombre} ${apPaterno} ${apMaterno} | ${tipoDoc}${ciNit}`.trim();
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

  // ========== Métodos del Modal de Clientes ==========
  
  mostrarAlerta(exito: boolean, mensaje: string) {
    this.exito = exito;
    this.mensajeExito = mensaje;
    const toastEl = document.getElementById('toastExitoCliente');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  abrirModalNuevoCliente() {
    this.limpiarModalCliente();
    const modalEl = document.getElementById('modalCliente');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  abrirModalEditarCliente() {
    if (!this.clienteSeleccionado) return;
    this.cargarDatosCliente(this.clienteSeleccionado);
    const modalEl = document.getElementById('modalCliente');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  AgregarCliente() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.mostrarAlerta(false, '❌ Por favor complete todos los campos obligatorios');
      return;
    }

    if (this.isEditModeCliente) {
      this.guardarModificacionCliente();
    } else {
      const cliente = this.clienteForm.value;
      this.cliSer.saveCliente(cliente).subscribe({
        next: (data: any) => {
          console.log('✅ Cliente agregado:', data);
          this.mostrarAlerta(true, data.mensaje || '✅ Cliente agregado exitosamente');
          
          // Agregar el nuevo cliente a la lista
          if (data.cliente) {
            this.apiClientes.push(data.cliente);
            // Seleccionar automáticamente el nuevo cliente
            this.seleccionarCliente(data.cliente);
          } else {
            // Si no viene el cliente en la respuesta, recargar lista
            this.cliSer.getListaClientes().subscribe(lista => {
              this.apiClientes = lista;
              // Seleccionar el último cliente agregado
              if (lista.length > 0) {
                this.seleccionarCliente(lista[lista.length - 1]);
              }
            });
          }
          
          this.cerrarModalCliente();
          this.limpiarModalCliente();
        },
        error: (error) => {
          console.error('❌ Error al agregar cliente:', error);
          this.mostrarAlerta(false, error.error?.mensaje || '❌ Error al agregar cliente');
        }
      });
    }
  }

  cargarDatosCliente(cliente: any) {
    this.isEditModeCliente = true;
    this.isViewModeCliente = false;
    this.modalTitleCliente = 'Modificar Cliente';
    this.idClienteEditar = cliente.id_cliente;

    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      ap_paterno: cliente.ap_paterno,
      ap_materno: cliente.ap_materno,
      direccion: cliente.direccion,
      ci_nit: cliente.ci_nit,
      estado: cliente.estado,
      celular: cliente.celular,
      email: cliente.email,
      ciudad: cliente.ciudad,
      tipo_documento: cliente.tipo_documento,
      fecha_registro: cliente.fecha_registro
    });
    this.clienteForm.enable();
  }

  guardarModificacionCliente() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.mostrarAlerta(false, '❌ Por favor complete todos los campos obligatorios');
      return;
    }

    const cliente = {
      id_cliente: this.idClienteEditar,
      ...this.clienteForm.value
    };

    this.cliSer.modificarCliente(cliente).subscribe({
      next: (data: any) => {
        console.log('✅ Cliente modificado:', data);
        this.mostrarAlerta(true, data.mensaje || '✅ Cliente modificado exitosamente');
        
        // Actualizar el cliente en la lista
        const index = this.apiClientes.findIndex(c => c.id_cliente === this.idClienteEditar);
        if (index !== -1) {
          if (data.cliente) {
            this.apiClientes.splice(index, 1);
            this.apiClientes.push(data.cliente);
            // Actualizar el cliente seleccionado
            this.seleccionarCliente(data.cliente);
          } else {
            // Si no viene el cliente en la respuesta, actualizar manualmente
            this.apiClientes[index] = { ...this.apiClientes[index], ...cliente };
            this.seleccionarCliente(this.apiClientes[index]);
          }
        } else {
          // Si no se encuentra, recargar lista
          this.cliSer.getListaClientes().subscribe(lista => {
            this.apiClientes = lista;
            const clienteActualizado = lista.find(c => c.id_cliente === this.idClienteEditar);
            if (clienteActualizado) {
              this.seleccionarCliente(clienteActualizado);
            }
          });
        }
        
        this.cerrarModalCliente();
        this.limpiarModalCliente();
      },
      error: (error) => {
        console.error('❌ Error al modificar cliente:', error);
        this.mostrarAlerta(false, error.error?.mensaje || '❌ Error al modificar cliente');
      }
    });
  }

  limpiarModalCliente() {
    this.clienteForm.reset();
    this.clienteForm.patchValue({
      estado: '1',
      ciudad: 'Tarija',
      tipo_documento: '1',
      fecha_registro: this.obtenerFechaHoraActual()
    });
    this.isEditModeCliente = false;
    this.isViewModeCliente = false;
    this.modalTitleCliente = 'Adicionar Cliente';
    this.idClienteEditar = 0;
    this.clienteForm.enable();
  }

  cerrarModalCliente() {
    const modalEl = document.getElementById('modalCliente');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) {
        modal.hide();
      }
    }
    // Limpiar backdrop
    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 300);
  }

  obtenerFechaHoraActual(): string {
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
