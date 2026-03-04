import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

private baseUrl=environment.apiUrl+'/api/empleados'

  constructor(
    private http:HttpClient
  ) { }
    //lista de la api
    getListaEmpleado():Observable<any[]>{
      console.log("en servicio");
      return this.http.get<any[]>(this.baseUrl+'/listar');
     }
     //datos de la API
     saveEmpleado(empleado:any):Observable<any>{//adicionar
      console.log('llega al servicio');
      let url = this.baseUrl+"/agregar";
      return this.http.post(url,empleado)
     }
     modificarEmpleado(empleado:any):Observable<any>{//modificar
      let url = this.baseUrl+"/modificar";
      return this.http.put(url,empleado)
     }
     validarCi(ci: string):Observable<any>{
      return this.http.get<any>(`${this.baseUrl}/validar-ci/${ci}`);
     }
}
