import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Usuario } from '../../Modelos/usuario';
import { RouterModule } from '@angular/router';
import { LoginService } from '../../Servicios/login.service';

@Component({
  selector: 'app-sidevar',
  standalone:true,
  imports:[CommonModule, RouterModule],
  templateUrl: './sidevar.component.html',
  styleUrls: ['./sidevar.component.css'],
   encapsulation: ViewEncapsulation.None
})
export class SidevarComponent implements OnInit {

  activeMenu: string | null = null;

  constructor(private logSer: LoginService) { }
  rol:any;
  usuario:null
  rols:any[]=[]
  ngOnInit(): void {
     const usuarioJSON = localStorage.getItem('usuario');
    const usuario: any = JSON.parse(usuarioJSON);
   this.rols = usuario.rols
   console.log(usuario);
     const rolSelccionado = localStorage.getItem('rol');
   console.log('nuevo rol: ', JSON.parse(rolSelccionado));
   this.rol =  JSON.parse(rolSelccionado)
  }
  tienePermiso(permisoId: number): boolean {
    const permisos = this.rol.permisos.split(',');
    return permisos.some(p => Number(p) === permisoId);
  }

  toggleSubmenu(event: Event, menuName: string): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.activeMenu === menuName) {
      this.activeMenu = null;
    } else {
      this.activeMenu = menuName;
    }
  }

  isMenuActive(menuName: string): boolean {
    return this.activeMenu === menuName;
  }
  obtenerUsuario(): string {//esta mal depende cada rato de la llamada al local storage
  const usuarioJSON = localStorage.getItem('usuario');
  if (!usuarioJSON) return 'Invitado';

  try {
    const usuario: any = JSON.parse(usuarioJSON);
   const nombreRol = usuario.rols[0].nombre ?? '';
    const nombre = `${usuario.empleado.nombre} ${usuario.empleado.ap_paterno ?? ''}`.trim();
    return nombre || 'Invitado';
  } catch {
    return 'Invitado';
  }
}

}
