import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { Cliente } from '../../../Modelos/cliente';
import { Producto } from '../../../Modelos/producto';
import { Usuario } from '../../../Modelos/usuario';
import { ClienteService } from '../../../Servicios/cliente.service';
import { ProductoService } from '../../../Servicios/producto.service';
import { VentaService } from '../../../Servicios/venta.service';
import { CategoriaService } from '../../../Servicios/categoria.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-nueva-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './nueva-venta.component.html',
  styleUrls: ['./nueva-venta.component.css']
})
export class NuevaVentaComponent implements OnInit {

  // Constante para sessionStorage
  private readonly CARRITO_STORAGE_KEY = 'carritoVentaProductos';

  apiUrl = environment.apiUrl + '/uploads/';

  usu: Usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  apiProductos: Producto[] = [];
  apiClientes: any[] = [];
  apiCategorias: any[] = [];
  apiSubcategorias: any[] = [];
  productosVender: any[] = [];
  productosVentaCantidades: number[] = [];
  productosVentaPrecios: number[] = [];
  productosVentaSubtotales: number[] = [];
  busqueda: string = '';
  categoriaSeleccionada: any = '';
  subcategoriaSeleccionada: string = '';
  total: number = 0;
  tipo: number = 1;
  clienteSeleccionado: any = null;
  busquedaCliente: string = '';
  mostrarDropdownCliente: boolean = false;
  mostrarBuscadorCliente: boolean = false;
  clientesFiltradosList: any[] = [];

  // Buscador rápido de productos (barra superior)
  busquedaProductoRapida: string = '';
  mostrarDropdownProductoRapido: boolean = false;
  productosRapidosList: any[] = [];

  // Paginación de productos
  paginaActual: number = 1;
  productosPorPagina: number = 7;

  // Propiedades para modal de clientes
  isEditModeCliente: boolean = false;
  isViewModeCliente: boolean = false;
  modalTitleCliente: string = 'Adicionar Cliente';
  idClienteEditar: number = 0;
  mensajeExito: string = '';
  exito: boolean = false;
  ciudades: string[] = ['Tarija', 'La Paz', 'Pando', 'Cochabamba', 'Chuquisaca', 'Santa Cruz', 'Potosi', 'Beni', 'Oruro'];
  ciNitFocused: boolean = false;

