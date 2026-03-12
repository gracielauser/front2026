import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Inventario } from '../Modelos/inventario';
import { RecepcionCompra } from '../Modelos/recepcion-compra';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private baseUrl=environment.apiUrl+'/api/inventario'
  constructor(
    private xhttp:HttpClient
  ) { }
  getListaInventario():Observable<any[]>{
    console.log("en servicio inventarios");
    return this.xhttp.get<any[]>(this.baseUrl+'/listainventario');
   }
   saveInventario(usu:any):Observable<any>{
    let url = this.baseUrl+"/agregar";
    return this.xhttp.post(url,usu)
   }

}
