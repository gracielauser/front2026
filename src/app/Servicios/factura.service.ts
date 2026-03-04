import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Factura } from '../Modelos/factura';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {

  private baseUrl=environment.apiUrl+'/api'
  constructor(
    private xhttp:HttpClient
  ) { }
  getListaFacturas():Observable<any[]>{
    console.log("en servicio factura");
    return this.xhttp.get<any[]>(this.baseUrl+'/listafacturas');
   }
   savefactura(usu:Factura):Observable<any>{
    let url = this.baseUrl+"/addfac";
    return this.xhttp.post(url,usu)
   }
}
