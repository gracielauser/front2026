import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, Validators, ReactiveFormsModule, FormControl, FormGroup, FormsModule, ValidatorFn, ValidationErrors } from '@angular/forms';

declare var window: any;
import * as bootstrap from 'bootstrap';
import { EmpleadoService } from '../../Servicios/empleado.service';
import { CedulaPipe } from '../../Filtros/cedula.pipe';
import { NombresApellidoPipe } from '../../Filtros/nombres-apellido.pipe';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { GeneroPipe } from '../../Filtros/genero.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NombresApellidoPipe,
    FormsModule,CedulaPipe,EstadoPipe,GeneroPipe, NgxPaginationModule],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.css'
})
export class EmpleadosComponent {
  modal: any;
  nombre:string=''
  ci:string=''
  estado='1'
  genero=''
  page: number = 1;
  mensajeExito: string | null = null;
  apiUrl = environment.apiUrl;
  isEditMode: boolean = false;
  modalTitle: string = 'Nuevo Empleado';
  selectedFile: File | null = null;
@ViewChild('addPersona') modalAgregarRef!: ElementRef; // Referencia al modal
  private modalAgregar?: bootstrap.Modal;
ngAfterViewInit() {
    // Inicializa el modal de Bootstrap
    this.modalAgregar = new bootstrap.Modal(this.modalAgregarRef.nativeElement);
  }
  cerrarModal() {
    console.log("cerrar modal");
    if (this.modalAgregar) {
      this.modalAgregar.hide(); // Cierra el modal
      document.querySelector('.modal-backdrop')?.remove();
      // Habilita el scroll del body (Bootstrap lo desactiva)
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0'; // Elimina el padding que añade Bootstrap
    }
        // const modalEl = document.getElementById('empleadoModal');
        // if (modalEl) {
        //   const modal = bootstrap.Modal.getInstance(modalEl);
        //   if (modal) {
        //     modal.hide();
        //   }
        // }

        // // Eliminar backdrop y restaurar body
        // setTimeout(() => {
        //   document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        //   document.body.classList.remove('modal-open');
        //   document.body.style.overflow = '';
        //   document.body.style.paddingRight = '';
        // }, 300);
  }
  //ia
  abrirModal() {
    if (this.modalAgregar) {
      this.modalAgregar.show(); // Abre el modal
    }
  }
  mostrarAlerta(exito: boolean, mensaje: string) {
    // Mensaje de éxito
    this.exito = exito;
    this.mensajeExito = mensaje;
        const toastEl = document.getElementById('toastExito');
        if (toastEl) {
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
  }

  apiEmpleados: any[] = []
  constructor(
    private empleadoSer: EmpleadoService
  ) { }

  ngOnInit() {
    this.listar()

  }

  listar() {
    this.empleadoSer.getListaEmpleado().subscribe((lista) => {
      this.apiEmpleados = lista
    })
  }
  empleadoForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    ap_paterno: new FormControl(''),
    ap_materno: new FormControl(''),
    celular: new FormControl('', [Validators.required]),
    ci: new FormControl('', [Validators.required]),
    salario: new FormControl('', [Validators.required]),
    genero: new FormControl('', [Validators.required]),
    estado: new FormControl('1')
  },
 { validators: this.alMenosUnApellido() }
)


  get control() {
    return this.empleadoForm.controls
  }
  openModalAdd() {
    this.isEditMode = false;
    this.modalTitle = 'Nuevo Empleado';
    this.empleadoForm.reset();
    this.empleadoForm.patchValue({ estado: '1' });
    this.selectedFile = null;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('📁 Archivo seleccionado:');
      console.log('   Nombre:', file.name);
      console.log('   Tipo:', file.type);
      console.log('   Tamaño:', (file.size / 1024).toFixed(2), 'KB');
      console.log('   Ruta completa:', event.target.value);
      console.log('   Archivo:', file);
    }
  }

  AgregarEmpleado() {
      /*if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched(); // 👈 marca los errores
      return;
    }*/
    const empleado = this.empleadoForm.value
  empleado.estado='1';
  const formData = new FormData();
  formData.append('empleado', JSON.stringify(empleado));
  if (this.selectedFile) {
    formData.append('foto', this.selectedFile);
    console.log('📤 Enviando foto al servidor:', this.selectedFile.name);
  }
    console.log("empleado-", empleado);
    this.empleadoSer.saveEmpleado(formData).subscribe({
      next: (data) => {
        console.log('✅ devuelve: ', data.mensaje, data.nombre);
        this.listar()
        this.empleadoForm.reset()
        this.selectedFile = null;
        this.mensajeExito = data.mensaje;

        // Mensaje de éxito
        const toastEl = document.getElementById('toastExito');
        if (toastEl) {
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
      }, error: (error) => {
        console.log('❌ Error:', error);
      }
    })
  }
  validarCi(e: any){
    const input = e.target.value
    this.empleadoSer.validarCi(input).subscribe((data)=>{
      console.log('EXISTE ESTE CI: ',data.existe);

      if(data.existe){
        // this.empleadoForm.get('ci')?.setErrors({ ciExists: true });
      }
    })
  }
  Cancelar(){
    this.empleadoForm.reset();
    this.isEditMode = false;
    this.idModificar = 0;
    this.selectedFile = null;
  }

  submitForm() {
    if (this.isEditMode) {
      this.confirmarModifcacion();
    } else {
      this.AgregarEmpleado();
    }
  }
  //cambio de estado
  perSeleccionado: any = null;
  estadoTemporal: number = 0;
  showModal(event: Event, per: any) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    // Revertir el cambio visual hasta que confirme
    input.checked = per.estado == 1;
    // Guardamos referencia al empleado y estado temporal
    this.perSeleccionado = per;
    this.estadoTemporal = isChecked ? 1 : 2;
    const modal = new bootstrap.Modal(document.getElementById('estadoModal')!);
    modal.show();
  }
  cancelarCambio() {
    this.perSeleccionado = null;
  }
  guardarCambio() {
    if (this.perSeleccionado) {
      this.perSeleccionado.estado = this.estadoTemporal;
      const formData = new FormData();
      formData.append('empleado', JSON.stringify(this.perSeleccionado));
      this.empleadoSer.modificarEmpleado(formData).subscribe({
        next: (data) => {
          this.mostrarAlerta(true, data.mensaje);
          this.listar();
        },
        error: (error) => {
          this.mostrarAlerta(false, 'Error al modificar el estado');
        }
      });
    }
    this.perSeleccionado = null;
    //mensaje de exito
        const toastEl = document.getElementById('toastExito');
        if (toastEl) {
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
  }
  idModificar: number = 0;//este id va ser temporal solo para modificar
  modificarDatos(emp:any){//este metodo solo pone loas datos que recibe en el formulario
    this.isEditMode = true;
    this.modalTitle = 'Editar Empleado';
    this.idModificar = emp.id_empleado;//aqui guardo el id del empleado que voy a modificar
    this.empleadoForm.patchValue({
      nombre: emp.nombre,
      ap_paterno: emp.ap_paterno,
      ap_materno: emp.ap_materno,
      celular: emp.celular,
      ci: emp.ci,
      salario: emp.salario,
      genero: emp.genero,
      estado: emp.estado
    });
    // Resetear archivo seleccionado al editar
    this.selectedFile = null;
  }
  exito:boolean=false;
  confirmarModifcacion(){//este metodo va ser el que llame al servicio para modificar
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched(); // 👈 marca los errores
      this.mostrarAlerta(false,'Formulario inválido');
      return;
    }

    // Crear FormData para enviar empleado con foto
    const formData = new FormData();
    const empleadoData = {
      id_empleado: this.idModificar,
      ...this.empleadoForm.value
    };
    formData.append('empleado', JSON.stringify(empleadoData));

    if (this.selectedFile) {
      formData.append('foto', this.selectedFile);
    }

    this.empleadoSer.modificarEmpleado(formData).subscribe({
      next: (data) =>{
        this.listar();
        this.empleadoForm.reset();
        this.idModificar = 0;
        this.selectedFile = null;
        this.mostrarAlerta(true,data.mensaje);
        this.cerrarModal()

      }, error: (error) =>{
        this.mostrarAlerta(false,error.error.mensaje);
      }
    })
  }
alMenosUnApellido(): ValidatorFn {
  return (formGroup: FormGroup): ValidationErrors | null => {
    const paterno = formGroup.get('ap_paterno')?.value?.trim();
    const materno = formGroup.get('ap_materno')?.value?.trim();

    if (!paterno && !materno) {
      return { apellidoRequerido: true }; // 👈 devuelve error
    }

    return null; // 👈 válido
  };
}

// Método para obtener la URL de la foto del empleado
getFotoUrl(foto: string | null): string {
  if (foto) {
    return `${this.apiUrl}/uploads/${foto}`;
  }
  return 'assets/image-not-found.png';
}

// Método para obtener el icono de género
getGeneroIcon(genero: number): string {
  switch(genero) {
    case 1: return 'bi-gender-male';
    case 2: return 'bi-gender-female';
    case 3: return 'bi-gender-ambiguous';
    default: return 'bi-question-circle';
  }
}

// Método para obtener el texto de género
getGeneroText(genero: number): string {
  switch(genero) {
    case 1: return 'Masculino';
    case 2: return 'Femenino';
    case 3: return 'Otro';
    default: return 'No especificado';
  }
}

}
