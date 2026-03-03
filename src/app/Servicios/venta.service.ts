import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venta } from '../Modelos/venta';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
 private baseUrl="/api/venta"
  constructor(
    private xhttp:HttpClient
  ) { }
  getListaVentas():Observable<any[]>{
    return this.xhttp.get<any[]>(this.baseUrl+"/listar")
  }
  saveVenta(ven:any):Observable<any>{
    let url = this.baseUrl+"/agregar";
    return this.xhttp.post(url,ven)
   }
     modificarVenta(venta:any):Observable<any>{//modificar
      let url = this.baseUrl+"/modificar";
      return this.xhttp.put(url,venta)  
     }
     anular(id_venta:number):Observable<any>{
      let url = this.baseUrl+"/anular/"+id_venta;
      return this.xhttp.put(url, null)  
     }
}
