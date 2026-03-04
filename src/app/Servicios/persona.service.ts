import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Persona } from '../Modelos/persona.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {

private baseUrl=environment.apiUrl+'/api/empleados'

  constructor(
    private http:HttpClient
  ) {

  }

    //lista de la api
    getListaPersonal():Observable<any[]>{
      console.log("en servicio");
      return this.http.get<any[]>(this.baseUrl+'/listar');
     }
     //datos de la API
     savePersonal(per:Persona):Observable<any>{//adicionar
      console.log('llega al servicio');

      let url = this.baseUrl+"/agregar";
      return this.http.post(url,per)
     }
}
