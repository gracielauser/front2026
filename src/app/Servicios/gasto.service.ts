import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GastoService {

  private baseUrl=environment.apiUrl+'/api/gasto'
    constructor(
      private xhttp:HttpClient
    ) { }
    getListaGasto():Observable<any[]>{
      console.log("en servicio gastos");
      return this.xhttp.get<any[]>(this.baseUrl+'/listar');
     }
     saveGasto(gasto:any):Observable<any>{//adicionar
      let url = this.baseUrl+"/agregar";
      return this.xhttp.post(url,gasto)
     }
       anularGasto(gasto:any):Observable<any>{//anular
      let url = this.baseUrl+"/anular";
      return this.xhttp.put(url,gasto)
     }
}
