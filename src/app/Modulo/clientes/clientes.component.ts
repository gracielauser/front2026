import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';

import * as bootstrap from 'bootstrap';
import { ClienteService } from '../../Servicios/cliente.service';
import { CommonModule } from '@angular/common';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { NombresApellidoPipe } from '../../Filtros/nombres-apellido.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,EstadoPipe,NombresApellidoPipe,FormsModule,NgxPaginationModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  clienteModel!: any
  apiClientes: any[] = []
  constructor(
    private cliSer: ClienteService
  ) { }
 estado='1'
 nombre:string=''
 page:number=1
  mensajeExito: string | null = null;
 cambioEstado(event: any){
  this.estado=event.target.value
}
  ngOnInit(): void {
    this.Listar()
  }
  Listar() {
    this.cliSer.getListaClientes().subscribe((lista) => {
      this.apiClientes = lista
    })
  }
  
  clienteForm = new UntypedFormGroup({
    nombre: new FormControl('', [Validators.required]),
    ap_paterno: new FormControl('', [Validators.required]),
    ap_materno: new FormControl(''),
    direccion: new FormControl(''),
    ci_nit: new FormControl('', [Validators.required]),
    estado: new FormControl('1'),
    celular: new FormControl(''),
    email: new FormControl(''),
    clave: new FormControl(''),
    tipo_registro: new FormControl('1'),
    fecha_registro: new FormControl(this.obtenerFechaActual()),
  })
  get control() {
    return this.clienteForm.controls
  }
  AgregarCliente() {
   const cliente=this.clienteForm.value
    this.cliSer.saveCliente(cliente).subscribe({
      next: (data) => {
        this.Listar();
        this.clienteForm.reset()
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
  idCliente:number=0
  modificarCliente(cliente:any){
this.idCliente=cliente.id_cliente;
this.clienteForm.patchValue({
  nombre:cliente.nombre,
  ap_paterno: cliente.ap_paterno,
    ap_materno: cliente.ap_materno,
    direccion: cliente.direccion,
    ci_nit: cliente.ci_nit,
    estado: cliente.estado,
    celular: cliente.celular,
    tipo_registro:cliente.tipo_registro,
    fecha_registro:cliente.fecha_registro
})
  }
  guardarModificacion(){
    const cliente={
      id_cliente:this.idCliente,
      ...this.clienteForm.value
    }
   console.log("aquii",cliente);
    this.cliSer.modificarCliente(cliente).subscribe({
      next:(data)=>{
        console.log('devuelve: ', data.mensaje, data.nombre);
        this.Listar()
        this.clienteForm.reset()
        this.mensajeExito = data.mensaje;
      },error:(error)=>{
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
  Cancelar(){
    this.clienteForm.reset()
  }
  cliSeleccionado: any = null;
  estadoTemporal: number = 0;
  showModal(event: Event, usu: any) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    // Revertir el cambio visual hasta que confirme
    input.checked = usu.estado == 1;
    // Guardamos referencia al cliente y estado temporal
    this.cliSeleccionado = usu;
    this.estadoTemporal = isChecked ? 1 : 2;
    // Mostramos modal dinámico
    const modal = new bootstrap.Modal(document.getElementById('estadoModal')!);
    modal.show();
  }
  cancelarCambio() {
    this.cliSeleccionado = null;
  }
  guardarCambio() {
    if (this.cliSeleccionado) {
      this.cliSeleccionado.estado = this.estadoTemporal;
      this.cliSer.modificarCliente(this.cliSeleccionado).subscribe({
         next: (data) => {
      console.log('devuelve: ', data.mensaje, data.nombre);
      this.Listar()
       this.mensajeExito = data.mensaje;
    }, error: (error) => {
      console.log(error);
    }
      })
    }
    this.cliSeleccionado = null;
    //mensaje de exito
    const toastEl = document.getElementById('toastExito');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

obtenerFechaActual(): string {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0'); // meses empiezan en 0
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
  }
}
