import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../Modelos/cliente';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private baseUrl = environment.apiUrl + '/api/cliente';
  constructor(
    private xhttp: HttpClient
  ) { }
  getListaClientes(): Observable<any[]> {
    console.log("en servicio clientes");
    return this.xhttp.get<any[]>(this.baseUrl + '/listar');
  }
  saveCliente(cli: Cliente): Observable<any> {//adicionar
    console.log("entro al servicio");
    let url = this.baseUrl + "/agregar";
    return this.xhttp.post(url, cli)
  }
    modificarCliente(cliente:any):Observable<any>{//modificar
      let url = this.baseUrl+"/modificar";
      return this.xhttp.put(url,cliente)
     }
     getPDF(body={}): Observable<Blob> {
       return this.xhttp.post(`${environment.apiUrl}/api/reporte/clientes`,body, {
         responseType: 'blob' // 👈 clave para manejar PDF
       });
     }
     datosClientes(body: any = {}): Observable<any> {
      console.log("en servicio datos clientes");
      return this.xhttp.post<any>(`${environment.apiUrl}/api/reporte/clientes/datos`, body);
     }
     getExcel(body: any = {}): Observable<HttpResponse<Blob>> {
       return this.xhttp.post(`${environment.apiUrl}/api/reporte-cliente/xlsx`, body, {
         responseType: 'blob',
         observe: 'response'
       });
     }
}
