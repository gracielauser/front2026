import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

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
  modalTitle: string = 'Nuevo Cliente'
  idCliente: number = 0
  cliSeleccionado: any = null
  estadoTemporal: number = 0
  ciudades: string[] = ['Tarija', 'La Paz', 'Pando', 'Cochabamba', 'Chuquisaca', 'Santa Cruz', 'Potosi', 'Beni', 'Oruro']
  ciNitFocused: boolean = false

  constructor(
    private cliSer: ClienteService
  ) { }

  // Validador personalizado para campos opcionales
  optionalMinLength(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length === 0) {
        return null; // Si está vacío, es válido (porque es opcional)
      }
      return control.value.length >= minLength ? null : { minlength: { requiredLength: minLength, actualLength: control.value.length } };
    };
  }

  optionalMaxLength(maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length === 0) {
        return null; // Si está vacío, es válido (porque es opcional)
      }
      return control.value.length <= maxLength ? null : { maxlength: { requiredLength: maxLength, actualLength: control.value.length } };
    };
  }

  optionalEmail(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length === 0) {
        return null; // Si está vacío, es válido (porque es opcional)
      }
      return Validators.email(control);
    };
  }

  optionalPattern(pattern: string | RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length === 0) {
        return null; // Si está vacío, es válido (porque es opcional)
      }
      return Validators.pattern(pattern)(control);
    };
  }

  // Validador personalizado para formato CI/NIT: solo números o XXXXXX-1A/XXXXXX-1B
  formatoCiNit(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length === 0) {
        return null; // Si está vacío, es válido
      }
      const value = control.value.toString().trim();
      // Patrón: solo números (5 o más) o números-número(A|B)
      const patron = /^\d{5,}(-\d+[AB])?$/;
      return patron.test(value) ? null : { formatoCiNit: true };
    };
  }

  // Validador para verificar duplicados
  validarDuplicadoCiNit(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length === 0) {
        return null; // Si está vacío, es válido
      }

      // Verificar que tenemos la lista de clientes
      if (!this.apiClientes || this.apiClientes.length === 0) {
        return null; // Si no hay lista, no validar duplicados por ahora
      }

      const value = control.value.toString().trim();

      // Si estamos en modo edición, excluir el cliente actual
      if (this.isEditMode && this.clienteModel) {
        const existe = this.apiClientes.some(cli =>
          cli.ci_nit.toString().trim() === value && cli.id_cliente !== this.clienteModel.id_cliente
        );
        return existe ? { duplicadoCiNit: true } : null;
      } else {
        // Si es nuevo, validar contra todos
        const existe = this.apiClientes.some(cli => cli.ci_nit.toString().trim() === value);
        return existe ? { duplicadoCiNit: true } : null;
      }
    };
  }

  onCiNitFocus() {
    this.ciNitFocused = true;
  }

  onCiNitBlur() {
    this.ciNitFocused = false;
  }

  onCiNitInput() {
    // Forzar validación inmediata del campo CI/NIT
    const ciNitControl = this.clienteForm.get('ci_nit');
    if (ciNitControl) {
      // Actualizar el valor y forzar re-validación completa
      ciNitControl.updateValueAndValidity({ emitEvent: true });
      // Marcar como touched y dirty para mostrar errores
      ciNitControl.markAsTouched();
      ciNitControl.markAsDirty();
    }
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
  ngOnInit(): void {
    this.Listar()
  }
  Listar() {
    this.cliSer.getListaClientes().subscribe((lista) => {
      this.apiClientes = lista
      console.log('clientesssssssssssss: ',lista);

    })
  }

  clienteForm = new UntypedFormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(40), Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+$')]),
    ap_paterno: new FormControl('', [this.optionalMinLength(3), this.optionalMaxLength(40), this.optionalPattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+$')]),
    ap_materno: new FormControl('', [this.optionalMinLength(3), this.optionalMaxLength(40), this.optionalPattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+$')]),
    direccion: new FormControl('', [this.optionalMinLength(5), this.optionalMaxLength(40)]),
    ci_nit: new FormControl('', [this.formatoCiNit(), this.validarDuplicadoCiNit(), this.optionalMinLength(5), this.optionalMaxLength(15)]),
    estado: new FormControl('1'),
    celular: new FormControl('', [ Validators.minLength(8), Validators.maxLength(15), Validators.pattern('^[0-9]+$')]),
    email: new FormControl('', [this.optionalEmail(), this.optionalMinLength(5), this.optionalMaxLength(40)]),
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

    // Verificación adicional de duplicados
    const ciNitValue = this.clienteForm.get('ci_nit')?.value;
    if (ciNitValue) {
      const existeDuplicado = this.apiClientes.some(cli => cli.ci_nit === ciNitValue);
      if (existeDuplicado) {
        this.mostrarAlerta(false, '❌ El CI/NIT ya está registrado con otro cliente');
        return;
      }
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
    // Limpiar estado de validaciones
    this.clienteForm.markAsPristine();
    this.clienteForm.markAsUntouched();

    // Pequeño delay para asegurar que clienteModel esté establecido antes de validar
    setTimeout(() => {
      // Re-validar CI/NIT para que considere el cliente actual
      this.clienteForm.get('ci_nit')?.updateValueAndValidity({ emitEvent: false });
    }, 0);
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
    // Re-validar CI/NIT
    this.clienteForm.get('ci_nit')?.updateValueAndValidity({ emitEvent: false });
  }
  guardarModificacion() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.mostrarAlerta(false, '❌ Por favor complete todos los campos obligatorios');
      return;
    }

    // Verificación adicional de duplicados
    const ciNitValue = this.clienteForm.get('ci_nit')?.value;
    if (ciNitValue) {
      const existeDuplicado = this.apiClientes.some(cli =>
        cli.ci_nit === ciNitValue && cli.id_cliente !== this.idCliente
      );
      if (existeDuplicado) {
        this.mostrarAlerta(false, '❌ El CI/NIT ya está registrado con otro cliente');
        return;
      }
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
    this.modalTitle = 'Nuevo Cliente';
    this.clienteModel = null;
    this.idCliente = 0;
    this.clienteForm.enable();
    this.ciNitFocused = false;
    // Limpiar estado de validaciones
    this.clienteForm.markAsPristine();
    this.clienteForm.markAsUntouched();
    // Re-validar CI/NIT
    this.clienteForm.get('ci_nit')?.updateValueAndValidity({ emitEvent: false });
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
  formatFechaRegistro(fecha: string | null | undefined): string {
    if (!fecha) {
      return '';
    }
    const [datePart, timePart] = fecha.split(' ');
    if (!datePart) {
      return fecha;
    }
    const [year, month, day] = datePart.split('-').map(val => parseInt(val, 10));
    if (!year || !month || !day) {
      return fecha;
    }
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const fechaFormateada = `${day} ${meses[month - 1]} ${year}`;
    return timePart ? `${fechaFormateada}, ${timePart}` : fechaFormateada;
  }}
