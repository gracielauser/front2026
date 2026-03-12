import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators, FormArray } from '@angular/forms';
import { DetallePedido } from '../../Modelos/detalle-pedido';
import { Pedido } from '../../Modelos/pedido';
import { Producto } from '../../Modelos/producto';
import { Proveedor } from '../../Modelos/proveedor';
import { DetallepedidoService } from '../../Servicios/detallepedido.service';
import { ProveedorService } from '../../Servicios/proveedor.service';
import { CommonModule } from '@angular/common';
import { Compra } from '../../Modelos/compra';
import { CompraService } from '../../Servicios/compra.service';
import { InventarioService } from '../../Servicios/inventario.service';
import { Categoria } from '../../Modelos/categoria';
import { NgxPaginationModule } from 'ngx-pagination';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { ProveedorPipe } from '../../Filtros/proveedor.pipe';
import { NroCompraPipe } from '../../Filtros/nro-compra.pipe';
import { ProductoService } from '../../Servicios/producto.service';
import { NombrePipe } from '../../Filtros/nombre.pipe';
import { Modal } from 'bootstrap';
import { FechasPipe } from "../../Filtros/fechas.pipe";
import { CategoriaService } from '../../Servicios/categoria.service';
import { UnidadMedidaService } from '../../Servicios/unidad-medida.service';
import { MarcaService } from '../../Servicios/marca.service';

@Component({
  selector: 'app-compras',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NombrePipe,
    NroCompraPipe, ProveedorPipe, EstadoPipe, NgxPaginationModule, FechasPipe],
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css']
})
export class ComprasComponent implements OnInit, AfterViewInit {

  // Referencias a modales
  @ViewChild('modalAgregar') modalAgregarRef!: ElementRef;
  @ViewChild('modalDetalle') modalDetalleRef!: ElementRef;
  @ViewChild('modalRecepcion') modalRecepcionRef!: ElementRef;
  @ViewChild('modalAnular') modalAnularRef!: ElementRef;
  @ViewChild('modalAgregarProducto') modalAgregarProductoRef!: ElementRef;
  @ViewChild('modalProveedor') modalProveedorRef!: ElementRef;
  @ViewChild('modalMarca') modalMarcaRef!: ElementRef;

  private modalAgregar?: Modal;
  private modalDetalle?: Modal;
  private modalRecepcion?: Modal;
  private modalAnular?: Modal;
  private modalProductoRapido?: Modal;
  private modalProveedor?: Modal;
  private modalMarca?: Modal;

  apiCompra:any = []
  apiProveedor:any[]=[]
  apiProductos: any[] = []
  apiPedidos: Pedido[] = []
  apiProveedores: Proveedor[] = []
  apiCategorias: Categoria[] = []
  apiMarcas: any[] = []
  apiUnidadesMedida: any[] = []
  detallesCompra: any = []
  subCategoriasCompra: Categoria[] = []

  proveedor=0
  nrocompra:string=''
  nombre:string=''
  mostrarLista: boolean = false;
  estado=''
  page:number=1
  exito: boolean = true
  mensajeToast: string = ''
  constructor(
        private ComSer: CompraService,
        private ProSer: ProveedorService,
        private ProducSer: ProductoService,
        private DetCSer: DetallepedidoService,
        private InvSer: InventarioService,
        private CatSer: CategoriaService,
        private UniMedSer: UnidadMedidaService,
        private MarSer: MarcaService
  ) { }

