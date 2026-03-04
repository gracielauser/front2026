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
    console.log("en servicio");
    return this.xhttp.get<any[]>(this.baseUrl+'/listar');
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
}
