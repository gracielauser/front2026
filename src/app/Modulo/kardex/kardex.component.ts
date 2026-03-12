import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { ProductoService } from '../../Servicios/producto.service';
import { InventarioService } from '../../Servicios/inventario.service';
import { Usuario } from '../../Modelos/usuario';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../Servicios/categoria.service';
import { Categoria } from '../../Modelos/categoria';
import { NgxPaginationModule } from 'ngx-pagination';
import * as bootstrap from 'bootstrap';
import { LoginService } from '../../Servicios/login.service';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './kardex.component.html',
  styleUrl: './kardex.component.css'
})
export class KardexComponent {
  apiProductos: any[] = []
  apiProductosActivos: any[] = [] // Productos con estado 1 para el select del modal
  apiCategorias: Categoria[] = []
  subCategoriasFiltro: Categoria[] = []

  // Filtros
  nombreCodigo: string = ''
  categoria = ''
  subcategoria = ''
  marca = ''
  page: number = 1

  // Búsqueda de productos en modal
  buscarProducto: string = ''
  mostrarListaProductos: boolean = false
  productoSeleccionado: any = null // Producto seleccionado para validar stock

  // Kardex detallado
  productoKardex: any = null
  movimientosDetallados: any[] = []

  // Toast messages
  exito: boolean = false
  mensajeExito: string = ''

  constructor(
    private ProSer: ProductoService,
    private CatSer: CategoriaService,
    private InventarioSer: InventarioService,
    private LogSer: LoginService
  ) {

  }
  rol: number

  ngOnInit(): void {
    // this.obtenerUsuario()
    this.ListarProductos()
    this.ListarProductosActivos()
    this.listarCategorias()
  }
reporteBeneficio(){
  // this.ProSer.getPDF().subscribe((pdfBlob) => {
    // const url = window.URL.createObjectURL(pdfBlob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'reporte_beneficio_producto.pdf';
    // a.click();
    // window.URL.revokeObjectURL(url);
  // });
  this.ProSer.beneficioPDF({}).subscribe((pdfBlob) => {
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });
      // Abre en una nueva pestaña
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
}
  ListarProductos() {
    this.ProSer.movimientos().subscribe(data => {
      this.apiProductos = data
      console.log("productos", data);
    })
  }

  ListarProductosActivos() {
    this.ProSer.getListaProductos().subscribe(data => {
      this.apiProductosActivos = data.filter(p => p.estado === 1)
      console.log("productos activos:", this.apiProductosActivos);
    })
  }

  listarCategorias(){
    this.CatSer.getListaCategoria().subscribe(data => {
      this.apiCategorias = data
      console.log("categorias", data);
    });
  }

  // Obtener lista de marcas únicas de los movimientos
  get marcasDisponibles() {
    const marcasMap = new Map();
    this.apiProductos.forEach(mov => {
      if (mov.producto?.marca) {
        marcasMap.set(mov.producto.marca.id_marca, mov.producto.marca);
      }
    });
    return Array.from(marcasMap.values());
  }

  // Filtrado de movimientos
  get movimientosFiltrados() {
    return this.apiProductos.filter(mov => {
      // Filtro por nombre o código
      if (this.nombreCodigo) {
        const busqueda = this.nombreCodigo.toLowerCase();
        const nombreCoincide = mov.producto?.nombre?.toLowerCase().includes(busqueda);
        const codigoCoincide = mov.producto?.codigo?.toLowerCase().includes(busqueda);
        if (!nombreCoincide && !codigoCoincide) return false;
      }

      // Filtro por categoría y subcategoría
      if (this.categoria) {
        const categoriaId = parseInt(this.categoria);
        if (this.subcategoria) {
          const subcategoriaId = parseInt(this.subcategoria);
          if (mov.producto?.categorium?.id_categoria !== subcategoriaId) return false;
        } else {
          // Si solo hay categoría, verificar si pertenece a esa categoría o sus subcategorías
          const categoriaProducto = mov.producto?.categorium;
          if (!categoriaProducto) return false;

          const perteneceCategoria = categoriaProducto.id_categoria === categoriaId ||
                                    categoriaProducto.id_categoria_padre === categoriaId;
          if (!perteneceCategoria) return false;
        }
      }

      // Filtro por marca
      if (this.marca) {
        const marcaId = parseInt(this.marca);
        if (mov.producto?.marca?.id_marca !== marcaId) return false;
      }

      return true;
    });
  }