  ngAfterViewInit(): void {
    // Inicializa los modales de Bootstrap
    this.modalAgregar = new Modal(this.modalAgregarRef.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalDetalle = new Modal(this.modalDetalleRef.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalRecepcion = new Modal(this.modalRecepcionRef.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalAnular = new Modal(this.modalAnularRef.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalProductoRapido = new Modal(this.modalAgregarProductoRef.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalProveedor = new Modal(this.modalProveedorRef.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalMarca = new Modal(this.modalMarcaRef.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
  }

  // ==================== MÉTODOS DE CONTROL DE MODALES ====================

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

  abrirModalRecepcion(): void {
    if (this.modalRecepcion) {
      this.modalRecepcion.show();
    }
  }

  cerrarModalRecepcion(): void {
    if (this.modalRecepcion) {
      this.modalRecepcion.hide();
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

  abrirModalAgregarProducto(): void {
    this.productoFormCompra.reset({
      nombre: '',
      codigo: '0',
      id_categoria: '',
      sub_categoria: '',
      id_unidad_medida: 1,
      id_marca: '',
      precio_compra: '',
      precio_venta: ''
    });
    this.subCategoriasCompra = [];
    if (this.modalProductoRapido) {
      this.modalProductoRapido.show();
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 1) {
          const lastBackdrop = backdrops[backdrops.length - 1] as HTMLElement;
          lastBackdrop.style.zIndex = '1055';
        }
      }, 100);
    }
  }

  cerrarModalAgregarProducto(): void {
    if (this.modalProductoRapido) {
      this.modalProductoRapido.hide();
      this.limpiarBackdrop();
    }
  }

  abrirModalProveedor(): void {
    this.proveedorForm.reset({ ciudad: 'Tarija' });
    if (this.modalProveedor) {
      // Ajustar z-index del backdrop del modal de proveedor
      this.modalProveedor.show();
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 1) {
          const lastBackdrop = backdrops[backdrops.length - 1] as HTMLElement;
          lastBackdrop.style.zIndex = '1055';
        }
      }, 100);
    }
  }

  cerrarModalProveedor(): void {
    if (this.modalProveedor) {
      this.modalProveedor.hide();
      this.limpiarBackdrop();
    }
  }

  guardarProveedor(): void {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      return;
    }

    const datosProveedor = {
      nombre: this.proveedorForm.get('nombre')?.value,
      celular: this.proveedorForm.get('celular')?.value,
      correo: this.proveedorForm.get('email')?.value,
      ciudad: this.proveedorForm.get('ciudad')?.value,
      direccion: this.proveedorForm.get('direccion')?.value,
      estado: 1
    };

    this.ProSer.saveProveedor(datosProveedor).subscribe({
      next: (response) => {
        console.log('Proveedor guardado:', response);
        // Agregar el nuevo proveedor a la lista
        this.apiProveedor.push(response);
        // Seleccionar automáticamente el nuevo proveedor
        this.compraForm.patchValue({ id_proveedor: response.id_proveedor });
        this.cerrarModalProveedor();
        this.proveedorForm.reset();
        this.mostrarToast(true, 'Proveedor guardado exitosamente');
      },
      error: (error) => {
        console.error('Error al guardar proveedor:', error);
        this.mostrarToast(false, 'Error al guardar el proveedor');
      }
    });
  }

  abrirModalMarca(): void {
    this.marcaForm.reset({ estado: '1' });
    if (this.modalMarca) {
      this.modalMarca.show();
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 1) {
          // Ajustar z-index del último backdrop (marca) para que esté sobre el de producto rápido
          const lastBackdrop = backdrops[backdrops.length - 1] as HTMLElement;
          lastBackdrop.style.zIndex = '1065';
        }
      }, 100);
    }
  }

  cerrarModalMarca(): void {
    if (this.modalMarca) {
      this.modalMarca.hide();
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        // Eliminar todos los backdrops excepto los necesarios
        if (this.modalProductoRapido && this.modalAgregarProductoRef.nativeElement.classList.contains('show')) {
          // Mantener solo el backdrop del modal de producto rápido
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

  guardarMarca(): void {
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
        this.productoFormCompra.patchValue({ id_marca: response.id_marca });
        this.cerrarModalMarca();
        this.marcaForm.reset();
        this.mostrarToast(true, 'Marca creada exitosamente');
      },
      error: (error) => {
        console.error('Error al crear marca:', error);
        this.mostrarToast(false, 'Error al crear la marca');
      }
    });
  }

  limpiarBackdrop(): void {
    // Elimina todos los backdrops residuales
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    // Habilita el scroll del body
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0';
    document.body.classList.remove('modal-open');
  }

  // ==================== MÉTODOS PRINCIPALES ====================

  nuevaCompra(){
    this.detallesCompra = [];
    this.nextNumber = this.apiCompra.length + 1;
    this.nroCompra = 'C' + this.nextNumber.toString().padStart(3, '0');
    this.compraForm.reset({
      fecha_registro: this.obtenerFechaActual(),
      nro_compra: this.nroCompra,
      monto_total: '0',
      estado: 'Pendiente',
      id_usuario: this.obtenerUsuario(),
      id_proveedor: ''
    });
    this.abrirModalAgregar();
  }
