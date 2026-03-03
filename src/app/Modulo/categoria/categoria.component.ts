import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import * as bootstrap from 'bootstrap';
import { Categoria } from '../../Modelos/categoria';
import { CategoriaService } from '../../Servicios/categoria.service';
import { CommonModule } from '@angular/common';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { NombrePipe } from '../../Filtros/nombre.pipe';
@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EstadoPipe,NgxPaginationModule,FormsModule,NombrePipe],
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css']
})
export class CategoriaComponent implements OnInit {

  categoriaModel!: Categoria;
  apiCategoria: Categoria[] = []
estado='1'
 nombre:string=''
page:number=1
mensajeExito: string | null = null;
cambioEstado(event: any){
  this.estado=event.target.value
}
  constructor(
    private catser: CategoriaService
  ) { }

  ngOnInit(): void {
    this.Listar()
  }
  cateForm = new UntypedFormGroup({
    nombre: new UntypedFormControl('', Validators.required),
    descripcion: new UntypedFormControl(''),
    estado: new UntypedFormControl('1')
  })
  get control() {
    return this.cateForm.controls
  }
  Listar() {
    this.catser.getListaCategoria().subscribe((lista) => {
      this.apiCategoria = lista;
    })
  }
  AgregarCategoria() {
    const Categoria = this.cateForm.value;
    this.catser.agregarCategoria(Categoria).subscribe({
      next: (data) => {
        console.log('devuelve: ', data.mensaje, data.nombre);
        this.Listar()
        this.cateForm.reset()
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
  idCategoria: number = 0;
  ModificarCategoria(cat: any) {
    this.idCategoria = cat.id_categoria;
    this.cateForm.patchValue({
      nombre: cat.nombre,
      descripcion: cat.descripcion,
      estado: cat.estado
    })
  }
  GuardarModificacion() {
     if (this.cateForm.invalid) {
      this.cateForm.markAllAsTouched(); // 👈 marca los errores
      return;
    }
    const categoria = {
      id_categoria: this.idCategoria,
      ...this.cateForm.value
    }
    console.log("categoria a modificar:", categoria);

    this.catser.modificarCategoria(categoria).subscribe({
      next: (data) => {
        console.log('Empleado modificado:', data.mensaje);
        this.Listar();
        this.cateForm.reset();
        this.mensajeExito = data.mensaje;
        this.idCategoria = 0;//reiniciamos el id
      }, error: (error) => {
        console.log('Error al modificar el empleado:', error);
      }
    })
    //mensaje de exito
    const toastEl = document.getElementById('toastExito');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
  catSeleccionado: any = null;
  estadoTemporal: number = 0;
  showModal(event: Event, usu: any) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    // Revertir el cambio visual hasta que confirme
    input.checked = usu.estado == 1;
    // Guardamos referencia al cliente y estado temporal
    this.catSeleccionado = usu;
    this.estadoTemporal = isChecked ? 1 : 2;
    // Mostramos modal dinámico
    const modal = new bootstrap.Modal(document.getElementById('estadoModal')!);
    modal.show();
  }
  cancelarCambio() {
    this.catSeleccionado = null;
  }
  guardarCambio() {
    if (this.catSeleccionado) {
      this.catSeleccionado.estado = this.estadoTemporal;
      this.catser.modificarCategoria(this.catSeleccionado).subscribe({
        next: (data) => {
          console.log('Estado modificado:', data.mensaje);
          this.Listar();
          this.mensajeExito = data.mensaje;
        },
        error: (error) => {
          console.log('Error al modificar el estado:', error);
        }
      });
    }
    this.catSeleccionado = null;
    //mensaje de exito
    const toastEl = document.getElementById('toastExito');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
}
