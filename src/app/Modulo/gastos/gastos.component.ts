import { Component } from '@angular/core';

import * as bootstrap from 'bootstrap';
import { GastoService } from '../../Servicios/gasto.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriagPipe } from '../../Filtros/categoriag.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { FechasPipe } from '../../Filtros/fechas.pipe';
@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule,CategoriagPipe,NgxPaginationModule,FechasPipe],
  templateUrl: './gastos.component.html',
  styleUrl: './gastos.component.css'
})
export class GastosComponent {

  apiGasto:any[]=[]
  categoria=''
  page:number=1
   mensajeExito: string | null = null;
  filtroFecha: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';
  enFiltroPersonalizado: boolean = false;
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
   const gasto=this.gastoForm.getRawValue();
   gasto.fecha = this.obtenerFechaActual();
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
    const hours = String(hoy.getHours()).padStart(2, '0');
    const minutes = String(hoy.getMinutes()).padStart(2, '0');
    const seconds = String(hoy.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
    obtenerUsuario(){
    const usuario: any = JSON.parse(localStorage.getItem('usuario'))
    console.log('usuario logueado',usuario);
    const id_usuario = usuario.id_usuario
    return id_usuario
}
gastoSeleccionado: any = null;
  showModal( gasto: any) {
    this.gastoSeleccionado = gasto;
  }
  cancelarCambio() {
    this.gastoSeleccionado = null;
  }

  formatFechaGasto(fecha: string | null | undefined): string {
    if (!fecha) {
      return '';
    }
    const [datePart, timePart] = fecha.split(' ');
    if (!datePart) {
      return fecha;
    }
    const [year, month, day] = datePart.split('-').map((value) => parseInt(value, 10));
    if (!year || !month || !day) {
      return fecha;
    }
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const fechaFormateada = `${day} ${meses[month - 1]} ${year}`;
    return timePart ? `${fechaFormateada}, ${timePart}` : fechaFormateada;
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

  onFiltroFechaChange(event: any): void {
    const valor = event.target.value;
    if (valor === 'rango personalizado') {
      this.enFiltroPersonalizado = true;
      this.fechaDesde = '';
      this.fechaHasta = '';
    } else {
      this.enFiltroPersonalizado = false;
      this.fechaDesde = '';
      this.fechaHasta = '';
    }
  }

  ponerFechaGasto(e: any, tipo: number): void {
    const fechaStr = e.target.value; // formato: YYYY-MM-DD
    if (!fechaStr) return;

    // Guardar la fecha tal como la elige el usuario para evitar cambios por conversión UTC
    if (tipo === 1) {
      this.fechaDesde = fechaStr;
    } else if (tipo === 2) {
      this.fechaHasta = fechaStr;
    }
  }
}
