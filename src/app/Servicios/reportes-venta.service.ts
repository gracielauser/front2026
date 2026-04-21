import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesVentaService {
 private baseUrl=environment.apiUrl+'/api/reporte-venta';
  constructor(
    private xhttp:HttpClient
  ) { }
  getReporteVenta(diVenta: number):Observable<Blob>{
    return this.xhttp.get(this.baseUrl+'/notaVenta/'+diVenta,{
    responseType: 'blob' // 👈 clave para manejar PDF
  });
   }
   datosNegocio(desde: string = '', hasta: string = ''): Observable<any> {
    console.log("en servicio datos negocio", {desde, hasta});
    let params = '';
    if (desde && hasta) {
      params = `?desde=${desde}&hasta=${hasta}`;
    } else if (desde) {
      params = `?desde=${desde}`;
    } else if (hasta) {
      params = `?hasta=${hasta}`;
    }
    return this.xhttp.get<any>(`${environment.apiUrl}/api/reporte/resultados/datos${params}`);
  }
  getResultados():Observable<Blob>{
    return this.xhttp.post(`${environment.apiUrl}/api/reporte/resultados`,{},{
    responseType: 'blob' // 👈 clave para manejar PDF
  });
   }
   tendenciaVentas(body={}): Observable<any> {
    return this.xhttp.post<any>(`${environment.apiUrl}/api/reporte-tendencia/datos-tendencia`,body, {
    });
  }
   tendenciaPDF(body={}): Observable<Blob> {
    return this.xhttp.post(`${environment.apiUrl}/api/reporte-tendencia/tendenciaPDF`,body, {
      responseType: 'blob' // 👈 clave para manejar PDF
    });
  }
}
