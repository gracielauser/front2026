import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'proveedor',
  standalone: true
})
export class ProveedorPipe implements PipeTransform {


transform(lista: any[],id_prov:number): any[] {  
    if(id_prov==0)return lista
    else return lista.filter(compra => compra.id_proveedor==id_prov)

}
}