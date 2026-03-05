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
/*  @ViewChild('addpersona') modalAgregarRef!: ElementRef; // Referencia al modal
  private modalAgregar?: Modal;
ngAfterViewInit() {
    // Inicializa el modal de Bootstrap
    this.modalAgregar = new Modal(this.modalAgregarRef.nativeElement);
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
  }
  //ia
  abrirModal() {
    if (this.modalAgregar) {
      this.modalAgregar.show(); // Abre el modal
    }
  }
*/

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
    estado: new FormControl('1'),
    foto: new FormControl(''),
  },
 { validators: this.alMenosUnApellido() }
)


  get control() {
    return this.empleadoForm.controls
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
  if (this.empleadoForm.get('foto')?.value) {
    formData.append('foto', this.empleadoForm.get('foto')?.value);
  }
    console.log("empleado-", empleado);
    this.empleadoSer.saveEmpleado(formData).subscribe({
      next: (data) => {
        console.log('devuelve: ', data.mensaje, data.nombre);
        this.listar()
        this.empleadoForm.reset()
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
    this.empleadoForm.reset()
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
      this.empleadoSer.modificarEmpleado(this.perSeleccionado).subscribe({
        next: (data) => {
          console.log('Estado modificado:', data.mensaje);
          this.listar();
          this.mensajeExito = data.mensaje;
        },
        error: (error) => {
          console.log('Error al modificar el estado:', error);
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
    this.idModificar = emp.id_empleado;//aqui guardo el id del empleado que voy a modificar
    this.empleadoForm.patchValue({
      nombre: emp.nombre,
      ap_paterno: emp.ap_paterno,
      ap_materno: emp.ap_materno,
      celular: emp.celular,
      ci: emp.ci,
      salario: emp.salario,
      genero: emp.genero,
      estado: emp.estado,
      foto: emp.foto,
    });
  }
  confirmarModifcacion(){//este metodo va ser el que llame al servicio para modificar
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched(); // 👈 marca los errores
      return;
    }
    const empleado = {
      id_empleado: this.idModificar,//este id ponemos al nuevo objeto
      ...this.empleadoForm.value//el resto dejamos igual
    };
    this.empleadoSer.modificarEmpleado(empleado).subscribe({
      next: (data) =>{
        console.log('Empleado modificado:', data.mensaje);
        this.listar();
        this.empleadoForm.reset();
        this.idModificar = 0;//reiniciamos el id
        this.mensajeExito = data.mensaje;
      }, error: (error) =>{
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
