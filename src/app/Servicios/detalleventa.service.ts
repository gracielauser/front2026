import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DetalleVenta } from '../Modelos/detalle-venta';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetalleventaService {

  private baseUrl=environment.apiUrl+'/api'
  constructor(
    private xhttp:HttpClient
  ) { }
  getListaDV():Observable<any[]>{
    console.log("en servicio dv");
    return this.xhttp.get<any[]>(this.baseUrl+'/listadetalleventa');
   }
   saveDV(usu:DetalleVenta):Observable<any>{
    let url = this.baseUrl+"/adddetallev";
    return this.xhttp.post(url,usu)
   }
   detalles(id:number):Observable<any[]>{
    return this.xhttp.get<any[]>(this.baseUrl+"/listadetalleventa/"+id)
   }
  }
