import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Producto } from '../Modelos/producto';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
private baseUrl=environment.apiUrl+'/api/producto'
  constructor(
    private xhttp:HttpClient
  ) { }

  //lista de la api
  getListaProductos():Observable<any[]>{
    return this.xhttp.get<any[]>(this.baseUrl+'/listar');
   }
   verKardexDetallado(id:number):Observable<any>{
    return this.xhttp.get<any>(this.baseUrl+'/kardex/'+id);
   }
   movimientos():Observable<any[]>{
    return this.xhttp.get<any[]>(this.baseUrl+'/movimientos');
   }
   //datos de la API
   saveProductos(pro:FormData):Observable<any>{//adicionar
    let url = this.baseUrl+"/agregar";
    return this.xhttp.post(url,pro)
   }

   guardarProducto(pro:Producto):Observable<any>{//adicionar
    let url = this.baseUrl+"/guardar";
    return this.xhttp.post<any>(url,pro)
   }
     modificarProducto(producto:FormData):Observable<any>{//modificar
      let url = this.baseUrl+"/modificar";
      return this.xhttp.put(url,producto)
     }
      getPDF(body={}): Observable<Blob> {
       return this.xhttp.post(`${environment.apiUrl}/api/reporte-producto/inventario`,body, {
         responseType: 'blob' // 👈 clave para manejar PDF
       });
     }
     catalogoPDF(body={}): Observable<Blob> {
       return this.xhttp.post(`${environment.apiUrl}/api/reporte/catalogo`,body, {
         responseType: 'blob' // 👈 clave para manejar PDF
       });
     }
     beneficioPDF(body={}): Observable<Blob> {
       return this.xhttp.post(`${environment.apiUrl}/api/reporte/ganancias-productos`,body, {
         responseType: 'blob' // 👈 clave para manejar PDF
       });
     }
     datosReporte():Observable<any>{
    return this.xhttp.get<any>(`${environment.apiUrl}/api/reporte-producto/inventario/datos`);
  }
}
