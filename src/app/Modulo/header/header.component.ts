import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../Modelos/usuario';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../Servicios/login.service';
import { RolesComponent } from '../roles/roles.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {

  constructor(private logSer: LoginService) { }
  roles: any[] = []
  nombreRol = ''

  ngOnInit(): void {
    this.obtenerUsuario()
  }

  rol!: number

  obtenerUsuario() {
    const usuario = this.logSer.obtenerUsuarioLogueado()
    this.roles = usuario.rols
    const rol = localStorage.getItem('rol')
    if (rol) {
      const rolObj = JSON.parse(rol)
      this.nombreRol = rolObj.nombre
    } else {
      this.cambiarRol(this.roles[0])
      localStorage.setItem('rol', JSON.stringify(this.roles[0]))
      this.nombreRol = this.roles[0].nombre
    }
    console.log('roles', this.roles);
  }

  cambiarRol(rol: any) {
    this.nombreRol = rol.nombre
    localStorage.setItem('rol', JSON.stringify(rol))
    window.location.reload();
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) {
      sidebar.classList.toggle('sidebar-open');
    }
    if (overlay) {
      overlay.classList.toggle('active');
    }
  }

}
