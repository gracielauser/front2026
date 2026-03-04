import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DetallePedido } from '../Modelos/detalle-pedido';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetallepedidoService {

  private baseUrl=environment.apiUrl+'/api/det_compra'
  constructor(
    private xhttp:HttpClient
  ) { }
  getListaDP():Observable<any[]>{
    console.log("en servicio dp");
    return this.xhttp.get<any[]>(this.baseUrl+'/listar');
   }
   saveDP(usu:any):Observable<any>{
    let url = this.baseUrl+"/agregar";
    return this.xhttp.post(url,usu)
   }
   detalles(id:number):Observable<any[]>{
    return this.xhttp.get<any[]>(this.baseUrl+"/listar/"+id)
   }
}