  // Manejar cambio de categoría principal
  onFiltroCategoriaPrincipalChange(event: any) {
    const categoriaId = event.target.value;
    this.categoria = categoriaId;
    this.subcategoria = '';

    if (categoriaId) {
      const categoriaSeleccionada = this.apiCategorias.find(c => c.id_categoria === parseInt(categoriaId));
      this.subCategoriasFiltro = categoriaSeleccionada?.subCategoria || [];
    } else {
      this.subCategoriasFiltro = [];
    }
  }
  usuario: any = JSON.parse(localStorage.getItem('usuario'))
  // devoluciones
  obtenerUsuario(){
    const usuario:Usuario=JSON.parse(localStorage.getItem('usuario'))
    this.rol=usuario.persona.tipo
  }
  // Productos
/*productoForm = new UntypedFormGroup({
    nombre: new FormControl('', [Validators.required]),
    codigo: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    estado: new FormControl('1', Validators.required),
    precio_compra: new FormControl('', [Validators.required]),
    precio_venta: new FormControl('', [Validators.required]),
    foto: new FormControl('', [Validators.required]),
    cantidad: new FormControl('', [Validators.required]),
    defectuosos: new FormControl('', [Validators.required]),
    fecha_registro: new FormControl(this.obtenerFechaActual()),
    stock_minimo: new FormControl('', []),
    categoria: new FormControl('', [Validators.required]),
    proveedor: new FormControl('', [Validators.required])
  })*/
  movimientoForm = new UntypedFormGroup({
    id_producto: new FormControl('', [Validators.required]),
    motivo: new FormControl('', [Validators.maxLength(100)]),
    cantidad: new FormControl({value: '', disabled: true}, [Validators.required, Validators.min(1), Validators.max(1000)]),
    tipo_movimiento: new FormControl(1, [Validators.required]),
    fecha_registro: new FormControl(this.obtenerFechaConHora())
  })
  /*get controles() {
    return this.productoForm.controls
  }*/
   get control() {
    return this.movimientoForm.controls
  }
  obtenerFechaActual(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0]; // Formato yyyy-MM-dd
  }

  obtenerFechaConHora(): string {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, '0');
    const day = String(ahora.getDate()).padStart(2, '0');
    const hours = String(ahora.getHours()).padStart(2, '0');
    const minutes = String(ahora.getMinutes()).padStart(2, '0');
    const seconds = String(ahora.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // Formato YYYY-MM-DD hh:mm:ss
  }

 incrementar(): void {
  const control = this.movimientoForm.get('cantidad');
  const tipoMovimiento = this.movimientoForm.get('tipo_movimiento')?.value;

  if (control) {
    const valorActual = parseFloat(control.value) || 0;
    let nuevoValor = valorActual + 1;

    // Si es salida (1), validar contra stock
    if (tipoMovimiento === 1 && this.productoSeleccionado) {
      const stockDisponible = this.productoSeleccionado.stock || 0;
      if (nuevoValor > stockDisponible) {
        this.mostrarAlerta(false, `⚠️ Stock insuficiente. Disponible: ${stockDisponible}`);
        return;
      }
    }

    // Validar máximo
    if (nuevoValor > 1000) {
      this.mostrarAlerta(false, '⚠️ La cantidad máxima es 1000');
      return;
    }

    control.setValue(parseFloat(nuevoValor.toFixed(2)));
    control.markAsTouched();
    control.markAsDirty();
  }
}

decrementar(): void {
  const control = this.movimientoForm.get('cantidad');
  if (control) {
    let valorActual = parseFloat(control.value) || 0;
    if (valorActual > 0) {
      control.setValue(parseFloat((valorActual - 1).toFixed(2)));
      control.markAsTouched();
      control.markAsDirty();
    }
  }
}

// Filtrar productos para el select del modal
get productosFiltrados() {
  if (!this.buscarProducto) {
    return this.apiProductosActivos;
  }

  const busqueda = this.buscarProducto.toLowerCase();
  return this.apiProductosActivos.filter(p => {
    const nombreCoincide = p.nombre?.toLowerCase().includes(busqueda);
    const codigoCoincide = p.codigo?.toLowerCase().includes(busqueda);
    const marcaCoincide = p.marca?.nombre?.toLowerCase().includes(busqueda);
    return nombreCoincide || codigoCoincide || marcaCoincide;
  });
}

limpiarFormulario() {
  this.movimientoForm.reset({
    tipo_movimiento: 1,
    fecha_registro: this.obtenerFechaConHora()
  });
  this.movimientoForm.get('cantidad')?.disable();
  this.buscarProducto = '';
  this.mostrarListaProductos = false;
  this.productoSeleccionado = null;
}

filtrarProductoModal(event: any) {
  this.mostrarListaProductos = this.buscarProducto.length > 0;
}

