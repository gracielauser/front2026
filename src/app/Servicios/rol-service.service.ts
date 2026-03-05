import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolServiceService {
  private baseUrl = environment.apiUrl+'/api/rol'

  constructor(private http: HttpClient) { }
  agregar(rol: any): Observable<any> {
    return this.http.post(this.baseUrl+'/agregar', rol)
  }
  listar(): Observable<any> {
    return this.http.get(this.baseUrl+'/listar');
  }
  asignarRol(usu_Rol: any): Observable<any> {
    return this.http.post(this.baseUrl+'/asignar', usu_Rol);
  }
  modificarRol(rol: any): Observable<any> {//modificar
    let url = this.baseUrl + "/modificar";
    return this.http.put(url, rol)
  }
}
