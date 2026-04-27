import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venta } from '../Modelos/venta';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
 private baseUrl=environment.apiUrl+"/api/venta"
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
       notaVenta(idVenta:number,nota:boolean=true, enviarEmail:boolean=false): Observable<Blob> {
  // const params = new HttpParams()// Opción B: Construir parámetros en cadena
  //     .set('idVenta', idVenta)
  // .set('partido', this.currentUser().partido);

  return this.xhttp.post(`${environment.apiUrl}/api/reporte-venta/notaVenta/`+idVenta, {nota: nota, enviarEmail: enviarEmail}, {
    // params,
    responseType: 'blob' // 👈 clave para manejar PDF
  });
}
     getPDF(body={},resumido:boolean): Observable<Blob> {
  if(resumido){
    return this.xhttp.post(`${environment.apiUrl}/api/reporte-venta/reporteVentas-resumido`,body, {
      responseType: 'blob' // 👈 clave para manejar PDF
    });
  } else {
    return this.xhttp.post(`${environment.apiUrl}/api/reporte-venta/reporteVentas-detallado`,body, {
      responseType: 'blob' // 👈 clave para manejar PDF
    });
  }
}
 facturas(): Observable<Blob> {
    return this.xhttp.post(`${environment.apiUrl}/api/reporte/facturas`,{}, {
      responseType: 'blob' // 👈 clave para manejar PDF
    });
}
getExcel(body={}): Observable<Blob> {
  return this.xhttp.post(`${environment.apiUrl}/api/reporte-venta/reporteVentas-resumido/xlsx`, body, {
    responseType: 'blob'
  });
}
datosVentas(): Observable<any> {
  console.log("en servicio datos ventas");
  return this.xhttp.get<any>(`${environment.apiUrl}/api/reporte-venta/reporteVentas-resumido/datos`);
}
}
