import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../Modelos/categoria';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
private baseUrl='/api/categoria'
  constructor(
    private xhttp:HttpClient
  ) { }
  getListaCategoria():Observable<any[]>{
    console.log("en servicio categorias");
    return this.xhttp.get<any[]>(this.baseUrl+'/listar');
   }
   agregarCategoria(cat:Categoria):Observable<any>{//adicionar
    console.log("Objeto agregado:", cat);
    let url = this.baseUrl+"/agregar";
    return this.xhttp.post(url,cat)
   }
   modificarCategoria(categoria:any):Observable<any>{//modificar
      let url = this.baseUrl+"/modificar";
      return this.xhttp.put(url,categoria)  
     }
}
