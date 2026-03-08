import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Proveedor } from '../Modelos/proveedor';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  private baseUrl=environment.apiUrl+'/api/proveedor'
  constructor(
    private xhttp:HttpClient
  ) { }
  getListaProveedor():Observable<any[]>{
    console.log("en servicio proveedors");
    return this.xhttp.get<any[]>(this.baseUrl+'/listar');
   }
   saveProveedor(pro:any):Observable<any>{
    let url = this.baseUrl+"/agregar";
    return this.xhttp.post(url,pro)
   }
     modificarProveedor(proveedor:any):Observable<any>{//modificar
      let url = this.baseUrl+"/modificar";
      return this.xhttp.put(url,proveedor)
     }
}
