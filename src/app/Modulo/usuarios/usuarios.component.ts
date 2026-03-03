import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

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
  usuarioForm=new UntypedFormGroup({
    usuario:new UntypedFormControl('',[Validators.required]),
    clave:new UntypedFormControl('',Validators.required),
    estado:new UntypedFormControl('1',Validators.required),
    persona:new UntypedFormControl('',Validators.required)
  })
  get control() {
    return this.usuarioForm.controls
  }
  Listar(){
    this.ususer.getListaUsuario().subscribe((lista)=>{
      this.apiUsuario=lista
      console.log('usuarios: ',this.apiUsuario);
    })
  }

  AgregarUsuario(){
    const nuevoUsuario:Usuario={
      usuario:(this.usuarioForm.get('usuario')?.value),
      clave:(this.usuarioForm.get('clave')?.value),
      estado:(1),
      persona:(this.usuarioForm.get('persona')?.value),
    }
    console.log(nuevoUsuario);
    this.ususer.saveUsuario(nuevoUsuario).subscribe((data)=>{
      console.log('Usuario agregado con éxito: ',data);
      this.rolesSeleccionados.forEach((rolId)=>{
        const usuRol={
          id_usuario: data.id_usuario,
          id_rol: rolId
        }
        this.rolService.asignarRol(usuRol).subscribe((response) => {
           this.Listar()
          console.log('Rol asignado con éxito: ', response);
        }, (error) => {
          console.error('Error al asignar rol: ', error);
        });
      })
     
      this.usuarioForm.reset()
    }
    )
  }
  rolesUsuario(roles: any[]):string{
    let nombreRoles=''
    roles.forEach(r => nombreRoles+=r.nombre+' | ')
    return nombreRoles
  }
  
   passwordVisible = false;
  togglePassword(): void {
    const input = document.getElementById("password") as HTMLInputElement;
    if (input) {
      this.passwordVisible = !this.passwordVisible;
      input.type = this.passwordVisible ? "text" : "password";
    }
  }
  eliminarUsuario(id: number){
  }
  limpiar() {//asi como para limpiar este metodo nos servira para llamar a la lista de roles y todo lo que necesitemos reiniciar para agregar un nuevo usuario
    this.usuarioForm.reset();
    this.listarRoles();
    this.listarPersonas()
    this.cambiotitulEditar = false;
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
    const rolId = e.target.value;
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
    this.usuarioForm.patchValue({
      usuario:usu.usuario,
      clave:usu.clave,
      estado:usu.estado,
      persona:usu.empleado
    })
    this.cambiotitulEditar = true;
    this.rolesSeleccionados = usu.rols.map((rol:any) => rol.id_rol);
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
  cancelarCambio() {
    this.usuSeleccionado = null;
  }
  guardarCambio() {
    if (this.usuSeleccionado) {
      this.usuSeleccionado.estado = this.estadoTemporal;
    }
    this.usuSeleccionado = null;
  }
}