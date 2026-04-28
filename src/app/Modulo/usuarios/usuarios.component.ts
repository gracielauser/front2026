import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import * as bootstrap from 'bootstrap';
import { Usuario } from '../../Modelos/usuario';
import { PersonaService } from '../../Servicios/persona.service';
import { UsuarioService } from '../../Servicios/usuario.service';
import { CommonModule } from '@angular/common';
import { RolServiceService } from '../../Servicios/rol-service.service';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { usuarioPipe } from '../../Filtros/usuario.pipe';
import { PersonaPipe } from '../../Filtros/persona.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
@Component({
  selector: 'app-usuarios',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule,PersonaPipe, EstadoPipe, usuarioPipe, NgxPaginationModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  usuarioModel!:Usuario
  apiPersonal:any[]=[]
  apiUsuario:any[]=[]
  apiRoles:any[]=[]//roles a alegir para el usuario
  rolesSeleccionados:number[]=[]
  cambiotitulEditar:boolean = false;

  //Búsqueda de personas
  buscarPersona: string = '';
  personasFiltradas: any[] = [];
  showPersonaDropdown: boolean = false;
  personaSeleccionada: any = null;

  //Validación de usuario único
  usuarioExistente: boolean = false;

  //Filtros y Paginacion q  a
  persona:string=''
  usuario:string=''
 estado='1'
 page: number = 1;
  constructor(
    private ususer:UsuarioService,
    private perser:PersonaService,
    private rolService: RolServiceService
  ) { }

  ngOnInit(): void {
      this.Listar()
  }

  // Validador personalizado para coincidencia de contraseñas
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const clave = control.get('clave')?.value;
    const repetirClave = control.get('repetirClave')?.value;

    // Si ambos están vacíos, no hay error (se maneja con required en modo crear)
    if (!clave && !repetirClave) {
      return null;
    }

    // Si solo uno está lleno, o si no coinciden
    if (clave !== repetirClave) {
      return { passwordMismatch: true };
    }

    return null;
  }

  usuarioForm=new UntypedFormGroup({
    usuario:new UntypedFormControl('',[Validators.required]),
    clave:new UntypedFormControl('',Validators.required),
    repetirClave:new UntypedFormControl('',Validators.required),
    estado:new UntypedFormControl('1',Validators.required),
    persona:new UntypedFormControl('',Validators.required)
  }, { validators: this.passwordMatchValidator.bind(this) });
  get control() {
    return this.usuarioForm.controls
  }

  // Métodos para búsqueda de personas
  filtrarPersonas(): void {
    const busqueda = this.buscarPersona.toLowerCase().trim();
    if (busqueda.length === 0) {
      this.personasFiltradas = [];
      this.showPersonaDropdown = false;
      return;
    }

    this.personasFiltradas = this.apiPersonal
      .filter(persona => {
        const nombreCompleto = `${persona.nombre} ${persona.ap_paterno} ${persona.ap_materno}`.toLowerCase();
        const cedula = persona.ci?.toString().toLowerCase() || '';
        return nombreCompleto.includes(busqueda) || cedula.includes(busqueda);
      })
      .slice(0, 5); // Limitar a máximo 5 resultados

    this.showPersonaDropdown = this.personasFiltradas.length > 0;
  }

  seleccionarPersona(persona: any): void {
    this.personaSeleccionada = persona;
    this.buscarPersona = `${persona.nombre} ${persona.ap_paterno} ${persona.ap_materno}`;
    this.usuarioForm.patchValue({ persona: persona });
    this.showPersonaDropdown = false;
  }

  ocultarDropdown(): void {
    // Pequeño delay para que el click en el item funcione antes de ocultar
    setTimeout(() => {
      this.showPersonaDropdown = false;
    }, 200);
  }

  // Actualizar validaciones según modo
  actualizarValidacionesPassword(): void {
    const claveControl = this.usuarioForm.get('clave');
    const repetirClaveControl = this.usuarioForm.get('repetirClave');

    if (this.cambiotitulEditar) {
      // Modo edición: contraseñas no obligatorias, pero si se llena una, ambas son obligatorias
      claveControl?.clearValidators();
      repetirClaveControl?.clearValidators();
    } else {
      // Modo creación: contraseñas obligatorias
      claveControl?.setValidators([Validators.required]);
      repetirClaveControl?.setValidators([Validators.required]);
    }

    claveControl?.updateValueAndValidity();
    repetirClaveControl?.updateValueAndValidity();
  }

  // Verificar si hay cambio de contraseña en modo edición
  verificarCambioPassword(): boolean {
    const clave = this.usuarioForm.get('clave')?.value;
    const repetirClave = this.usuarioForm.get('repetirClave')?.value;

    // Si está en modo edición y alguna contraseña tiene valor, ambas son requeridas
    if (this.cambiotitulEditar && (clave || repetirClave)) {
      return true;
    }

    return false;
  }

  validarFormulario(): boolean {
    // Validaciones básicas del formulario
    if (this.usuarioForm.get('usuario')?.invalid) return false;
    if (this.usuarioForm.get('persona')?.invalid) return false;
    if (this.rolesSeleccionados.length === 0) return false;
    if (this.usuarioExistente) return false; // Validar que el usuario no exista

    const clave = this.usuarioForm.get('clave')?.value;
    const repetirClave = this.usuarioForm.get('repetirClave')?.value;

    if (this.cambiotitulEditar) {
      // Modo edición: si hay contraseña, validar
      if (clave || repetirClave) {
        if (!clave || !repetirClave) return false; // Ambas requeridas
        if (clave !== repetirClave) return false; // Deben coincidir
        if (clave.length < 6 || clave.length > 15) return false; // Longitud
      }
    } else {
      // Modo creación: contraseñas obligatorias
      if (!clave || !repetirClave) return false;
      if (clave !== repetirClave) return false;
      if (clave.length < 6 || clave.length > 15) return false;
    }

    return true;
  }

  Listar(){
    this.ususer.getListaUsuario().subscribe((lista)=>{
      this.apiUsuario=lista
      console.log('usuarios: ',this.apiUsuario);
    })
  }

  AgregarUsuario(){
    if (!this.validarFormulario()) {
      console.log('❌ Formulario inválido');
      return;
    }

    if (this.cambiotitulEditar) {
      // Modo edición
      this.modificarUsuario();
    } else {
      // Modo agregar
      const nuevoUsuario:Usuario={
        usuario:(this.usuarioForm.get('usuario')?.value),
        clave:(this.usuarioForm.get('clave')?.value),
        estado:(1),
        persona:(this.usuarioForm.get('persona')?.value),
      }
      console.log('📝 Nuevo usuario:', nuevoUsuario);
      this.ususer.saveUsuario(nuevoUsuario).subscribe({
        next: (data) => {
          console.log('✅ Usuario agregado con éxito:', data);
          this.mostrarAlerta(true, 'Usuario registrado correctamente');
          var usu_roles = [];
          this.rolesSeleccionados.forEach((rolId)=>{
            const usuRol={
              id_usuario: data.id_usuario,
              id_rol: rolId
            }
            usu_roles.push(usuRol)
          })
          this.rolService.asignarRol(usu_roles).subscribe((response) => {
              console.log('✅ Rol asignado:', response);
            }, (error) => {
              console.error('❌ Error al asignar rol:', error);
            });
          this.Listar();
          this.usuarioForm.reset();
          this.rolesSeleccionados = [];
          this.cerrarModal();
        },
        error: (error) => {
          console.error('❌ Error al agregar usuario:', error);
          this.mostrarAlerta(false, 'Error al agregar usuario');
        }
      });
    }
  }

  modificarUsuario(){
    const claveActual = this.usuarioForm.get('clave')?.value;
    const usuarioModificado: any = {
      id_usuario: this.usuarioModel.id_usuario,
      usuario: this.usuarioForm.get('usuario')?.value,
      estado: this.usuarioForm.get('estado')?.value,
      persona: this.usuarioForm.get('persona')?.value
    };

    // Solo incluir clave si se está cambiando (tiene valor)
    if (claveActual && claveActual.trim() !== '') {
      usuarioModificado.clave = claveActual;
      console.log('📝 Modificando usuario con nueva contraseña');
    } else {
      console.log('📝 Modificando usuario sin cambiar contraseña');
    }

    console.log('📝 Usuario a modificar:', usuarioModificado);
    this.ususer.modificarUsuario(usuarioModificado).subscribe({
      next: (data) => {
        console.log('✅ Usuario modificado con éxito:', data);
        this.mostrarAlerta(true, 'Usuario actualizado correctamente');
        // Actualizar roles
        var usu_roles = [];
        this.rolesSeleccionados.forEach((rolId)=>{
          const usuRol={
            id_usuario: data.id_usuario,
            id_rol: rolId
          }
          usu_roles.push(usuRol);

        });
         this.rolService.asignarRol(usu_roles).subscribe((response) => {
            console.log('✅ Rol actualizado:', response);
          }, (error) => {
            console.error('❌ Error al actualizar rol:', error);
          });
        this.usuarioForm.reset();
        this.rolesSeleccionados = [];
        this.cambiotitulEditar = false;
        this.cerrarModal();
        this.Listar();
      },
      error: (error) => {
        console.error('❌ Error al modificar usuario:', error);
        this.mostrarAlerta(false, 'Error al actualizar usuario');
      }
    });
  }

  cerrarModal() {
    const modalEl = document.getElementById('addusuario');
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
  rolesUsuario(roles: any[]):string{
    let nombreRoles=''
    roles.forEach(r => nombreRoles+=r.nombre+' | ')
    return nombreRoles
  }

   passwordVisible = false;
  togglePassword(): void {
    const inputPassword = document.getElementById("password") as HTMLInputElement;
    const inputRepeatPassword = document.getElementById("repeatPassword") as HTMLInputElement;

    this.passwordVisible = !this.passwordVisible;
    const newType = this.passwordVisible ? "text" : "password";

    if (inputPassword) {
      inputPassword.type = newType;
    }
    if (inputRepeatPassword) {
      inputRepeatPassword.type = newType;
    }
  }
  eliminarUsuario(id: number){
  }
  // Validar si el usuario ya existe
  validarUsuarioUnico(): void {
    const usuarioIngresado = this.usuarioForm.get('usuario')?.value?.trim().toLowerCase();

    if (!usuarioIngresado || usuarioIngresado.length < 3) {
      this.usuarioExistente = false;
      return;
    }

    // Buscar en la lista de usuarios
    const existe = this.apiUsuario.some(usu => {
      const usuarioLista = usu.usuario?.trim().toLowerCase();

      // Si estamos editando, excluir al usuario actual
      if (this.cambiotitulEditar && this.usuarioModel?.id_usuario === usu.id_usuario) {
        return false;
      }

      return usuarioLista === usuarioIngresado;
    });

    this.usuarioExistente = existe;
    console.log(`Usuario "${usuarioIngresado}" ${existe ? 'YA EXISTE' : 'disponible'}`);
  }

  limpiar() {//asi como para limpiar este metodo nos servira para llamar a la lista de roles y todo lo que necesitemos reiniciar para agregar un nuevo usuario
    this.usuarioForm.reset();
    this.usuarioForm.patchValue({ estado: '1' });
    this.listarRoles();
    this.listarPersonas();
    this.rolesSeleccionados = [];
    this.cambiotitulEditar = false;
    this.buscarPersona = '';
    this.personaSeleccionada = null;
    this.personasFiltradas = [];
    this.showPersonaDropdown = false;
    this.usuarioExistente = false;
    this.actualizarValidacionesPassword();
  }
listarPersonas(){
  this.perser.getListaPersonal().subscribe((personas)=>{
    this.apiPersonal=personas
  })
}
  listarRoles(){
    this.rolService.listar().subscribe((roles)=>{
      this.apiRoles=roles
    })
  }

  ponerRol(e:any){
    const rolId = Number(e.target.value);
    const isChecked = e.target.checked;

    if (isChecked) {
      // Agregar el rol si está seleccionado y no está ya en la lista
      if (!this.rolesSeleccionados.includes(rolId)) {
        this.rolesSeleccionados.push(rolId);
      }
    } else {
      // Eliminar el rol si no está seleccionado
      this.rolesSeleccionados = this.rolesSeleccionados.filter(id => id !== rolId);
    }
    console.log(this.rolesSeleccionados);
  }

  editarUsuario(usu:any){
    this.listarRoles();
    this.listarPersonas();
    this.usuarioModel=usu
    this.personaSeleccionada = usu.empleado;
    this.buscarPersona = `${usu.empleado.nombre} ${usu.empleado.ap_paterno} ${usu.empleado.ap_materno}`;
    this.usuarioForm.patchValue({
      usuario:usu.usuario,
      clave:'', // No mostrar la contraseña en modo edición
      repetirClave:'', // No mostrar la contraseña en modo edición
      estado:usu.estado,
      persona:usu.empleado
    })
    this.cambiotitulEditar = true;
    this.rolesSeleccionados = usu.rols.map((rol:any) => rol.id_rol);
    this.actualizarValidacionesPassword();
  }
  tieneRol(rolId: number): boolean {
    return this.rolesSeleccionados.includes(rolId);
  }
   usuSeleccionado: any = null;
  estadoTemporal: number = 0;
  showModal(event: Event, usu: any) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    // Revertir el cambio visual hasta que confirme
    input.checked = usu.estado == 1;
    // Guardamos referencia al empleado y estado temporal
    this.usuSeleccionado = usu;
    this.estadoTemporal = isChecked ? 1 : 2;
    // Mostramos modal dinámico
    const modal = new bootstrap.Modal(document.getElementById('estadoModal')!);
    modal.show();
  }
  exito: boolean=false
mensajeExito: string=''
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
  cancelarCambio() {
    this.usuSeleccionado = null;
  }
  guardarCambio() {
    if (this.usuSeleccionado) {
      this.usuSeleccionado.estado = this.estadoTemporal;
      this.ususer.modificarUsuario(this.usuSeleccionado).subscribe({
        next: (data) => {
            this.mostrarAlerta(true, this.estadoTemporal === 1 ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente');
          console.log('✅ Estado modificado:', data);
          this.Listar();
        },
        error: (error) => {
            this.mostrarAlerta(false, this.estadoTemporal === 1 ? 'Error al activar usuario' : 'Error al desactivar usuario');
          console.error('❌ Error al modificar el estado:', error);
        }
      });
    }
    this.usuSeleccionado = null;
  }
}
