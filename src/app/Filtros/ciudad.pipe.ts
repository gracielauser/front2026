import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ciudad',
  standalone: true
})
export class CiudadPipe implements PipeTransform {

  transform(lista: any[], ciudad: string): any[] {
    if (ciudad === '' || !ciudad) return lista;
    return lista.filter(item => item.ciudad === ciudad);
  }

}
