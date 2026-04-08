import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UnidadMedidaService } from '../../Servicios/unidad-medida.service';
import * as bootstrap from 'bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { NombrePipe } from '../../Filtros/nombre.pipe';

@Component({
  selector: 'app-unidades',
  standalone:true,
    imports: [CommonModule, ReactiveFormsModule,NgxPaginationModule,FormsModule,EstadoPipe,NombrePipe],
  templateUrl: './unidades.component.html',
  styleUrl: './unidades.component.css'
})
export class UnidadesComponent {

page:number=1
nombre:string=''
estado='1'
mensajeExito: string | null = null;
  constructor(
    private unidadSer: UnidadMedidaService
  ){}
  apiUnidad:any[]=[]

uniForm=new FormGroup({
  nombre: new FormControl('', Validators.required),
  estado: new FormControl('1'),
  abreviatura: new FormControl('', Validators.required)
})
get control() {
    return this.uniForm.controls
  }
ngOnInit(){
this.listarUnidades();
}
listarUnidades(){
  this.unidadSer.getListaUnidades().subscribe(data => {
    this.apiUnidad = data;
    console.log('lista de unidaes: ',data);

  });
}
AgregarUnidad(){
  const unidad= this.uniForm.value
  console.log(unidad);

  this.unidadSer.saveUnidad(unidad).subscribe({
    next: (data) => {
      console.log('devuelve: ', data.mensaje, data.nombre);
      this.listarUnidades()
      this.uniForm.reset()
          this.mensajeExito = data.mensaje;
    }, error: (error) => {
      console.log(error);
    }
  }
  )
   //mensaje de exito
      const toastEl = document.getElementById('toastExito');
      if (toastEl) {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      }
}
idUnidad:number=0;
ModificarUnidad(uni:any){
  this.idUnidad=uni.id_unidad_medida;
  this.uniForm.patchValue({
    nombre:uni.nombre,
    abreviatura:uni.abreviatura,
    estado:uni.estado
  })
}
guardarModificacion(){
  const unidad={
    id_unidad_medida:this.idUnidad,
    ...this.uniForm.value
  }
  console.log(unidad);

  this.unidadSer.modificarUnidad(unidad).subscribe({
    next: (data) => {
      console.log('devuelve: ', data.mensaje, data.nombre);
      this.listarUnidades()
      this.uniForm.reset()
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

 rolSeleccionado: any = null;
    estadoTemporal: number = 0;
    showModal(event: Event, usu: any) {
      const input = event.target as HTMLInputElement;
      const isChecked = input.checked;
      // Revertir el cambio visual hasta que confirme
      input.checked = usu.estado == 1;
      // Guardamos referencia al empleado y estado temporal
      this.rolSeleccionado = usu;
      this.estadoTemporal = isChecked ? 1 : 2;
      // Mostramos modal dinámico
      const modal = new bootstrap.Modal(document.getElementById('estadoModal')!);
      modal.show();
    }
    cancelarCambio() {
      this.rolSeleccionado = null;
    }
    error: boolean = false;
guardarCambio() {
  if (this.rolSeleccionado) {
      this.rolSeleccionado.estado = this.estadoTemporal;
      this.unidadSer.modificarUnidad(this.rolSeleccionado).subscribe({
        next: (data) => {
          console.log('Estado modificado:', data.mensaje);
          this.listarUnidades();
          this.error = false;
          this.mensajeExito = data.mensaje;
        },
        error: (error) => {
          this.mensajeExito = error.data.mensaje || 'Error al modificar el estado';
          this.error = true;
        }
      })
    }
    this.rolSeleccionado = null;
//mensaje de exito
  const toastEl = document.getElementById('toastExito');
  if (toastEl) {
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}
}
