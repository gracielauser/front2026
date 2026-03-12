import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-footer',
  standalone:true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    const usuario = localStorage.getItem('usuario');
    const usu = JSON.parse(usuario || '{}');
    if (usuario) {
      this.PersonaNombre = `${usu.empleado?.nombre || 'Usuario'} ${usu.empleado?.ap_paterno || ''} ${usu.empleado?.ap_materno || ''}`.trim() || 'Usuario';
    }
  }
PersonaNombre=''
  mostrarModalCerrarSesion(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const modal = new bootstrap.Modal(document.getElementById('cerrarSesionModal')!);
    modal.show();
  }

  confirmarCerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  cancelarCerrarSesion() {
    // Solo cierra el modal, no hace nada más
  }
}
