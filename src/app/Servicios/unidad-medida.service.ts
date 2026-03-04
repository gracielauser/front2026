import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {
private baseUrl=environment.apiUrl+'/api/unidad'
constructor(
    private xhttp:HttpClient
  ) { }
  getListaUnidades():Observable<any[]>{
    return this.xhttp.get<any[]>(this.baseUrl+'/listar');
   }
   saveUnidad(unidad:any):Observable<any>{//adicionar
    let url = this.baseUrl+"/agregar";
    return this.xhttp.post(url,unidad)
   }
   modificarUnidad(unidad:any):Observable<any>{//modificar
      let url = this.baseUrl+"/modificar";
      return this.xhttp.put(url,unidad)
     }
}
