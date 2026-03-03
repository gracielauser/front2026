import { Component } from '@angular/core';

import * as bootstrap from 'bootstrap';
import { GastoService } from '../../Servicios/gasto.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriagPipe } from '../../Filtros/categoriag.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule,CategoriagPipe,NgxPaginationModule],
  templateUrl: './gastos.component.html',
  styleUrl: './gastos.component.css'
})
export class GastosComponent {

  apiGasto:any[]=[]
  categoria=''
  page:number=1
   mensajeExito: string | null = null;
  constructor(
    private gastoSer:GastoService
  ) { }

  ngOnInit(): void {
    this.Listar()
  }
  gastoForm=new FormGroup({
    fecha:new FormControl(this.obtenerFechaActual()),
    descripcion:new FormControl(''),
    estado:new FormControl('1'),
    monto:new FormControl('',Validators.required,),
    categoria:new FormControl('',Validators.required),
    id_usuario:new FormControl(this.obtenerUsuario())
  })
  get control() {
    return this.gastoForm.controls
  }
  Listar(){
    this.gastoSer.getListaGasto().subscribe((lista)=>{
      this.apiGasto=lista;
      console.log("Lista de Gastos:", this.apiGasto);
    })
  }
  AgregarGasto(){
   const gasto=this.gastoForm.getRawValue()
   console.log("aquii",gasto);
    this.gastoSer.saveGasto(gasto).subscribe({
       next: (data) => {
        console.log('devuelve: ', data.mensaje, data.nombre);
        this.Listar()
        this.gastoForm.reset({
      fecha:this.obtenerFechaActual(),
      id_usuario:this.obtenerUsuario(),
      descripcion:'',
      estado:'1'
})
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
  anular(){

  }
  obtenerFechaActual(): string {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0'); // meses empiezan en 0
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
  }
    obtenerUsuario(){
    const usuario: any = JSON.parse(localStorage.getItem('usuario'))
    console.log('usuario logueado',usuario);
    const id_usuario = usuario.id_usuario
    return id_usuario
}
gastoSeleccionado: any = null;
  showModal( gasto: any) {
    // Guardamos referencia al cliente y estado temporal
    this.gastoSeleccionado = gasto;
    const modal = new bootstrap.Modal(document.getElementById('estadoModal')!);
    modal.show();
  }
  cancelarCambio() {
    this.gastoSeleccionado = null;
  }
  guardarCambio() {
    if (this.gastoSeleccionado) {
      this.gastoSeleccionado.estado = 0;//como es anulacion ponemos el estado que significa anulado osea 0
      this.gastoSer.anularGasto(this.gastoSeleccionado).subscribe({
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
    this.gastoSeleccionado = null;
    //mensaje de exito
    const toastEl = document.getElementById('toastExito');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
 
}
