import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Devoluciones } from '../Modelos/devoluciones';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesService {

  private baseUrl='/api'
  constructor(
    private xhttp:HttpClient
  ) { }
  getListaDevoluciones():Observable<any[]>{
    console.log("en servicio devoclusiones");
    return this.xhttp.get<any[]>(this.baseUrl+'/listadevoluciones');
   }
   saveDevolucion(usu:Devoluciones):Observable<any>{
    let url = this.baseUrl+"/adddev";
    return this.xhttp.post(url,usu)
   }
}