filtrarProducto(event: any){
  const valor=event.target.value.trim().toLowerCase();
  this.nombre = valor;
  this.mostrarLista=valor.length>0;
}
  ngOnInit(): void {
    this.listarCompra()
    this.listarP()
    this.listarPro()
    this.cargarCategorias()
    this.cargarUnidadesMedida()
    this.cargarMarcas()
    this.obtenerFechaActual()
    // Flag para controlar errores en las cantidades de recepción
    this.errorCantidades = false;
  }
  listarCompra() {
    this.ComSer.getListaCompra().subscribe(algo => {
      this.apiCompra = algo
      console.log("compraaa",this.apiCompra);
    })
  }
  compraParaAnular:any

  anularCompra(compra:any){
    this.compraParaAnular=compra;
    this.abrirModalAnular();
  }

  confirmarAnular(){
    this.ComSer.anular(this.compraParaAnular.id_compra).subscribe({
      next: (data) => {
        console.log('Respuesta despues de anular: ', data);
        this.listarCompra();
        this.cerrarModalAnular();
        this.mostrarToast(true, 'Compra anulada exitosamente');
      },
      error: (error) => {
        console.error('Error al anular compra:', error);
        this.mostrarToast(false, 'Error al anular la compra');
      }
    });
  }
  listarP() {
    this.ProSer.getListaProveedor().subscribe(algo => {
      this.apiProveedor = algo.filter(p => p.estado == 1) // Solo proveedores activos
      console.log('Proveedores:', this.apiProveedor);
    })
  }
  listarPro(){
    this.ProducSer.getListaProductos().subscribe(algo=>{
      this.apiProductos=algo
      console.log("productos",this.apiProductos);
    })
  }

  cargarCategorias() {
    this.CatSer.getListaCategoria().subscribe((lista) => {
      this.apiCategorias = lista
      console.log("categorias", this.apiCategorias);
    })
  }

  cargarUnidadesMedida() {
    this.UniMedSer.getListaUnidades().subscribe((lista) => {
      this.apiUnidadesMedida = lista
      console.log("unidades de medida", this.apiUnidadesMedida);
    })
  }

  cargarMarcas() {
    this.MarSer.getListaMarcas().subscribe((lista) => {
      this.apiMarcas = lista
      console.log("marcas", this.apiMarcas);
    })
  }

  obtenerUsuario(): string {
    const usuario: any = JSON.parse(localStorage.getItem('usuario'))
    console.log('usuario con persona',usuario);
    const nombre: string = usuario.empleado.nombre+ " " + usuario.empleado.ap_paterno+' '+usuario.empleado.ap_materno
    return nombre
  }
  // Supongamos que apiCompra es el array con todas las compras
 nextNumber:number = this.apiCompra.length + 1;
