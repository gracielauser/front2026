import { Component } from '@angular/core';
import { MarcaService } from '../../Servicios/marca.service';

import * as bootstrap from 'bootstrap';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NombrePipe } from '../../Filtros/nombre.pipe';
import { EstadoPipe } from '../../Filtros/estado.pipe';
@Component({
  selector: 'app-marcas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NgxPaginationModule,FormsModule,NombrePipe,EstadoPipe],
  templateUrl: './marcas.component.html',
  styleUrl: './marcas.component.css'
})
export class MarcasComponent {
  apiMarca: any[] = []
  marcaModel: any;
  page:number=1
  nombre:string=''
estado='1'
mensajeExito: string | null = null;
  exito: boolean = false;
  mostrarAlerta(exito: boolean, mensaje: string) {
    this.exito = exito;
    this.mensajeExito = mensaje;
    const toastEl = document.getElementById('toastExito');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
  constructor(
    private marser: MarcaService
  ) { }

  ngOnInit(): void {
    this.Listar()
  }
  marcaForm = new UntypedFormGroup({
    nombre: new UntypedFormControl('', Validators.required),
    descripcion: new UntypedFormControl(''),
    estado: new UntypedFormControl('1', Validators.required)
  })
  get control() {
    return this.marcaForm.controls
  }
  Listar() {
    this.marser.getListaMarcas().subscribe((lista) => {
      this.apiMarca = lista;
    })
  }
  AgregarMarca() {
    this.marcaModel = {
      nombre: (this.marcaForm.get('nombre')?.value),
      descripcion: (this.marcaForm.get('descripcion')?.value),
      estado: (this.marcaForm.get('estado')?.value)
    }
    this.marser.saveMarca(this.marcaModel).subscribe({
      next: (data) => {
        console.log('devuelve: ', data.mensaje, data.nombre);
        this.Listar()
        this.marcaForm.reset()
        this.mostrarAlerta(true, 'Marca registrada correctamente');
      }, error: (error) => {
        console.log(error);
        this.mostrarAlerta(false, 'Error al agregar marca');
      }
    })
  }
  idMarca: number = 0
  ModificarMarca(marca: any) {
    this.idMarca=marca.id_marca
    this.marcaForm.patchValue({
      nombre: marca.nombre,
      descripcion:marca.descripcion,
      estado:marca.estado
    })
  }
GuardarModificacion(){
  const marca={
    id_marca:this.idMarca,
    ...this.marcaForm.value
  }
  this.marser.modificarMarca(marca).subscribe({
     next: (data) => {
      console.log('devuelve: ', data.mensaje, data.nombre);
      this.Listar()
      this.marcaForm.reset()
      this.mostrarAlerta(true, 'Marca actualizada correctamente');
    }, error: (error) => {
      console.log(error);
      this.mostrarAlerta(false, 'Error al actualizar marca');
    }
  })
}
  marcaSeleccionado: any = null;
  estadoTemporal: number = 0;
  showModal(event: Event, usu: any) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    // Revertir el cambio visual hasta que confirme
    input.checked = usu.estado == 1;
    // Guardamos referencia al cliente y estado temporal
    this.marcaSeleccionado = usu;
    this.estadoTemporal = isChecked ? 1 : 2;
    // Mostramos modal dinámico
    const modal = new bootstrap.Modal(document.getElementById('estadoModal')!);
    modal.show();
  }
  cancelarCambio() {
    this.marcaSeleccionado = null;
  }
  guardarCambio() {
    if (this.marcaSeleccionado) {
      this.marcaSeleccionado.estado = this.estadoTemporal;
      this.marser.modificarMarca(this.marcaSeleccionado).subscribe({
        next:(data)=> {
          console.log('Estado modificado:', data.mensaje);
          this.Listar();
          this.mostrarAlerta(true, this.estadoTemporal === 1 ? 'Marca activada correctamente' : 'Marca desactivada correctamente');
        },
        error: (error) => {
          console.log('Error al modificar el estado:', error);
          this.mostrarAlerta(false, this.estadoTemporal === 1 ? 'Error al activar marca' : 'Error al desactivar marca');
        }
      })
    }
    this.marcaSeleccionado = null;


}}

