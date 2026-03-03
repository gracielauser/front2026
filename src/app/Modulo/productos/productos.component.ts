import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';

import * as bootstrap from 'bootstrap';
import { Categoria } from '../../Modelos/categoria';
import { Producto } from '../../Modelos/producto';
import { CategoriaService } from '../../Servicios/categoria.service';
import { ProductoService } from '../../Servicios/producto.service';
import { ProveedorService } from '../../Servicios/proveedor.service';
import { CommonModule } from '@angular/common';
import { UnidadMedidaService } from '../../Servicios/unidad-medida.service';
import { MarcaService } from '../../Servicios/marca.service';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { CodigoPipe } from '../../Filtros/codigo.pipe';
import { NombrePipe } from '../../Filtros/nombre.pipe';
import { CategoriaPipe } from '../../Filtros/categoria.pipe';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, EstadoPipe,
    CodigoPipe, NombrePipe, CategoriaPipe, NgxPaginationModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  productosModel!: Producto;

  //*ngfor lists
  apiProductos: any[] = []
  apiCategorias: Categoria[] = []
  apiProveedores: any[] = []
  apiMarcas: any[] = []
  apiUnidadesMedida: any[] = []
  //flitros 
  codigo: string = ''
  nombre: string = ''
  categoria = ''
  estado = '1'
  page: number = 1
  mensajeExito: string | null = null;
  selectedFile: File | null = null;
  // flag para indicar si el código ingresado ya está en uso
  codigoDuplicado: boolean = false;
  constructor(
    private CatSer: CategoriaService,
    private ProSer: ProductoService,
    private ProvSer: ProveedorService,
    private UniMedSer: UnidadMedidaService,
    private MarSer: MarcaService
  ) { }

  ngOnInit(): void {
    this.CatSer.getListaCategoria().subscribe((lista) => {
      this.apiCategorias = lista
    })
    this.ProvSer.getListaProveedor().subscribe((lista) => {
      this.apiProveedores = lista
      console.log("proveedores", this.apiProveedores);
    })
    this.listar()
    this.productoForm.get('fecha_registro').disable()
  }
  listar() {
    this.ProSer.getListaProductos().subscribe((lista) => {
      this.apiProductos = lista
      console.log("productos", this.apiProductos);

    })
    this.MarSer.getListaMarcas().subscribe((lista) => {
      this.apiMarcas = lista
      console.log("marcas", this.apiMarcas);
    })
    this.UniMedSer.getListaUnidades().subscribe((lista) => {
      this.apiUnidadesMedida = lista
      console.log("unidades de medida", this.apiUnidadesMedida);
    })
  }
  productoForm = new UntypedFormGroup({
    nombre: new FormControl('', [Validators.required]),
    codigo: new FormControl('', [Validators.required]),
    descripcion: new FormControl(''),
    estado: new FormControl('1'),
    precio_compra: new FormControl('', [Validators.required]),
    precio_venta: new FormControl('', [Validators.required]),
    foto: new FormControl(''),
    stock: new FormControl('', [Validators.required]),
    fecha_registro: new FormControl(this.obtenerFechaActual()),
    stock_minimo: new FormControl('', [Validators.required]),
    id_categoria: new FormControl('', [Validators.required]),
    id_proveedor: new FormControl('', [Validators.required]),
    id_unidad_medida: new FormControl('', [Validators.required]),
    id_marca: new FormControl('', [Validators.required])
  })
  get control() {
    return this.productoForm.controls
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
    console.log('foto seleccionada: ',file);
    
    // Si quieres guardar el nombre del archivo en el form control:
    this.productoForm.patchValue({ foto: file.name });
  }
}
  AgregarProducto() {
    const formData = new FormData();
    const producto = this.productoForm.getRawValue();
    producto.fecha_registro = this.obtenerFechaActual();
    producto.estado = '1';
    console.log("Producto", producto);

    formData.append('producto', JSON.stringify(producto));
    // Agregar el archivo:
  if (this.selectedFile) {
    formData.append('foto', this.selectedFile);
  }
    this.ProSer.saveProductos(formData).subscribe({
      next: (data) => {
        console.log('devuelve: ', data.mensaje, data.nombre);
        this.Listar()
        this.productoForm.reset();
        this.mensajeExito = data.mensaje;
      }, error: (error) => {
        console.log(error);
      }
    })
    //mensaje de exito
    const toastEl = document.getElementById('toastExito');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
  idProducto: number = 0
  modificarProducto(producto: any) {
    this.idProducto = producto.id_producto
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
      id_categoria: producto.id_categoria,
      id_proveedor: producto.id_proveedor,
      id_unidad_medida: producto.id_unidad_medida,
      id_marca: producto.id_marca
    })
  }

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
  guardarModificacion() {
    const producto = {
      id_producto: this.idProducto,
      ...this.productoForm.value
    }
    const formData = new FormData();
     formData.append('producto', JSON.stringify(producto));
    // Agregar el archivo:
  if (this.selectedFile) {
    formData.append('foto', this.selectedFile);
  }
    this.ProSer.modificarProducto(formData).subscribe({
      next: (data) => {
        console.log('devuelve: ', data.mensaje, data.nombre);
        this.Listar()
        this.productoForm.reset()
        this.mensajeExito = data.mensaje;
      }, error: (error) => {
        console.log(error);
      }
    })
    //mensaje de exito
    const toastEl = document.getElementById('toastExito');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
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
          console.log('devuelve: ', data.mensaje, data.nombre);
          this.Listar()
          this.productoForm.reset()
          this.mensajeExito = data.mensaje;
        }, error: (error) => {
          console.log(error);
        }
      })
    }
    this.proSeleccionado = null;
    //mensaje de exito
    const toastEl = document.getElementById('toastExito');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
  reset() {
    this.productoForm.reset()
  }
}