validarCantidadConStock() {
  const cantidadControl = this.movimientoForm.get('cantidad');
  const tipoMovimiento = this.movimientoForm.get('tipo_movimiento')?.value;

  if (tipoMovimiento === 1 && this.productoSeleccionado && cantidadControl?.value) {
    const cantidad = cantidadControl.value;
    const stockDisponible = this.productoSeleccionado.stock || 0;

    if (cantidad > stockDisponible) {
      this.mostrarAlerta(false, `⚠️ La cantidad excede el stock disponible (${stockDisponible} unidades). Ajustando...`);
      cantidadControl.setValue(stockDisponible);
    }
  }
}

ocultarListaProductosConRetraso() {
  setTimeout(() => {
    this.mostrarListaProductos = false;
  }, 200);
}

seleccionarProducto(producto: any, input: HTMLInputElement) {
  this.productoSeleccionado = producto;

  this.movimientoForm.patchValue({
    id_producto: producto.id_producto
  });
  // Marcar el campo como touched y dirty para activar la validación visual
  this.movimientoForm.get('id_producto')?.markAsTouched();
  this.movimientoForm.get('id_producto')?.markAsDirty();

  // Habilitar campo cantidad
  this.movimientoForm.get('cantidad')?.enable();

  this.buscarProducto = `${producto.codigo} - ${producto.nombre} (Stock: ${producto.stock || 0})`;
  this.mostrarListaProductos = false;
  input.blur();
}

validarFormulario(): boolean {
  if (this.movimientoForm.get('id_producto')?.invalid) return false;
  if (!this.productoSeleccionado) return false; // Debe tener un producto seleccionado

  const cantidadControl = this.movimientoForm.get('cantidad');
  if (cantidadControl?.disabled || cantidadControl?.invalid) return false;

  const cantidad = cantidadControl?.value;
  const tipoMovimiento = this.movimientoForm.get('tipo_movimiento')?.value;

  if (!cantidad || cantidad <= 0 || cantidad > 1000) return false;

  // Si es salida, validar contra stock
  if (tipoMovimiento === 1 && this.productoSeleccionado) {
    const stockDisponible = this.productoSeleccionado.stock || 0;
    if (cantidad > stockDisponible) return false;
  }

  return true;
}

guardarMovimiento() {
  if (!this.validarFormulario()) {
    console.log('❌ Formulario inválido');
    this.mostrarAlerta(false, '⚠️ Por favor complete correctamente todos los campos');
    return;
  }

  const movimiento: any = {
    tipo_movimiento: this.movimientoForm.get('tipo_movimiento')?.value,
    motivo: this.movimientoForm.get('motivo')?.value || '',
    id_producto: this.movimientoForm.get('id_producto')?.value,
    cantidad: parseInt(this.movimientoForm.get('cantidad')?.value),
    fecha_registro: this.obtenerFechaConHora(),
    id_usuario: this.LogSer.obtenerUsuarioLogueado().id_usuario,
    estado: 1
  };

  console.log('📝 Guardando movimiento:', movimiento);

  this.InventarioSer.saveInventario(movimiento).subscribe({
    next: (data) => {
      console.log('✅ Movimiento registrado:', data);
      this.mostrarAlerta(true, data.mensaje || '✅ Movimiento registrado exitosamente');
      this.ListarProductos(); // Refrescar la tabla
      this.limpiarFormulario();
      this.cerrarModal();
    },
    error: (error) => {
      console.error('❌ Error al registrar movimiento:', error);
      this.mostrarAlerta(false, error.error?.mensaje || '❌ Error al registrar el movimiento');
    }
  });
}

mostrarAlerta(exito: boolean, mensaje: string) {
  this.exito = exito;
  this.mensajeExito = mensaje;
  const toastEl = document.getElementById('toastExito');
  if (toastEl) {
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

cerrarModal() {
  const modalEl = document.getElementById('movimientoModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
      modal.hide();
    }
  }
  setTimeout(() => {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }, 300);
}

// Kardex detallado
verKardexDetallado(productoMovimiento: any) {
  this.productoKardex = productoMovimiento.producto;
  this.ProSer.verKardexDetallado(productoMovimiento.id_producto).subscribe({
    next: (data) => {
      console.log('kardex', data);
      this.movimientosDetallados = data.movimientos || [];
    },
    error: (error) => {
      console.error('❌ Error al cargar kardex:', error);
      this.mostrarAlerta(false, error.error?.mensaje || '❌ Error al cargar el kardex');
      this.movimientosDetallados = [];
    }
  });

  const modalEl = document.getElementById('kardexDetalleModal');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

cerrarKardexDetalle() {
  const modalEl = document.getElementById('kardexDetalleModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
      modal.hide();
    }
  }
  setTimeout(() => {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }, 300);
}

}

