import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Compra } from '../Modelos/compra';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompraService {

private baseUrl= environment.apiUrl+'/api/compra'
  constructor(
    private xhttp:HttpClient
  ) { }
  getListaCompra():Observable<any[]>{
    console.log("en servicio compras");
    return this.xhttp.get<any[]>(this.baseUrl+'/listar');
   }
   saveCompra(usu:any):Observable<any>{
    let url = this.baseUrl+"/agregar";
    return this.xhttp.post<any>(url,usu)
   }
     modificarCompra(compra:any):Observable<any>{//modificar
      let url = this.baseUrl+"/modificar";
      return this.xhttp.put(url,compra)
     }
     anular(id:number):Observable<any>{
      let url = this.baseUrl+"/anular/"+id;
      return this.xhttp.put(url, null)
     }
     recibirCompra(modif: any):Observable<any>{
return this.xhttp.put(this.baseUrl + '/recibir', modif);
     }
      getPDF(body={}): Observable<Blob> {
       return this.xhttp.post(`${environment.apiUrl}/api/reporte-compra/compras`,body, {
         responseType: 'blob' // 👈 clave para manejar PDF
       });
     }
}
