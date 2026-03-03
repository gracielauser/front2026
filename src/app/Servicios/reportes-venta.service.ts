import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesVentaService {
 private baseUrl='/api/reporte-venta';
  constructor(
    private xhttp:HttpClient
  ) { }
  getReporteVenta(diVenta: number):Observable<Blob>{
    return this.xhttp.get(this.baseUrl+'/notaVenta/'+diVenta,{
    responseType: 'blob' // 👈 clave para manejar PDF
  });
   }
}
