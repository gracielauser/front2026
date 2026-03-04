import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../Modelos/usuario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private baseUrl=environment.apiUrl+'/api/usuarios'
  constructor(
    private xhttp:HttpClient
  ) { }
  getListaUsuario():Observable<any[]>{
    console.log("en servicio usuarios");
    return this.xhttp.get<any[]>(this.baseUrl+'/listar');
   }
   saveUsuario(usu:Usuario):Observable<any>{
    let url = this.baseUrl+"/agregar";
    return this.xhttp.post(url,usu)//este usus es lo que en el backend recibo como req.body
   }
    modificarUsuario(usuario:any):Observable<any>{//modificar
      let url = this.baseUrl+"/modificar";
      return this.xhttp.put(url,usuario)
     }
}
