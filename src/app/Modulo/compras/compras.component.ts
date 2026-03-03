import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-compras',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NombrePipe,
    NroCompraPipe, ProveedorPipe, EstadoPipe, NgxPaginationModule, FechasPipe],
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css']
})
export class ComprasComponent implements OnInit {

  apiCompra:any = []
  apiProveedor:any[]=[]
  apiProductos: any[] = []
  apiPedidos: Pedido[] = []
  apiProveedores: Proveedor[] = []
  apiCategorias: Categoria[] = []
  detallesCompra: any = []

  proveedor=0
  nrocompra:string=''
  nombre:string=''
  mostrarLista: boolean = false;
  estado='1'
  page:number=1
  constructor(
        private ComSer: CompraService,
        private ProSer: ProveedorService,
        private ProducSer: ProductoService,
        private DetCSer: DetallepedidoService,
        private InvSer: InventarioService,
  ) { }

  nuevaCompra(){
    this.compraForm.reset()
    this.abrirModalNuevo()
  }
  @ViewChild('modalAgregar') modalAgregarRef!: ElementRef; // Referencia al modal
  private nuevaCompraModal?: Modal;
  @ViewChild('modalAgregarProducto') modalAgregarProductoRef!: ElementRef; // Referencia al modal
  private nuevoProductoModal?: Modal;
   ngAfterViewInit() {
    // Inicializa el modal de Bootstrap
    this.nuevaCompraModal = new Modal(this.modalAgregarRef.nativeElement);
    this.nuevoProductoModal = new Modal(this.modalAgregarProductoRef.nativeElement);
  }
  abrirModalNuevo(){//nueva compra modeal
    this.nuevaCompraModal?.show()
    this.nextNumber = this.apiCompra.length + 1;
  this.nroCompra = 'C' + this.nextNumber.toString().padStart(3, '0');

  this.compraForm.patchValue({
    fecha_registro: this.obtenerFechaActual(),
    nro_compra: this.nroCompra
  });
  }
  abrirModalProducto(){
    this.nuevoProductoModal?.show()
  }
 cerrarModal() {
    this.nuevaCompraModal?.hide(); // Cierra el modal agregar
    this.compraForm.reset(); // Limpia el formularios
    document.querySelector('.modal-backdrop')?.remove();
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0'; // Elimina el padding que añade Bootstrap
  }
  cerrarModalProducto() {
    this.nuevoProductoModal?.hide(); // Cierra el modal agregar
    //this.compraForm.reset(); // Limpia el formularios
    document.querySelector('.modal-backdrop')?.remove();
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0'; // Elimina el padding que añade Bootstrap
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
    this.obtenerFechaActual()
    this.compraForm.get('fecha_registro')?.disable()
  this.compraForm.get('nro_compra')?.disable()
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
    this.compraParaAnular=compra
  }
  confirmarAnular(){
    this.ComSer.anular(this.compraParaAnular.id_compra).subscribe((data)=>{
      console.log('Respuesta despues de anular: ',data);
      
      this.listarCompra()
    })
  }
  listarP() {
    this.ProSer.getListaProveedor().subscribe(algo => {
      this.apiProveedor = algo
      console.log('Proveedores:', this.apiProveedor);
    })
  }
  listarPro(){
    this.ProducSer.getListaProductos().subscribe(algo=>{
      this.apiProductos=algo
      console.log("productos",this.apiProductos);
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
    fecha_registro: new FormControl(this.obtenerFechaActual()),
    nro_compra: new FormControl(this.nroCompra),
    monto_total: new FormControl('0'),
    estado: new FormControl('Pendiente'),
    fecha_recepcion: new FormControl('', [Validators.required]),
    id_usuario: new FormControl(this.obtenerUsuario()),
    id_proveedor: new FormControl('',[Validators.required]),
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
    const Compra: any = {
      fecha_registro: this.compraForm.get('fecha_registro').value ,
      monto_total: this.compraForm.get('monto_total').value,
      estado: 1,
      id_proveedor: this.compraForm.get('id_proveedor').value.id_proveedor,
      id_usuario: JSON.parse(localStorage.getItem('usuario')).id_usuario
    }
    Compra.fecha_registro = this.obtenerFechaActual();
    Compra.estado=1
    console.log("compra : ", Compra);
    console.log("productos compra : ", this.detallesCompra);
    this.ComSer.saveCompra(Compra).subscribe(data => {
      console.log("vuelve creado", data);
      for(let i=0;i<this.detallesCompra.length;i++ ){
        this.detallesCompra[i].id_compra=data.id_compra
        this.detallesCompra[i].id_producto=this.detallesCompra[i].producto.id_producto
        this.DetCSer.saveDP(this.detallesCompra[i]).subscribe(()=>{
         if(i==this.detallesCompra.length-1){
          this.detalleForm.reset()
          this.detallesCompra=[]
         }
        })
      }
      this.compraForm.reset() 
      this.cerrarModal()//cierra el modal de la compra
      this.listarCompra()
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
  // Flag global que indica si existen errores en las cantidades ingresadas en la recepción
  errorCantidades: boolean = false;
  Detalle(compra:any){
    this.detCompra=compra
    console.log('cantida recibi: ',this.detCompra.det_compras[0].cantidad_recibida,' '+this.detCompra.det_compras[0].defectuosos);
    
   // Inicializa detalleCompra y valores por defecto para recepción
   this.detalleCompra = (compra.det_compras || [])
   // validar después de inicializar
   this.validarCantidades();
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
      this.listarCompra()
    })
  }

  obtenerFechaActual(): string {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0'); // meses empiezan en 0
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
      this.InvSer.saveRecepcionCompra(Recepcion).subscribe(() => {
        console.log("ggggg", Recepcion);
      })
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

  // Indica si la recepción no es válida (fecha faltante o errores en cantidades)
  get recepcionInvalida(): boolean {
    const ctrl = this.compraForm.get('fecha_recepcion');
    const fechaInvalida = !ctrl || ctrl.invalid || !ctrl.value;
    return this.errorCantidades || fechaInvalida;
  }
}