// Genera el código con ceros a la izquierda
 nroCompra = 'C' + this.nextNumber.toString().padStart(3, '0');

  compraForm = new UntypedFormGroup({
    fecha_registro: new FormControl(this.obtenerFechaActual(), [Validators.required]),
    nro_compra: new FormControl(this.nroCompra, [Validators.required]),
    monto_total: new FormControl('0'),
    estado: new FormControl('Pendiente'),
    fecha_recepcion: new FormControl(''),
    id_usuario: new FormControl(this.obtenerUsuario()),
    id_proveedor: new FormControl('', [Validators.required]),
  })
  get controlC() {
    return this.compraForm.controls;
  }
  detalleForm = new UntypedFormGroup({
    precio_unitario: new FormControl('',[Validators.required]),
    cantidad: new FormControl('',[Validators.required]),
    sub_total:new FormControl(''),
    id_producto: new FormControl('',[Validators.required]),
    id_compra: new FormControl(''),
  defectuosos: new FormControl(''),
  cantidad_recibida: new FormControl(''),
  })
  get controlD(){
    return this.detalleForm.controls;
  }

  proveedorForm = new UntypedFormGroup({
    nombre: new FormControl('', Validators.required),
    celular: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')]),
    email: new FormControl('', [Validators.email]),
    ciudad: new FormControl('Tarija', Validators.required),
    direccion: new FormControl('')
  });

  get controlProveedor() {
    return this.proveedorForm.controls;
  }

  productoFormCompra = new UntypedFormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]),
    codigo: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    descripcion: new FormControl('', [Validators.maxLength(50)]),
    precio_compra: new FormControl('', [Validators.required, Validators.min(0.01)]),
    precio_venta: new FormControl('', [Validators.required, Validators.min(0.01)]),
    id_categoria: new FormControl('', [Validators.required]),
    sub_categoria: new FormControl(''),
    id_unidad_medida: new FormControl('', [Validators.required]),
    id_marca: new FormControl('', [Validators.required])
  });

  get controlProducto() {
    return this.productoFormCompra.controls;
  }

  marcaForm = new UntypedFormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    descripcion: new FormControl(''),
    estado: new FormControl('1', Validators.required)
  });

  get controlMarca() {
    return this.marcaForm.controls;
  }

  counterProductosNuevos = 1;

  onCategoriaChangeCompra(event: any) {
    const categoriaId = parseInt(event.target.value);
    const categoriaSeleccionada = this.apiCategorias.find(c => c.id_categoria === categoriaId) || null;

    if (categoriaSeleccionada && categoriaSeleccionada.subCategoria && categoriaSeleccionada.subCategoria.length > 0) {
      this.subCategoriasCompra = categoriaSeleccionada.subCategoria;
      this.productoFormCompra.patchValue({
        id_categoria: categoriaId,
        sub_categoria: ''
      });
    } else {
      this.subCategoriasCompra = [];
      this.productoFormCompra.patchValue({
        id_categoria: categoriaId,
        sub_categoria: ''
      });
    }
  }

  guardarProductoRapido() {
    if (this.productoFormCompra.invalid) {
      this.productoFormCompra.markAllAsTouched();
      return;
    }

    const subCategoriaId = this.productoFormCompra.get('sub_categoria')?.value;
    const categoriaId = this.productoFormCompra.get('id_categoria')?.value;
    const idCategoriaFinal = subCategoriaId || categoriaId;

    // Crear producto temporal con ID autogenerado que empieza con 'N'
    const productoNuevo = {
      id_producto: 'N' + this.counterProductosNuevos++,
      nombre: this.productoFormCompra.get('nombre')?.value,
      codigo: this.productoFormCompra.get('codigo')?.value,
      descripcion: this.productoFormCompra.get('descripcion')?.value,
      precio_compra: this.productoFormCompra.get('precio_compra')?.value,
      precio_venta: this.productoFormCompra.get('precio_venta')?.value,
      id_categoria: idCategoriaFinal,
      categorium: this.apiCategorias.find(c => c.id_categoria == idCategoriaFinal) || null,
      id_unidad_medida: this.productoFormCompra.get('id_unidad_medida')?.value,
      id_marca: this.productoFormCompra.get('id_marca')?.value,
      estado: 1,
      stock: 0,
      foto: 'default.png'
    };

    // Añadir a la lista de productos disponibles temporalmente
    this.apiProductos.push(productoNuevo);

    // Añadir automáticamente a la tabla de detalles
    const detalle: any = {
      cantidad: 1,
      precio_unitario: productoNuevo.precio_compra,
      sub_total: productoNuevo.precio_compra * 1,
      producto: productoNuevo,
      compra: null,
    };
    this.detallesCompra.push(detalle);
    this.CalcularTotal();

    // Cerrar modal y resetear formulario
    this.cerrarModalAgregarProducto();
    this.productoFormCompra.reset();
    this.mostrarToast(true, 'Producto agregado a la compra');
  }

  agregarDetalle() {
    const detalle: any = {
      cantidad:(this.detalleForm.get('cantidad')?.value<1)?1:this.detalleForm.get('cantidad').value,
      precio_unitario: this.detalleForm.get('precio_unitario')?.value,
      sub_total: this.detalleForm.get('precio_unitario')?.value * Number((this.detalleForm.get('cantidad').value<1)?1:this.detalleForm.get('cantidad').value),
      producto: this.detalleForm.get('id_producto')?.value,
      compra: null,
    }
    this.detallesCompra.push(detalle)
    this.detalleForm.reset()
    this.CalcularTotal()
  }

  quitar(i: number) {
    this.detallesCompra.splice(i, 1)
    this.CalcularTotal()
  }
  stotal:number=0
  CalcularTotal(){
    let stotal:number=0;
    for(let i=0;i<this.detallesCompra.length;i++){
      stotal=stotal+this.detallesCompra[i].sub_total
    }
    this.compraForm.patchValue({
     monto_total:stotal
    })
  }
  guardarCompra() {
    const fechaConHora = this.obtenerFechaConHora(this.compraForm.get('fecha_registro').value);

    const Compra: any = {
      fecha_registro: fechaConHora,
      nro_compra: this.compraForm.get('nro_compra').value,
      monto_total: this.compraForm.get('monto_total').value,
      estado: 1,
      id_proveedor: this.compraForm.get('id_proveedor').value,
      id_usuario: JSON.parse(localStorage.getItem('usuario')).id_usuario
    }
    console.log("compra : ", Compra);
    console.log("productos compra : ", this.detallesCompra);
    Compra.detalle=this.detallesCompra
    this.ComSer.saveCompra(Compra).subscribe(data => {
      this.compraForm.reset();
      this.cerrarModalAgregar();
      this.listarCompra();
    })
  }
  fechaD!:Date
  fechaA!:Date
  ponerFecha(e:any, tipo:number){
    const fecha = new Date(e.target.value);
    if(tipo ==1) this.fechaD=fecha
    else this.fechaA=fecha
  }
  detCompra?:any
  detalleCompra:any[]=[]
  errorCantidades: boolean = false;

  Detalle(compra:any){
    this.detCompra=compra;
    console.log('cantidad recibida: ',this.detCompra.det_compras[0].cantidad_recibida,' '+this.detCompra.det_compras[0].defectuosos);

    // Inicializa detalleCompra y valores por defecto para recepción
    this.detalleCompra = (compra.det_compras || []);
    // validar después de inicializar
    this.validarCantidades();
    this.abrirModalDetalle();
  }
  recibiendo(event:any,index:number){
    const det = this.detalleCompra[index];
    let valor = Number(event.target.value);
    if (isNaN(valor)) valor = 0;
    // Asegurar entero no negativo (si requiere decimales, ajustar aquí)
    if (!Number.isInteger(valor)) valor = Math.floor(valor);
    // Clamp entre 0 y la cantidad original
    if (valor < 0) valor = 0;
    if (valor > (det.cantidad_original ?? det.cantidad)) valor = (det.cantidad_original ?? det.cantidad);

    det.cantidad_recibida = valor;
  const max = (det.cantidad_original ?? det.cantidad) || 0;
  // No forzamos defectuosos aquí; quedan independientes
  det.valid_recibido = det.cantidad_recibida >= 0 && det.cantidad_recibida <= max;
  det.valid_defectuosos = Number(det.defectuosos) >= 0 && Number(det.defectuosos) <= max;
  this.validarCantidades();
  }
  defectuosos(event:any,index:number){
    const det = this.detalleCompra[index];
    let valor = Number(event.target.value);
    if (isNaN(valor)) valor = 0;
    if (!Number.isInteger(valor)) valor = Math.floor(valor);
    const max = (det.cantidad_original ?? det.cantidad) || 0;
    if (valor < 0) valor = 0;
    if (valor > max) valor = max;

  det.defectuosos = valor;
  // cantidad_recibida stays independent
  det.valid_defectuosos = det.defectuosos >= 0 && det.defectuosos <= max;
  det.valid_recibido = Number(det.cantidad_recibida) >= 0 && Number(det.cantidad_recibida) <= max;
  this.validarCantidades();
  }

  validarCantidades() {
    // Si alguna fila es inválida, activamos errorCantidades
    let anyInvalid = false;
    for (const d of this.detalleCompra) {
      const max = (d.cantidad_original ?? d.cantidad) || 0;
      const cr = Number(d.cantidad_recibida);
      const def = Number(d.defectuosos);
      if (isNaN(cr) || isNaN(def)) {
        anyInvalid = true;
        break;
      }
      // Validar rangos independientemente: 0 <= cr <= max, 0 <= def <= max
      if (cr < 0 || cr > max) {
        anyInvalid = true;
        break;
      }
      if (def < 0 || def > max) {
        anyInvalid = true;
        break;
      }
    }
    this.errorCantidades = anyInvalid;
  }
  CompraRecibida(){
    // No permitir envío si hay errores en las cantidades
    this.validarCantidades();
    if (this.errorCantidades) {
      console.warn('Hay errores en las cantidades. Corrija antes de confirmar la recepción.');
      return;
    }

    const modificacion={
      fechaRecepcion:  this.compraForm.get('fecha_recepcion')?.value,
      detalles: this.detalleCompra,
      idCompra: this.detCompra.id_compra
    }

    console.log('fecha compra recibida',modificacion);
    this.ComSer.recibirCompra(modificacion).subscribe((data)=>{
      console.log(data);
      this.listarCompra();
      this.cerrarModalRecepcion();
    })
  }

  obtenerFechaActual(): string {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0'); // meses empiezan en 0
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
  }

  obtenerFechaConHora(fecha: string): string {
    // Si la fecha ya viene con hora, retornarla tal cual
    if (fecha && fecha.includes(':')) {
      return fecha;
    }

    // Si no, agregarle la hora actual
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    return `${fecha} ${horas}:${minutos}:${segundos}`;
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Separar fecha y hora si existe
    const partes = fechaStr.split(' ');
    let fechaParte = partes[0];
    let horaParte = partes.slice(1).join(' ');

    // Parsear la fecha
    const [year, month, day] = fechaParte.split('-');
    const mesIndex = parseInt(month) - 1;
    const diaNum = parseInt(day);

    // Formatear: "8 Mar 2026, hh:mm:ss"
    return `${diaNum} ${meses[mesIndex]} ${year}${horaParte ? ', ' + horaParte : ''}`;
  }

  calcularTotalProductos(compra: any): number {
    if (!compra.det_compras || compra.det_compras.length === 0) return 0;
    return compra.det_compras.reduce((total: number, detalle: any) => total + (detalle.cantidad || 0), 0);
  }

  seleccionarCodigoProducto(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }
  generarPDF() {
  }

  bloquearTeclasInvalidas(event: KeyboardEvent) {
  const teclasBloqueadas = ['-', 'e', 'E', '+', '.', '0'];
  if (teclasBloqueadas.includes(event.key)) {
    event.preventDefault();
  }
}
  // Teclado específico para inputs de recepción (solo dígitos y teclas de control)
  bloquearTeclasSoloNumeros(event: KeyboardEvent) {
    const tecla = event.key;
    const teclasPermitidas = [
      '0','1','2','3','4','5','6','7','8','9',
      'Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'
    ];
    if (!teclasPermitidas.includes(tecla)) {
      event.preventDefault();
    }
  }
