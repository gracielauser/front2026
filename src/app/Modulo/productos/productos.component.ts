import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';

import * as bootstrap from 'bootstrap';
import { Categoria } from '../../Modelos/categoria';
import { Producto } from '../../Modelos/producto';
import { CategoriaService } from '../../Servicios/categoria.service';
import { ProductoService } from '../../Servicios/producto.service';
import { CommonModule } from '@angular/common';
import { UnidadMedidaService } from '../../Servicios/unidad-medida.service';
import { MarcaService } from '../../Servicios/marca.service';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { CodigoPipe } from '../../Filtros/codigo.pipe';
import { NombrePipe } from '../../Filtros/nombre.pipe';
import { CategoriaPipe } from '../../Filtros/categoria.pipe';
import { StockPipe } from '../../Filtros/stock.pipe';
import { UnidadMedidaPipe } from '../../Filtros/unidad-medida.pipe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, EstadoPipe,
    CodigoPipe, NombrePipe, CategoriaPipe, StockPipe, UnidadMedidaPipe, NgxPaginationModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit, AfterViewInit {
  @ViewChild('modalProducto') modalAgregarRef!: ElementRef; // Referencia al modal
  @ViewChild('modalMarca') modalMarcaRef!: ElementRef; // Referencia al modal marca
  private modalAgregar?: bootstrap.Modal;
  private modalMarca?: bootstrap.Modal;

  apiUrl = environment.apiUrl + '/uploads/';
  productosModel!: Producto;

  //*ngfor lists
  apiProductos: any[] = []
  apiCategorias: any[] = []
  apiMarcas: any[] = []
  apiUnidadesMedida: any[] = []
  // Filtros
  codigo: string = ''
  nombre: string = ''
  categoria = ''
  subcategoria = ''
  subCategoriasFiltro: any[] = []
  unidadMedidaFilter = ''
  estado = '1'
  stockFilter = ''
  page: number = 1

  // Modal unificado
  isEditMode: boolean = false
  modalTitle: string = 'Nuevo Producto'
  exito: boolean = true
  mensajeToast: string = ''

  // Archivo seleccionado
  selectedFile: File | null = null;

  // Validación de código duplicado
  codigoDuplicado: boolean = false;

  // Categoría y Subcategoría
  categoriaSeleccionada: Categoria | null = null;
  subCategorias: Categoria[] = [];
  subcategoriaSeleccionada: number | null = null;

  constructor(
    private CatSer: CategoriaService,
    private ProSer: ProductoService,
    private UniMedSer: UnidadMedidaService,
    private MarSer: MarcaService
  ) { }
catalogoPDF(){
    this.ProSer.catalogoPDF({}).subscribe((pdfBlob) => {
      // Aquí puedes manejar el PDF recibido, por ejemplo, abrirlo en una nueva ventana
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
}
  ngOnInit(): void {
    this.CatSer.getListaCategoria().subscribe((data) => {
      this.apiCategorias = Array.isArray(data) ? data : (data as any).data || [];
    })
    this.listar()
    this.productoForm.get('fecha_registro').disable()
  }

  ngAfterViewInit() {
    // Inicializa los modales de Bootstrap
    this.modalAgregar = new bootstrap.Modal(this.modalAgregarRef.nativeElement);
    this.modalMarca = new bootstrap.Modal(this.modalMarcaRef.nativeElement);
  }
  listar() {
    this.ProSer.getListaProductos().subscribe((lista) => {
      this.apiProductos = Array.isArray(lista) ? lista : (lista as any).data || [];
      console.log("productos", this.apiProductos);

    })
    this.MarSer.getListaMarcas().subscribe((lista) => {
      this.apiMarcas = Array.isArray(lista) ? lista : (lista as any).data || [];
      console.log("marcas", this.apiMarcas);
    })
    this.UniMedSer.getListaUnidades().subscribe((lista) => {
      this.apiUnidadesMedida = Array.isArray(lista) ? lista : (lista as any).data || [];
      console.log("unidades de medida", this.apiUnidadesMedida);
    })
  }


  // Formulario de Marca
  marcaForm = new UntypedFormGroup({
    nombre: new FormControl('', Validators.required),
    descripcion: new FormControl(''),
    estado: new FormControl('1', Validators.required)
  });

  productoForm = new UntypedFormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]),
    codigo: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    descripcion: new FormControl('', [Validators.minLength(6), Validators.maxLength(50)]),
    estado: new FormControl('1'),
    precio_compra: new FormControl('', [Validators.required, Validators.min(0.01)]),
    precio_venta: new FormControl('', [Validators.required, Validators.min(0.01)]),
    foto: new FormControl(''),
    stock: new FormControl('', [Validators.required, Validators.min(1), Validators.max(9999)]),
    fecha_registro: new FormControl(this.obtenerFechaActual()),
    stock_minimo: new FormControl('', [Validators.required, Validators.min(1), Validators.max(9999)]),
    id_categoria: new FormControl('', [Validators.required]),
    sub_categoria: new FormControl(''),
    id_unidad_medida: new FormControl(1, [Validators.required]),
    id_marca: new FormControl('', [Validators.required])
  })
  get control() {
    return this.productoForm.controls
  }

  get controlMarca() {
    return this.marcaForm.controls
  }
  Listar() {
    this.ProSer.getListaProductos().subscribe((lista) => {
      this.apiProductos = lista
    })
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('Foto seleccionada:', file);
      this.productoForm.patchValue({ foto: file.name });
    }
  }

  abrirModalNuevo() {
    this.isEditMode = false
    this.modalTitle = 'Nuevo Producto'
    this.idProducto = 0
    this.productoForm.reset({
      estado: '1',
      fecha_registro: this.obtenerFechaActual(),
      id_unidad_medida: 1,
      sub_categoria: ''
    })
    this.selectedFile = null
    this.codigoDuplicado = false
    // Resetear variables de categoría
    this.categoriaSeleccionada = null
    this.subCategorias = []
    this.subcategoriaSeleccionada = null
    this.abrirModal()
  }

  abrirModal() {
    if (this.modalAgregar) {
      this.modalAgregar.show(); // Abre el modal
    }
  }

  cargarDatosProducto(producto: any) {
    this.isEditMode = true
    this.modalTitle = 'Modificar Producto'
    this.idProducto = producto.id_producto

    // Configurar categoría y subcategoría
    if (producto.categorium) {
      // Si tiene id_categoria_padre, es una subcategoría
      if (producto.categorium.id_categoria_padre) {
        // Es subcategoría
        const categoriaPadreId = producto.categorium.id_categoria_padre;
        this.categoriaSeleccionada = this.apiCategorias.find(c => c.id_categoria === categoriaPadreId) || null;

        if (this.categoriaSeleccionada && this.categoriaSeleccionada.subCategoria) {
          this.subCategorias = this.categoriaSeleccionada.subCategoria;
          // Buscar la subcategoría donde subCategoria.id_categoria == producto.categorium.id_categoria
          const subcatEncontrada = this.subCategorias.find(sub => sub.id_categoria === producto.categorium.id_categoria);
          this.subcategoriaSeleccionada = subcatEncontrada ? subcatEncontrada.id_categoria : null;
        } else {
          this.subCategorias = [];
          this.subcategoriaSeleccionada = null;
        }
      } else {
        // Es categoría principal
        this.categoriaSeleccionada = this.apiCategorias.find(c => c.id_categoria === producto.id_categoria) || null;

        if (this.categoriaSeleccionada && this.categoriaSeleccionada.subCategoria) {
          this.subCategorias = this.categoriaSeleccionada.subCategoria;
        } else {
          this.subCategorias = [];
        }

        this.subcategoriaSeleccionada = null;
      }
    }

    this.productoForm.patchValue({
      nombre: producto.nombre,
      codigo: producto.codigo,
      descripcion: producto.descripcion,
      estado: producto.estado,
      precio_compra: producto.precio_compra,
      precio_venta: producto.precio_venta,
      foto: producto.foto,
      stock: producto.stock,
      fecha_registro: producto.fecha_registro,
      stock_minimo: producto.stock_minimo,
      id_categoria: this.categoriaSeleccionada?.id_categoria || '',
      sub_categoria: this.subcategoriaSeleccionada || '',
      id_unidad_medida: producto.id_unidad_medida,
      id_marca: producto.id_marca
    })
    this.codigoDuplicado = false
  }
  guardarProducto() {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched()
      return
    }

    // Determinar el id_categoria final: si hay subcategoría, usar esa; sino, la categoría
    const subCategoriaId = this.productoForm.get('sub_categoria')?.value;
    const categoriaId = this.productoForm.get('id_categoria')?.value;
    const idCategoriaFinal = subCategoriaId || categoriaId;

    // Actualizar el id_categoria con el valor final
    this.productoForm.patchValue({ id_categoria: idCategoriaFinal });

    if (this.isEditMode) {
      this.actualizarProducto()
    } else {
      this.crearProducto()
    }
  }

  crearProducto() {
    const formData = new FormData();
    const producto = this.productoForm.getRawValue();
    producto.fecha_registro = this.obtenerFechaActual();
    producto.estado = '1';

    // Eliminar sub_categoria del objeto ya que no se envía al backend
    delete producto.sub_categoria;

    formData.append('producto', JSON.stringify(producto));
    if (this.selectedFile) {
      formData.append('foto', this.selectedFile);
    }

    this.ProSer.saveProductos(formData).subscribe({
      next: (data) => {
        console.log('Producto creado:', data);
        this.Listar()
        this.productoForm.reset()
        this.selectedFile = null
        this.exito = true
        this.mensajeToast = 'Producto creado exitosamente'
        this.mostrarToast()
        this.cerrarModal()
      },
      error: (error) => {
        console.error('Error al crear producto:', error);
        this.exito = false
        this.mensajeToast = 'Error al crear el producto'
        this.mostrarToast()
      }
    })
  }
  idProducto: number = 0

  /**
   * Valida en keyup que el código ingresado no esté duplicado en la lista de productos.
   * Excluye el producto que se está editando (si aplica, por idProducto).
   */
  validarCodigo(event: any) {
    const val = (event.target.value || '').toString().toUpperCase().trim();
    if (!val) {
      this.codigoDuplicado = false;
      // limpiar posible error adicional
      const ctrl = this.productoForm.get('codigo');
      if (ctrl?.errors) {
        const errs = { ...ctrl.errors };
        if (errs['duplicate']) {
          delete errs['duplicate'];
          const hasOther = Object.keys(errs).length > 0;
          ctrl.setErrors(hasOther ? errs : null);
        }
      }
      return;
    }

    const exists = this.apiProductos.some(p => {
      // excluir el producto que estamos editando
      if (this.idProducto && p.id_producto === this.idProducto) return false;
      return (p.codigo || '').toString().toUpperCase().trim() === val;
    });

    this.codigoDuplicado = exists;

    const ctrl = this.productoForm.get('codigo');
    if (exists) {
      // añadir error de duplicado sin borrar otros errores
      const prev = ctrl?.errors || {};
      ctrl?.setErrors({ ...prev, duplicate: true });
    } else {
      // eliminar solo la clave duplicate de los errores si existe
      if (ctrl?.errors && ctrl.errors['duplicate']) {
        const errs = { ...ctrl.errors };
        delete errs['duplicate'];
        const hasOther = Object.keys(errs).length > 0;
        ctrl.setErrors(hasOther ? errs : null);
      }
    }
  }
  actualizarProducto() {
    const producto = {
      id_producto: this.idProducto,
      ...this.productoForm.getRawValue()
    }

    // Eliminar sub_categoria del objeto ya que no se envía al backend
    delete producto.sub_categoria;

    const formData = new FormData();
    formData.append('producto', JSON.stringify(producto));

    if (this.selectedFile) {
      formData.append('foto', this.selectedFile);
    }

    this.ProSer.modificarProducto(formData).subscribe({
      next: (data) => {
        console.log('Producto actualizado:', data);
        this.Listar()
        this.productoForm.reset()
        this.selectedFile = null
        this.exito = true
        this.mensajeToast = 'Producto actualizado exitosamente'
        this.mostrarToast()
        this.cerrarModal()
      },
      error: (error) => {
        console.error('Error al actualizar producto:', error);
        this.exito = false
        this.mensajeToast = 'Error al actualizar el producto'
        this.mostrarToast()
      }
    })
  }

  mostrarToast() {
    const toastEl = document.getElementById('toastProducto');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  cerrarModal() {
    console.log("cerrar modal");
    if (this.modalAgregar) {
      this.modalAgregar.hide(); // Cierra el modal

      // Eliminar TODOS los backdrops que puedan existir
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        // Remover la clase modal-open del body
        document.body.classList.remove('modal-open');

        // Habilita el scroll del body (Bootstrap lo desactiva)
        document.body.style.overflow = '';
        document.body.style.paddingRight = ''; // Elimina el padding que añade Bootstrap
      }, 100);
    }
  }
  detProducto: any
  Detalle(pro: any) {
    this.detProducto = pro
  }


  obtenerFechaActual(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0'); // meses empiezan en 0
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  proSeleccionado: any = null;
  estadoTemporal: number = 0;
  showModal(event: Event, usu: any) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    // Revertir el cambio visual hasta que confirme
    input.checked = usu.estado == 1;
    // Guardamos referencia al cliente y estado temporal
    this.proSeleccionado = usu;
    this.estadoTemporal = isChecked ? 1 : 2;
    // Mostramos modal dinámico
    const modal = new bootstrap.Modal(document.getElementById('estadoModal')!);
    modal.show();
  }
  cancelarCambio() {
    this.proSeleccionado = null;
  }



  guardarCambio() {
    if (this.proSeleccionado) {
      this.proSeleccionado.estado = this.estadoTemporal;
      this.ProSer.modificarProducto(this.proSeleccionado).subscribe({
        next: (data) => {
          console.log('Estado actualizado:', data);
          this.Listar()
          this.exito = true
          this.mensajeToast = `Producto ${this.estadoTemporal == 1 ? 'activado' : 'desactivado'} exitosamente`
          this.mostrarToast()
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
          this.exito = false
          this.mensajeToast = 'Error al cambiar el estado'
          this.mostrarToast()
        }
      })
    }
    this.proSeleccionado = null;
  }
  limpiar() {
    this.productoForm.reset({
      estado: '1',
      fecha_registro: this.obtenerFechaActual(),
      id_unidad_medida: 1,
      sub_categoria: ''
    })
    this.selectedFile = null
    this.codigoDuplicado = false
    this.isEditMode = false
    this.modalTitle = 'Nuevo Producto'
    this.idProducto = 0
    // Resetear variables de categoría
    this.categoriaSeleccionada = null
    this.subCategorias = []
    this.subcategoriaSeleccionada = null
  }

  // ========== MÉTODOS PARA MODAL DE MARCA ==========
  abrirModalMarca() {
    this.marcaForm.reset({ estado: '1' });
    if (this.modalMarca) {
      this.modalMarca.show();
    }
  }

  cerrarModalMarca() {
    if (this.modalMarca) {
      this.modalMarca.hide();
      // Restaurar el backdrop del modal principal si está abierto
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        // Eliminar todos los backdrops excepto uno si el modal principal está abierto
        if (this.modalAgregarRef.nativeElement.classList.contains('show')) {
          backdrops.forEach((backdrop, index) => {
            if (index > 0) backdrop.remove();
          });
          document.body.classList.add('modal-open');
        } else {
          backdrops.forEach(b => b.remove());
          document.body.classList.remove('modal-open');
        }
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }, 100);
    }
  }

  guardarMarca() {
    if (this.marcaForm.invalid) {
      this.marcaForm.markAllAsTouched();
      return;
    }

    const marca = this.marcaForm.value;
    this.MarSer.saveMarca(marca).subscribe({
      next: (response) => {
        console.log('Marca creada:', response);
        // Agregar la nueva marca a la lista
        this.apiMarcas.push(response);
        // Seleccionar automáticamente la nueva marca
        this.productoForm.patchValue({ id_marca: response.id_marca });
        this.cerrarModalMarca();
        this.exito = true;
        this.mensajeToast = 'Marca creada exitosamente';
        this.mostrarToast();
      },
      error: (error) => {
        console.error('Error al crear marca:', error);
        this.exito = false;
        this.mensajeToast = 'Error al crear la marca';
        this.mostrarToast();
      }
    });
  }

  // ========== MÉTODOS PARA FILTROS DE CATEGORÍA/SUBCATEGORÍA ==========
  onFiltroCategoriaPrincipalChange(event: any) {
    const categoriaId = event.target.value;
    this.categoria = categoriaId;
    this.subcategoria = '';

    if (categoriaId) {
      const categoriaSeleccionada = this.apiCategorias.find(c => c.id_categoria == categoriaId);
      if (categoriaSeleccionada && categoriaSeleccionada.subCategoria && categoriaSeleccionada.subCategoria.length > 0) {
        this.subCategoriasFiltro = categoriaSeleccionada.subCategoria;
      } else {
        this.subCategoriasFiltro = [];
      }
    } else {
      this.subCategoriasFiltro = [];
    }
  }

  // ========== MÉTODOS PARA CATEGORÍA/SUBCATEGORÍA DEL FORMULARIO ==========
  onCategoriaChange(event: any) {
    const categoriaId = parseInt(event.target.value);
    this.categoriaSeleccionada = this.apiCategorias.find(c => c.id_categoria === categoriaId) || null;

    if (this.categoriaSeleccionada && this.categoriaSeleccionada.subCategoria && this.categoriaSeleccionada.subCategoria.length > 0) {
      this.subCategorias = this.categoriaSeleccionada.subCategoria;
      this.subcategoriaSeleccionada = null;
      // Si hay subcategorías, esperar a que seleccione una
      this.productoForm.patchValue({
        id_categoria: categoriaId,
        sub_categoria: ''
      });
    } else {
      // No hay subcategorías, usar la categoría padre
      this.subCategorias = [];
      this.subcategoriaSeleccionada = null;
      this.productoForm.patchValue({
        id_categoria: categoriaId,
        sub_categoria: ''
      });
    }
  }

  onSubcategoriaChange(event: any) {
    const subcategoriaId = parseInt(event.target.value);
    if (subcategoriaId) {
      // Si se selecciona una subcategoría, guardarla en sub_categoria
      this.subcategoriaSeleccionada = subcategoriaId;
      this.productoForm.patchValue({ sub_categoria: subcategoriaId });
    } else {
      // Si no se selecciona subcategoría, limpiar
      this.subcategoriaSeleccionada = null;
      this.productoForm.patchValue({ sub_categoria: '' });
    }
  }
}
