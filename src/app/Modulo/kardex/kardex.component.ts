import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { ProductoService } from '../../Servicios/producto.service';
import { Usuario } from '../../Modelos/usuario';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, FormsModule],
  templateUrl: './kardex.component.html',
  styleUrl: './kardex.component.css'
})
export class KardexComponent {
  apiProductos: any[] = []

  constructor(
    private ProSer: ProductoService
  ) {

  }
  rol: number

  ngOnInit(): void {
    // this.obtenerUsuario()
    this.ListarProductos()


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
    this.ProSer.getListaProductos().subscribe(data => {
      this.apiProductos = data
      console.log("productos", data);

    })
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
    motivo: new FormControl('', [Validators.required]),
    cantidad: new FormControl('', [Validators.required]),
    tipo_movimiento: new FormControl('entrada', [Validators.required]),
    fecha_registro: new FormControl(this.obtenerFechaActual())
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
 
 incrementar(): void {
  const control = this.movimientoForm.get('cantidad');
  if (control) {
    const valorActual = parseFloat(control.value) || 0; // Aseguramos que sea número
    control.setValue(parseFloat((valorActual + 1).toFixed(2)));
  }
}

decrementar(): void {
  const control = this.movimientoForm.get('cantidad');
  if (control) {
    let valorActual = parseFloat(control.value) || 0;
    if (valorActual > 0) {
      control.setValue(parseFloat((valorActual - 1).toFixed(2)));
    }
  }
}



}

