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
  permisos: number[] = [];
  estado='1'
  nombre:string=''
  page:number=1
  mensajeExito: string = '';
  exito: boolean = false;
  isEditMode: boolean = false;
  modalTitle: string = 'Nuevo Rol';
  rolModel: any = null;
  formSubmitted: boolean = false;

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
    estado: new FormControl('1'),
    permisos: new FormControl(''),
  });
  get control() {
    return this.rolForm.controls
  }

  mostrarAlerta(exito: boolean, mensaje: string) {
    this.exito = exito;
    this.mensajeExito = mensaje;
    const toastEl = document.getElementById('toastExito');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  AgregarRol() {
    this.formSubmitted = true;

    if (this.rolForm.invalid || this.permisos.length === 0) {
      this.rolForm.markAllAsTouched();
      this.mostrarAlerta(false, '❌ Por favor complete todos los campos obligatorios');
      return;
    }

    const rol = {
      nombre: this.rolForm.value.nombre,
      descripcion: this.rolForm.value.descripcion,
      permisos: this.permisos.join(','),
      estado: 1
    }

    if (this.isEditMode) {
      // Modo edición
      this.modificarRol();
    } else {
      // Modo agregar
      this.rolService.agregar(rol).subscribe({
        next: (data) => {
          console.log('✅ Rol agregado:', data);
          this.mostrarAlerta(true, data.mensaje || '✅ Rol agregado exitosamente');
          this.listar();
          this.cerrarModal();
          this.limpiar();
        },
        error: (err) => {
          console.error('❌ Error al agregar rol:', err);
          this.mostrarAlerta(false, err.error?.mensaje || '❌ Error al agregar rol');
        }
      });
    }
  }

  modificarRol() {
    // No permitir modificar el rol Administrador (id_rol = 1)
    if (this.rolModel && this.rolModel.id_rol === 1) {
      this.mostrarAlerta(false, '⚠️ No se puede modificar el rol Administrador');
      return;
    }

    const rolModificado = {
      id_rol: this.rolModel.id_rol,
      nombre: this.rolForm.value.nombre,
      descripcion: this.rolForm.value.descripcion,
      permisos: this.permisos.join(','),
      estado: this.rolForm.value.estado || 1
    };

    this.rolService.modificarRol(rolModificado).subscribe({
      next: (data) => {
        console.log('✅ Rol modificado:', data);
        this.mostrarAlerta(true, data.mensaje || '✅ Rol actualizado exitosamente');
        this.listar();
        this.cerrarModal();
        this.limpiar();
      },
      error: (err) => {
        console.error('❌ Error al modificar rol:', err);
        this.mostrarAlerta(false, err.error?.mensaje || '❌ Error al modificar rol');
      }
    });
  }

  cerrarModal() {
    const modalEl = document.getElementById('addrol');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) {
        modal.hide();
      }
    }
    // Limpiar backdrop
    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 300);
  }

  asignacion(e: Event, nroModulo: number) {
    // No permitir modificar permisos del rol Administrador (id_rol = 1)
    if (this.rolModel && this.rolModel.id_rol === 1) {
      (e.target as HTMLInputElement).checked = true;
      this.mostrarAlerta(false, '⚠️ No se pueden modificar los permisos del rol Administrador');
      return;
    }

    const activo = (e.target as HTMLInputElement).checked;
    if (activo) {
      if (!this.permisos.includes(nroModulo)) {
        this.permisos.push(nroModulo);
      }
    } else {
      this.permisos = this.permisos.filter(p => p !== nroModulo);
    }
    console.log('Permisos seleccionados:', this.permisos);
  }
  cargarDatosRol(rol: any) {
    this.isEditMode = true;
    this.modalTitle = 'Modificar Rol';
    this.rolModel = rol;

    // Convertir permisos string a array
    if (rol.permisos) {
      this.permisos = rol.permisos.split(',').map((p: string) => Number(p.trim())).filter((p: number) => !isNaN(p));
    } else {
      this.permisos = [];
    }

    this.rolForm.patchValue({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      estado: rol.estado
    });

    this.formSubmitted = false;
    console.log('Editar rol - Permisos cargados:', this.permisos);
  }

  verificarPermiso(nroPermiso: number): boolean {
    return this.permisos.includes(nroPermiso);
  }

  limpiar() {
    this.rolForm.reset();
    this.rolForm.patchValue({ estado: '1' });
    this.rolForm.markAsUntouched();
    this.rolForm.markAsPristine();
    this.permisos = [];
    this.isEditMode = false;
    this.modalTitle = 'Nuevo Rol';
    this.rolModel = null;
    this.formSubmitted = false;
  }
  rolSeleccionado: any = null;
  estadoTemporal: number = 0;

  showModal(event: Event, rol: any) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    // Revertir el cambio visual hasta que confirme
    input.checked = rol.estado == 1;
    // Guardamos referencia al rol y estado temporal
    this.rolSeleccionado = rol;
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
      this.rolService.modificarRol(this.rolSeleccionado).subscribe({
        next: (data) => {
          this.mostrarAlerta(true, data.mensaje || '✅ Estado modificado exitosamente');
          console.log('✅ Estado modificado:', data);
          this.listar();
        },
        error: (error) => {
          this.mostrarAlerta(false, '❌ Error al modificar el estado');
          console.error('❌ Error al modificar el estado:', error);
        }
      });
    }
    this.rolSeleccionado = null;
  }
}