bloquearTeclasInvalidasPrecio(event: KeyboardEvent) {
  const tecla = event.key;

  // Permitir: números, punto, backspace, delete, tab, flechas
  const teclasPermitidas = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '.', 'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'
  ];

  // Bloquear: letras, signos, 'e', 'E', '+', '-'
  if (!teclasPermitidas.includes(tecla)) {
    event.preventDefault();
  }

  // Evitar más de un punto decimal
  const input = event.target as HTMLInputElement;
  if (tecla === '.' && input.value.includes('.')) {
    event.preventDefault();
  }
}


seleccionarProducto(producto: any) {
  this.nombre = producto.nombre;
  this.mostrarLista = false;
}

ocultarListaConRetraso() {
  // Evita que se cierre antes de hacer clic en un producto
  setTimeout(() => this.mostrarLista = false, 200);
}
agregarProductoATabla(producto: any, input:HTMLInputElement) {
  // Evita duplicados
  if (!this.detallesCompra.some(d => d.producto.id_producto === producto.id_producto)) {
    this.detallesCompra.push({
      producto: producto,
      precio_unitario: producto.precio_compra || 1,
      cantidad: 1,
      sub_total: producto.precio_compra || 1
    });
    this.actualizarSubtotal(this.detallesCompra.length - 1);
    this.CalcularTotal();
  }
  input.value = '';
    this.nombre = '';
    this.mostrarLista = false;
    setTimeout(() => input.focus(), 0);

}
actualizarPrecio(event: any, index: number) {
  const nuevoPrecio = Number(event.target.value);
  this.detallesCompra[index].precio_unitario = nuevoPrecio;
  this.actualizarSubtotal(index);
}
actualizarCantidad(event: any, index: number) {
  const nuevaCantidad = Number(event.target.value);
  this.detallesCompra[index].cantidad = nuevaCantidad;
  this.actualizarSubtotal(index);
}
actualizarSubtotal(index: number) {
  const detalle = this.detallesCompra[index];
  detalle.sub_total = (detalle.precio_unitario || 0) * (detalle.cantidad || 0);
  this.CalcularTotal();
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
      const Recepcion: any = {
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
    seleccionarFila(i: number, orden: Compra) {
      this.VerificarPedido(orden)
      this.resaltarFila(i)
    }

    /*VerificarPedido(ped: Pedido) {
      this.pedido = ped
      this.mostrar = !this.mostrar;
      this.DetCSer.detalles(ped.nroorden).subscribe(lista => {
        this.ApiDetallesPedido = lista
      })
    }*/
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


   VerificarPedido(ped: Pedido) {
     this.pedido = ped
     this.mostrar = !this.mostrar;
     this.DetCSer.detalles(ped.nroorden).subscribe(lista => {
       this.ApiDetallesPedido = lista
   console.log("lista del apidetalles ",this.ApiDetallesPedido);
   if (this.ApiDetallesPedido && this.ApiDetallesPedido.length > 0) {
     this.recepForm.patchValue({
       detalle_pedido: this.ApiDetallesPedido[0] , //Selecciona el primero o ajusta según lógica
     });
     console.log("paso",this.ApiDetallesPedido)
   }
     })

}

  mostrarToast(exito: boolean, mensaje: string): void {
    this.exito = exito;
    this.mensajeToast = mensaje;
    const toastElement = document.querySelector('.toast');
    if (toastElement) {
      const toast = new (window as any).bootstrap.Toast(toastElement);
      toast.show();
    }
  }

  // Indica si la recepción no es válida (fecha faltante o errores en cantidades)
  get recepcionInvalida(): boolean {
    const ctrl = this.compraForm.get('fecha_recepcion');
    const fechaInvalida = !ctrl || ctrl.invalid || !ctrl.value;
    return this.errorCantidades || fechaInvalida;
  }
}