  // Validador de formato CI/NIT
  formatoCiNit(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length === 0) return null;
      const patron = /^\d{5,}(-\d+[AB])?$/;
      return patron.test(control.value.toString().trim()) ? null : { formatoCiNit: true };
    };
  }

  // Validador de duplicado CI/NIT
  validarDuplicadoCiNit(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length === 0) return null;
      if (!this.apiClientes || this.apiClientes.length === 0) return null;
      const value = control.value.toString().trim();
      if (this.isEditModeCliente) {
        const existe = this.apiClientes.some(cli =>
          cli.ci_nit?.toString().trim() === value && cli.id_cliente !== this.idClienteEditar
        );
        return existe ? { duplicadoCiNit: true } : null;
      }
      const existe = this.apiClientes.some(cli => cli.ci_nit?.toString().trim() === value);
      return existe ? { duplicadoCiNit: true } : null;
    };
  }

  onCiNitFocus() { this.ciNitFocused = true; }
  onCiNitBlur() { this.ciNitFocused = false; }
  onCiNitInput() {
    const c = this.clienteForm.get('ci_nit');
    if (c) { c.updateValueAndValidity({ emitEvent: true }); c.markAsTouched(); c.markAsDirty(); }
  }

  clienteForm = new UntypedFormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]),
    ap_paterno: new FormControl('', [ Validators.minLength(3), Validators.maxLength(40)]),
    ap_materno: new FormControl('', [Validators.minLength(3), Validators.maxLength(40)]),
    direccion: new FormControl('', [Validators.minLength(5), Validators.maxLength(40)]),
    ci_nit: new FormControl('', [this.formatoCiNit(), this.validarDuplicadoCiNit(), Validators.minLength(5), Validators.maxLength(15)]),
    estado: new FormControl('1'),
    celular: new FormControl('', [Validators.minLength(8), Validators.maxLength(15)]),
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
    private CatSer: CategoriaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cliSer.getListaClientes().subscribe(data => {
      this.apiClientes = data;
      console.log('clientes: ',data);

      // Seleccionar cliente por defecto con id_cliente=8
      const clienteDefault = data.find((c: any) => c.id_cliente === 8);
      if (clienteDefault) {
        this.seleccionarCliente(clienteDefault);
      }

      this.clientesFiltradosList = [];
    });

    this.CatSer.getListaCategoria().subscribe((lista) => {
      this.apiCategorias = lista.filter((cat: any) => !cat.id_categoria_padre);
    });

    this.proSer.getListaProductos().subscribe(data => {
      this.apiProductos = data.filter((pro: any) => pro.estado == 1);

      // Cargar productos del sessionStorage después de obtener la lista completa
      this.cargarCarritoDesdeStorage();
    });

    this.ventaForm.get('documento')?.disable();
    this.ventaForm.get('ci_nit')?.disable();
    this.ventaForm.get('nombre_cliente')?.disable();
    this.ventaForm.get('id_cliente')?.disable();
  }

  refrescarProductos() {
    this.proSer.getListaProductos().subscribe(data => {
      this.apiProductos = data;
      this.paginaActual = 1; // Resetear paginación al refrescar
      console.log('Productos refrescados:', data);
    });
  }

  // ===== MÉTODOS DE PERSISTENCIA EN SESSIONSTORAGE =====

  /**
   * Guarda los productos del carrito (ID + cantidad) en sessionStorage
   */
  private guardarCarritoEnStorage(): void {
    const carrito = this.productosVender.map((p, i) => ({
      id: p.id_producto,
      qty: this.productosVentaCantidades[i] || 1
    }));
    sessionStorage.setItem(this.CARRITO_STORAGE_KEY, JSON.stringify(carrito));
  }

  /**
   * Carga los productos del sessionStorage y los agrega al carrito
   * Solo agrega productos que tengan stock > 0
   */
  private cargarCarritoDesdeStorage(): void {
    const idsGuardados = sessionStorage.getItem(this.CARRITO_STORAGE_KEY);

    if (!idsGuardados) {
      return;
    }

    try {
      const datosCarrito: any[] = JSON.parse(idsGuardados);
      const productosSinStock: string[] = [];

      datosCarrito.forEach(item => {
        // Compatibilidad: formato antiguo (número) o nuevo ({id, qty})
        const idProducto: number = typeof item === 'number' ? item : item.id;
        const qty: number = typeof item === 'number' ? 1 : (item.qty || 1);

        const producto = this.apiProductos.find(p => p.id_producto === idProducto);

        if (producto) {
          if (producto.stock > 0) {
            if (!this.productosVender.includes(producto)) {
              this.productosVender.push(producto);
              this.productosVentaCantidades.push(qty);
              this.productosVentaPrecios.push(producto.precio_venta);
              this.productosVentaSubtotales.push(producto.precio_venta * qty);
            }
          } else {
            productosSinStock.push(producto.nombre);
          }
        }
      });

      // Recalcular total después de cargar productos
      if (this.productosVender.length > 0) {
        this.calcularTotal();
        console.log(`✅ Carrito cargado: ${this.productosVender.length} producto(s)`);
      }

      // Mostrar alerta si hay productos sin stock
      if (productosSinStock.length > 0) {
        const mensaje = productosSinStock.length === 1
          ? `⚠️ El producto "${productosSinStock[0]}" ya no tiene stock disponible y no se agregó al carrito.`
          : `⚠️ Los siguientes productos ya no tienen stock disponible y no se agregaron al carrito:\n${productosSinStock.join(', ')}`;

        this.mostrarAlerta(false, mensaje);
      }

      // Actualizar sessionStorage con solo los productos que sí se agregaron
      if (productosSinStock.length > 0) {
        this.guardarCarritoEnStorage();
      }
    } catch (error) {
      console.error('❌ Error al cargar carrito desde sessionStorage:', error);
      this.limpiarCarritoStorage();
    }
  }

  /**
   * Limpia el carrito del sessionStorage
   */
  private limpiarCarritoStorage(): void {
    sessionStorage.removeItem(this.CARRITO_STORAGE_KEY);
  }

  onCategoriaChange(event: any) {
    const idCategoria = event.target.value;
    this.subcategoriaSeleccionada = '';
    this.paginaActual = 1; // Resetear paginación al cambiar categoría

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

    // Filtro por categoría/subcategoría
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

    // Filtro por búsqueda (nombre, código, marca)
    if (this.busqueda && this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase().trim();
      productos = productos.filter(producto => {
        const nombre = (producto.nombre || '').toLowerCase();
        const codigo = (producto.codigo || '').toLowerCase();
        const marca = (producto.marca?.nombre || '').toLowerCase();

        return nombre.includes(termino) ||
               codigo.includes(termino) ||
               marca.includes(termino);
      });
    }

    return productos;
  }

  get productosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;
    return this.productosFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.productosFiltrados.length / this.productosPorPagina);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  agregarVenta(tipoPago: number) {
    const idCliente = (this.ventaForm.get('id_cliente')?.value || 8);
    const tipoVenta = this.tipo; // 1 = normal (sin factura), 2 = facturado (con factura)
    const montoTotal = this.total;
    const descuento = Number(this.ventaForm.get('descuento')?.value) || 0;

    // Validaciones del cliente SOLO para ventas con factura (tipo === 2)
    if (this.tipo === 2) {
      // Si es tipo 2 (facturado), aplicar todas las restricciones
      if (idCliente === 8) {
        this.mostrarAlerta(false, '⚠️ No se puede realizar una venta con factura con el cliente por defecto (Público General). Por favor seleccione un cliente válido.');
        return;
      }

      if (!this.clienteSeleccionado) {
        this.mostrarAlerta(false, '⚠️ Debe seleccionar un cliente válido para realizar una venta con factura.');
        return;
      }

      if (!this.clienteSeleccionado.nombre || this.clienteSeleccionado.nombre.trim() === '') {
        this.mostrarAlerta(false, '⚠️ El cliente seleccionado no tiene nombre. Por favor complete los datos del cliente.');
        return;
      }

      if (!this.clienteSeleccionado.ci_nit || this.clienteSeleccionado.ci_nit.toString().trim() === '') {
        this.mostrarAlerta(false, '⚠️ El cliente seleccionado no tiene CI/NIT. Por favor complete los datos del cliente.');
        return;
      }
    }
    // Si es tipo 1 (sin factura), no hay restricciones de cliente

    const venta: any = {
      id_venta: null,
      fecha_registro: this.obtenerFechaActualConHora(),
      monto_total: montoTotal,
      tipo_pago: tipoPago, // 1 = efectivo, 2 = QR
      tipo_venta: tipoVenta, // 1 = normal, 2 = facturado
      descripcion: this.ventaForm.get('descripcion')?.value || '',
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
        sub_total: this.productosVentaSubtotales[i],
        precio_unitario: this.productosVender[i].precio_venta,
        id_venta: 0,
        id_producto: this.productosVender[i].id_producto,
        precio_compra: this.productosVender[i].precio_compra,
      };
      venta.detallesVenta.push(detalle);
    }
    this.ventaSer.saveVenta(venta).subscribe( {
      next: (data) => {
      console.log('Venta guardada exitosamente:', data);
      const nota:boolean = Number(data.tipo_venta)==1
      this.ventaSer.notaVenta(Number(data.id_venta),nota,!nota).subscribe((pdfBlob) => {
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
  facturas(){
    this.ventaSer.facturas().subscribe((pdfBlob) => {
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });
      // Abre en una nueva pestaña
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  agregarProducto(pro: Producto) {
    // Validar stock
    if (pro.stock === 0) {
      this.mostrarAlerta(false, `⚠️ El producto "${pro.nombre}" no tiene stock disponible.`);
      return;
    }

    if (this.productosVender.includes(pro)) {
      const index = this.productosVender.indexOf(pro);
      if (this.productosVentaCantidades[index] >= pro.stock) {
        this.mostrarAlerta(false, `⚠️ Stock máximo alcanzado para "${pro.nombre}".`);
        return;
      }
      this.productosVentaCantidades[index] += 1;
      // Recalcular subtotal basado en precio original
      this.productosVentaSubtotales[index] = pro.precio_venta * this.productosVentaCantidades[index];
    } else {
      this.productosVender.push(pro);
      this.agregarCantidad(1);
      this.productosVentaPrecios.push(pro.precio_venta);
      this.productosVentaSubtotales.push(pro.precio_venta * 1);
    }
    this.calcularTotal();

    // Guardar en sessionStorage
    this.guardarCarritoEnStorage();
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
    this.productosVentaPrecios = [];
    this.productosVentaSubtotales = [];

    // Limpiar sessionStorage del carrito
    this.limpiarCarritoStorage();

    // Resetear variables
    this.busqueda = '';
    this.categoriaSeleccionada = '';
    this.subcategoriaSeleccionada = '';
    this.total = 0;
    this.tipo = 1;
    this.paginaActual = 1;
    this.mostrarDropdownCliente = false;
    this.mostrarBuscadorCliente = false;
    this.clientesFiltradosList = [];
    this.apiSubcategorias = [];

    // Restaurar cliente por defecto (id_cliente=8)
    const clienteDefault = this.apiClientes.find((c: any) => c.id_cliente === 8);
    if (clienteDefault) {
      this.seleccionarCliente(clienteDefault);
    } else {
      this.clienteSeleccionado = null;
      this.busquedaCliente = '';
    }

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

    this.proSer.getListaProductos().subscribe(data => {
      this.apiProductos = data;
    });
  }

  agregarCantidad(cantidad: number) {
    this.productosVentaCantidades.push(cantidad);
    this.calcularTotal();
  }

  incrementarCantidad(i: number) {
    const stock = this.productosVender[i].stock;
    if (this.productosVentaCantidades[i] >= stock) return;
    this.productosVentaCantidades[i] += 1;
    const precioOriginal = this.productosVender[i].precio_venta;
    this.productosVentaSubtotales[i] = precioOriginal * this.productosVentaCantidades[i];
    this.calcularTotal();
    this.guardarCarritoEnStorage();
  }

  decrementarCantidad(i: number) {
    if (this.productosVentaCantidades[i] <= 1) return;
    this.productosVentaCantidades[i] -= 1;
    const precioOriginal = this.productosVender[i].precio_venta;
    this.productosVentaSubtotales[i] = precioOriginal * this.productosVentaCantidades[i];
    this.calcularTotal();
    this.guardarCarritoEnStorage();
  }

  getCantidadEnCarrito(pro: any): number {
    const idx = this.productosVender.indexOf(pro);
    return idx >= 0 ? this.productosVentaCantidades[idx] : 0;
  }

  nuevaCantidad(i: number, event: any) {
    const valor = Number(event.target.value);
    const stock = this.productosVender[i].stock;
    if (valor < 1) {
      event.target.value = 1;
      this.productosVentaCantidades[i] = 1;
    } else if (valor > stock) {
      event.target.value = stock;
      this.productosVentaCantidades[i] = stock;
    } else {
      this.productosVentaCantidades[i] = valor;
    }
    // Recalcular subtotal basado en precio original del producto
    const precioOriginal = this.productosVender[i].precio_venta;
    this.productosVentaSubtotales[i] = precioOriginal * this.productosVentaCantidades[i];
    this.calcularTotal();
  }

  bloquearTeclasInvalidas(event: KeyboardEvent) {
    const teclasBloqueadas = ['-', 'e', 'E', '+', '.', '0'];
    if (teclasBloqueadas.includes(event.key)) {
      event.preventDefault();
    }
  }

  bloquearTeclasInvalidasPrecio(event: KeyboardEvent) {
    const teclasBloqueadas = ['-', 'e', 'E', '+'];
    if (teclasBloqueadas.includes(event.key)) {
      event.preventDefault();
    }
  }

  bloquearTeclasInvalidasDescuento(event: KeyboardEvent) {
    const teclasBloqueadas = ['-', 'e', 'E', '+'];
    if (teclasBloqueadas.includes(event.key)) {
      event.preventDefault();
    }
  }

  nuevoSubtotal(i: number, event: any) {
    const valor = Number(event.target.value);
    this.productosVentaSubtotales[i] = valor > 0 ? valor : 0.01;
    this.calcularTotal();
  }

  validarSubtotal(i: number, event: any) {
    const valor = Number(event.target.value);

    // Actualizar el subtotal temporalmente para calcular el total
    const subtotalAnterior = this.productosVentaSubtotales[i];
    this.productosVentaSubtotales[i] = valor;

    // Calcular el total original (precio_venta × cantidad para todos los productos)
    let totalOriginal = 0;
    for (let j = 0; j < this.productosVender.length; j++) {
      totalOriginal += this.productosVender[j].precio_venta * this.productosVentaCantidades[j];
    }

    // Calcular total con descuentos (suma de subtotales - descuento)
    let totalConDescuentos = 0;
    for (let j = 0; j < this.productosVentaSubtotales.length; j++) {
      totalConDescuentos += this.productosVentaSubtotales[j];
    }
    const descuento = Number(this.ventaForm.get('descuento')?.value) || 0;
    const totalFinal = totalConDescuentos - descuento;

    // El total final no puede ser menor a la mitad del total original
    const minimoPermitido = totalOriginal / 2;

    if (totalFinal < minimoPermitido) {
      // Calcular el subtotal mínimo permitido para este item
      // minimoPermitido = totalConDescuentos - descuento
      // minimoPermitido = (suma de otros subtotales + este subtotal) - descuento
      // este subtotal mínimo = minimoPermitido + descuento - suma de otros subtotales
      let sumaOtrosSubtotales = 0;
      for (let j = 0; j < this.productosVentaSubtotales.length; j++) {
        if (j !== i) {
          sumaOtrosSubtotales += this.productosVentaSubtotales[j];
        }
      }
      const subtotalMinimo = minimoPermitido + descuento - sumaOtrosSubtotales;

      this.mostrarAlerta(false, `⚠️ El subtotal ingresado hace que el total a pagar sea menor a la mitad del total original (Bs ${minimoPermitido.toFixed(2)}). Se ajustó al mínimo permitido.`);
      // Poner en el mínimo permitido
      this.productosVentaSubtotales[i] = subtotalMinimo > 0 ? subtotalMinimo : 0.01;
      event.target.value = this.productosVentaSubtotales[i].toFixed(2);
    }

    this.calcularTotal();
  }

  calcularTotal() {
    let sumaSubTotales = 0;
    for (let i = 0; i < this.productosVentaCantidades.length; i++) {
      sumaSubTotales = sumaSubTotales + Number(this.productosVentaSubtotales[i]);
    }
    this.total = sumaSubTotales;
  }

  descontar(e: any) {
    this.calcularTotal();
  }

  validarDescuento(e: any) {
    const descuentoIngresado = Number(e.target.value) || 0;

    // Validar que no sea negativo
    if (descuentoIngresado < 0) {
      this.mostrarAlerta(false, `⚠️ El descuento no puede ser negativo.`);
      e.target.value = '0';
      this.ventaForm.patchValue({
        descuento: 0
      });
      return;
    }

    // Calcular el total original (precio_venta × cantidad)
    let totalOriginal = 0;
    for (let i = 0; i < this.productosVender.length; i++) {
      totalOriginal += this.productosVender[i].precio_venta * this.productosVentaCantidades[i];
    }

    // Calcular la suma de subtotales actuales
    let sumaSubtotales = 0;
    for (let i = 0; i < this.productosVentaSubtotales.length; i++) {
      sumaSubtotales += this.productosVentaSubtotales[i];
    }

    // El total final no puede ser menor a la mitad del total original
    const totalFinal = sumaSubtotales - descuentoIngresado;
    const minimoPermitido = totalOriginal / 2;

    if (totalFinal < minimoPermitido) {
      this.mostrarAlerta(false, `⚠️ El descuento aplicado hace que el total a pagar sea menor a la mitad del total original (Bs ${minimoPermitido.toFixed(2)}). El descuento se restableció a 0.`);
      e.target.value = '0';
      this.ventaForm.patchValue({
        descuento: 0
      });
    }
  }

  quitarProducto(i: number) {
    this.productosVender.splice(i, 1);
    this.productosVentaCantidades.splice(i, 1);
    this.productosVentaPrecios.splice(i, 1);
    this.productosVentaSubtotales.splice(i, 1);
    this.calcularTotal();

    // Actualizar sessionStorage
    this.guardarCarritoEnStorage();
  }

  observarFactura(n: number) {
    const tipo: number = n;
      console.log('NUevo tipo factura o no:', n);

    this.tipo = n;
    // Ya no ocultamos ni deshabilitamos el selector de cliente
    // El cliente siempre estará visible y habilitado
  }

  get clientesFiltrados() {
    const activos = this.apiClientes.filter((c: any) => c.estado == 1);
    if (!this.busquedaCliente) return activos.slice(0, 4);
    const termino = this.busquedaCliente.toLowerCase();
    return activos.filter(c =>
      c.nombre?.toLowerCase().includes(termino) ||
      c.ap_paterno?.toLowerCase().includes(termino) ||
      c.ap_materno?.toLowerCase().includes(termino) ||
      c.ci_nit?.toString().includes(termino)
    ).slice(0, 4);
  }

  filtrarClientes() {
    this.mostrarDropdownCliente = true;
    this.clientesFiltradosList = this.clientesFiltrados;
  }

  abrirBuscadorCliente() {
    this.busquedaCliente = '';
    this.mostrarBuscadorCliente = true;
    this.clientesFiltradosList = this.apiClientes.filter((c: any) => c.estado == 1).slice(0, 4);
    this.mostrarDropdownCliente = true;
    setTimeout(() => {
      const el = document.getElementById('inputBuscadorCliente');
      if (el) (el as HTMLInputElement).focus();
    }, 100);
  }

  // ===== BUSCADOR RÁPIDO DE PRODUCTOS =====

  filtrarProductosRapido() {
    const termino = this.busquedaProductoRapida.toLowerCase().trim();
    if (!termino) {
      this.productosRapidosList = this.apiProductos.slice(0, 7);
    } else {
      this.productosRapidosList = this.apiProductos.filter(p =>
        p.nombre?.toLowerCase().includes(termino) ||
        p.codigo?.toLowerCase().includes(termino) ||
        p.marca?.nombre?.toLowerCase().includes(termino)
      ).slice(0, 7);
    }
    this.mostrarDropdownProductoRapido = true;
  }

  seleccionarProductoRapido(pro: any) {
    if (pro.stock <= 0) return;
    this.agregarProducto(pro);
    this.busquedaProductoRapida = '';
    this.mostrarDropdownProductoRapido = false;
    this.productosRapidosList = [];
  }

  ocultarDropdownProductoRapido() {
    setTimeout(() => {
      this.mostrarDropdownProductoRapido = false;
    }, 200);
  }

  cerrarBuscadorCliente() {
    this.mostrarBuscadorCliente = false;
    this.busquedaCliente = '';
    this.mostrarDropdownCliente = false;
  }

  seleccionarCliente(cliente: any) {
    this.clienteSeleccionado = cliente;
    this.busquedaCliente = '';
    this.mostrarBuscadorCliente = false;
    this.mostrarDropdownCliente = false;
    this.ventaForm.patchValue({
      id_cliente: cliente.id_cliente,
      ci_nit: cliente.ci_nit,
      nombre_cliente: `${cliente.nombre || ''} ${cliente.ap_paterno || ''}`.trim(),
      documento: cliente.tipo_documento
    });
  }

  ocultarDropdownCliente() {
    setTimeout(() => {
      this.mostrarDropdownCliente = false;
    }, 200);
  }

  limpiarCliente() {
    // Restaurar cliente por defecto (general, id_cliente=8) en lugar de dejar en null
    const clienteDefault = this.apiClientes.find((c: any) => c.id_cliente === 8);
    if (clienteDefault) {
      this.seleccionarCliente(clienteDefault);
    } else {
      this.clienteSeleccionado = null;
      this.busquedaCliente = '';
      this.mostrarBuscadorCliente = false;
      this.mostrarDropdownCliente = false;
      this.ventaForm.patchValue({
        id_cliente: '',
        ci_nit: '',
        nombre_cliente: '',
        documento: ''
      });
    }
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

    // Verificar si es el cliente por defecto (id_cliente=8) que no se puede editar
    if (this.clienteSeleccionado.id_cliente === 8) {
      alert('⚠️ No se puede editar el cliente por defecto (Público General).');
      return;
    }

    this.cargarDatosCliente(this.clienteSeleccionado);
    const modalEl = document.getElementById('modalCliente');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  puedeEditarCliente(): boolean {
    if (!this.clienteSeleccionado) return false;
    // No permitir editar el cliente con id_cliente=8
    return this.clienteSeleccionado.id_cliente !== 8;
  }

  seleccionarTextoInput(event: any) {
    const input = event.target as HTMLInputElement;
    if (input && input.select) {
      input.select();
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

  confirmarCierre() {
    this.restaurarEstado();
    // Intentar cerrar la pestaña actual
    window.close();
    // Si window.close() no funciona (por restricciones de seguridad),
    // navegar de vuelta al módulo de ventas
    setTimeout(() => {
      this.router.navigate(['/home/ventas']);
    }, 100);
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
