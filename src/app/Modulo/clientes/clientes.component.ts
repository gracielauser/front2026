import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';

import * as bootstrap from 'bootstrap';
import { ClienteService } from '../../Servicios/cliente.service';
import { CommonModule } from '@angular/common';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { NombresApellidoPipe } from '../../Filtros/nombres-apellido.pipe';
import { CiudadPipe } from '../../Filtros/ciudad.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,EstadoPipe,NombresApellidoPipe,CiudadPipe,FormsModule,NgxPaginationModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  clienteModel!: any
  apiClientes: any[] = []
  estado='1'
  nombre:string=''
  ciudad:string=''
  page:number=1
  mensajeExito: string = ''
  exito: boolean = false
  isEditMode: boolean = false
  isViewMode: boolean = false
  modalTitle: string = 'Adicionar Cliente'
  idCliente: number = 0
  cliSeleccionado: any = null
  estadoTemporal: number = 0
  ciudades: string[] = ['Tarija', 'La Paz', 'Pando', 'Cochabamba', 'Chuquisaca', 'Santa Cruz', 'Potosi', 'Beni', 'Oruro']

  constructor(
    private cliSer: ClienteService
  ) { }
  mostrarAlerta(exito: boolean, mensaje: string) {
    this.exito = exito;
    this.mensajeExito = mensaje;
    const toastEl = document.getElementById('toastExito');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
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
    nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]),
    ap_paterno: new FormControl('', [ Validators.minLength(3), Validators.maxLength(40)]),
    ap_materno: new FormControl('', [Validators.minLength(3), Validators.maxLength(40)]),
    direccion: new FormControl('', [Validators.minLength(5), Validators.maxLength(40)]),
    ci_nit: new FormControl('', [Validators.minLength(5), Validators.maxLength(15)]),
    estado: new FormControl('1'),
    celular: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]),
    email: new FormControl('', [Validators.email, Validators.minLength(5), Validators.maxLength(40)]),
    ciudad: new FormControl('Tarija'),
    tipo_documento: new FormControl('1'),
    fecha_registro: new FormControl(this.obtenerFechaHoraActual()),
  })
  get control() {
    return this.clienteForm.controls
  }
  AgregarCliente() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.mostrarAlerta(false, '❌ Por favor complete todos los campos obligatorios');
      return;
    }

    if (this.isEditMode) {
      this.guardarModificacion();
    } else {
      const cliente = this.clienteForm.value;
      this.cliSer.saveCliente(cliente).subscribe({
        next: (data) => {
          console.log('✅ Cliente agregado:', data);
          this.mostrarAlerta(true, data.mensaje || '✅ Cliente agregado exitosamente');
          this.Listar();
          this.cerrarModal();
          this.limpiar();
        },
        error: (error) => {
          console.error('❌ Error al agregar cliente:', error);
          this.mostrarAlerta(false, error.error?.mensaje || '❌ Error al agregar cliente');
        }
      });
    }
  }
  cargarDatosCliente(cliente: any) {
    this.isEditMode = true;
    this.isViewMode = false;
    this.modalTitle = 'Modificar Cliente';
    this.clienteModel = cliente;
    this.idCliente = cliente.id_cliente;

    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      ap_paterno: cliente.ap_paterno,
      ap_materno: cliente.ap_materno,
      direccion: cliente.direccion,
      ci_nit: cliente.ci_nit,
      estado: cliente.estado,
      celular: cliente.celular,
      email: cliente.email,
      ciudad: cliente.ciudad,
      tipo_documento: cliente.tipo_documento,
      fecha_registro: cliente.fecha_registro
    });
    this.clienteForm.enable();
  }

  verDatosCliente(cliente: any) {
    this.isViewMode = true;
    this.isEditMode = false;
    this.modalTitle = 'Ver Detalles del Cliente';
    this.clienteModel = cliente;
    this.idCliente = cliente.id_cliente;

    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      ap_paterno: cliente.ap_paterno,
      ap_materno: cliente.ap_materno,
      direccion: cliente.direccion,
      ci_nit: cliente.ci_nit,
      estado: cliente.estado,
      celular: cliente.celular,
      email: cliente.email,
      ciudad: cliente.ciudad,
      tipo_documento: cliente.tipo_documento,
      fecha_registro: cliente.fecha_registro
    });
    this.clienteForm.disable();
  }
  guardarModificacion() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.mostrarAlerta(false, '❌ Por favor complete todos los campos obligatorios');
      return;
    }

    const cliente = {
      id_cliente: this.idCliente,
      ...this.clienteForm.value
    };

    this.cliSer.modificarCliente(cliente).subscribe({
      next: (data) => {
        console.log('✅ Cliente modificado:', data);
        this.mostrarAlerta(true, data.mensaje || '✅ Cliente modificado exitosamente');
        this.Listar();
        this.cerrarModal();
        this.limpiar();
      },
      error: (error) => {
        console.error('❌ Error al modificar cliente:', error);
        this.mostrarAlerta(false, error.error?.mensaje || '❌ Error al modificar cliente');
      }
    });
  }
  limpiar() {
    this.clienteForm.reset();
    this.clienteForm.patchValue({
      estado: '1',
      ciudad: 'Tarija',
      tipo_documento: '1',
      fecha_registro: this.obtenerFechaHoraActual()
    });
    this.isEditMode = false;
    this.isViewMode = false;
    this.modalTitle = 'Adicionar Cliente';
    this.clienteModel = null;
    this.idCliente = 0;
    this.clienteForm.enable();
  }

  cerrarModal() {
    const modalEl = document.getElementById('addcliente');
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
  showModal(event: Event, cliente: any) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    input.checked = cliente.estado == 1;
    this.cliSeleccionado = cliente;
    this.estadoTemporal = isChecked ? 1 : 2;
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
          this.mostrarAlerta(true, data.mensaje || '✅ Estado modificado exitosamente');
          console.log('✅ Estado modificado:', data);
          this.Listar();
        },
        error: (error) => {
          this.mostrarAlerta(false, '❌ Error al modificar el estado');
          console.error('❌ Error al modificar el estado:', error);
        }
      });
    }
    this.cliSeleccionado = null;
  }

obtenerFechaHoraActual(): string {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  const hours = String(hoy.getHours()).padStart(2, '0');
  const minutes = String(hoy.getMinutes()).padStart(2, '0');
  const seconds = String(hoy.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
