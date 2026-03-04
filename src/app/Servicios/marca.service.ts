import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {

private baseUrl=environment.apiUrl+'/api/marca'
  constructor(
    private xhttp:HttpClient
  ) { }
  getListaMarcas():Observable<any[]>{
    console.log("en servicio marcas");
    return this.xhttp.get<any[]>(this.baseUrl+'/listar');
   }
   saveMarca(marca:any):Observable<any>{//adicionar
    let url = this.baseUrl+"/agregar";
    return this.xhttp.post(url,marca)
   }
     modificarMarca(marca:any):Observable<any>{//modificar
      let url = this.baseUrl+"/modificar";
      return this.xhttp.put(url,marca)
     }
}
