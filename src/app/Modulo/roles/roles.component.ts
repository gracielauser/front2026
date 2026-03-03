import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolServiceService } from '../../Servicios/rol-service.service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { NombrePipe } from '../../Filtros/nombre.pipe';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule,EstadoPipe,NombrePipe,NgxPaginationModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent {
  apiRoles: any[] = [];
  permisos = ''
  estado='1'
  nombre:string=''
  page:number=1
   mensajeExito: string | null = null;
  constructor(
    private rolService: RolServiceService
  ) { }

  ngOnInit() {
    this.listar()
  }
  listar() {
    this.rolService.listar().subscribe({
      next: (data) => {
        this.apiRoles = data;
      },
      error: (err) => {
        console.log(err.error);
      }
    });
  }
  rolForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    estado: new FormControl('', Validators.required),
    permisos: new FormControl('', Validators.required),
  });
  get control() {
    return this.rolForm.controls
  }
  AgregarRol() {
    if (this.rolForm.invalid) {
      this.rolForm.markAllAsTouched();
      return;
    }
    const rol = {//este es el body que necesita y va ser recibidor por req.body en el servidor
      nombre: this.rolForm.value.nombre,
      descripcion: this.rolForm.value.descripcion,
      permisos: this.permisos,
      estado: 1
    }
    this.rolService.agregar(rol).subscribe({
      next: (data) => {
        console.log(data);
        this.listar()
            this.mensajeExito = data.mensaje;
      },
      error: (err) => {
        console.log(err.error);
      }
    })
    this.listar()
    //mensaje de exito
  const toastEl = document.getElementById('toastExito');
  if (toastEl) {
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
  }
  asignacion(e: Event, nroMoodulo: number) {//nos llega el evento del click y el numero de modulo que se supone que estamos encendiendo
    //const activo = e.target.checked;
    const activo = (e.target as HTMLInputElement).checked; // Usar .checked para obtener el valor booleano del switch/checkbox
    if (activo === true) { // si es true osea switch encendido al this.permisos le asignamos ese nro de modulo
      this.permisos += nroMoodulo + ',';
    } else {
      this.permisos = this.permisos.replace(nroMoodulo + ',', '');
    }
  }
  cargarDatosRol(rol: any) {
    this.rolForm.patchValue({
      nombre: rol.nombre,
      descripcion: rol.descripcion
    });
    this.permisos = rol.permisos;
  }
  verificarPermiso(nroPermiso: number) {
    if (this.permisos) {
      const permisosArray = this.permisos.split(',').map(Number);
      // Aquí puedes realizar la verificación de permisos según tu lógica
      if (permisosArray.includes(nroPermiso)) {
        return true; // El permiso está activo
      } else return false
    } else return false
  }
  limpiar() {
    this.rolForm.reset()
    this.permisos = ''
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
guardarCambio() {
  if (this.rolSeleccionado) {
      this.rolSeleccionado.estado = this.estadoTemporal;
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
