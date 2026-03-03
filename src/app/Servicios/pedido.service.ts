import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido } from '../Modelos/pedido';
import { Xtb } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private baseUrl='/api/pedido'
  constructor(
    private xhttp:HttpClient
  ) { }
  getListaPedidos():Observable<any[]>{
    console.log("en servicio pedidos");
    return this.xhttp.get<any[]>(this.baseUrl+'/listar');
   }
   savePedido(usu:Pedido):Observable<any>{
    let url = this.baseUrl+"/agregar";
    return this.xhttp.post<any>(url,usu)
   }
  }