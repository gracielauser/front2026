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
}
