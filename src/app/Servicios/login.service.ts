import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../Modelos/usuario';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private baseUrl = environment.apiUrl+'/api'

  constructor(private xhttp: HttpClient) {


  }
  obtenerUsuarioLogueado() {
    const usuarioJSON = localStorage.getItem('usuario');
    if (!usuarioJSON) return 'Invitado';
    const usuario: any = JSON.parse(usuarioJSON);
    return usuario
  }

  obtenerUsuario(usuario: any): Observable<any> {
    return this.xhttp.post<any>(this.baseUrl + "/auth/login", usuario)
  }
  getPersonal(xuser: string, xclave: string): Observable<any> {
    const body = new HttpParams()
      .set('login', xuser)
      .set('password', xclave);
    console.log("paso por aqui")
    return this.xhttp.post('/api/login',

      body.toString(),
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
      }
    );

  }


}
