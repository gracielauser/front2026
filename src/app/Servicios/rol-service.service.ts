import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolServiceService {
  private baseUrl = '/api/empleados'

  constructor(private http: HttpClient) { }
  agregar(rol: any): Observable<any> {
    return this.http.post('api/rol/agregar', rol)
  }
  listar(): Observable<any> {
    return this.http.get('api/rol/listar');
  }
  asignarRol(usu_Rol: any): Observable<any> {
    return this.http.post('api/rol/asignar', usu_Rol);
  }
  modificarRol(rol: any): Observable<any> {//modificar
    let url = this.baseUrl + "/modificar";
    return this.http.put(url, rol)
  }
}
