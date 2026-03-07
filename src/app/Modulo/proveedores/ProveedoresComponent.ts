import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { Proveedor } from '../../Modelos/proveedor';
import { ProveedorService } from '../../Servicios/proveedor.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { NombrePipe } from '../../Filtros/nombre.pipe';


@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NgxPaginationModule,FormsModule,EstadoPipe,NombrePipe],
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {

  proveedorModel!: Proveedor;
  apiProveedor: any[] = [];
  estado='1'
  nombre:string=''
  departamento:string=''
  page:number=1
  mensajeExito: string | null = null;
  constructor(
    private proser: ProveedorService
  ) { }

  ngOnInit(): void {
    this.Listar();
  }
  Listar() {
    this.proser.getListaProveedor().subscribe((lista) => {
      this.apiProveedor = lista;
      console.log('proveeodres', this.apiProveedor);

    });
  }
  proveForm = new UntypedFormGroup({
    nombre: new FormControl('', Validators.required),
    celular: new FormControl('', Validators.required),
    email: new FormControl('', [
      Validators.email,
      Validators.minLength(6),
      Validators.maxLength(50),
      Validators.pattern(/^[\w\.-]+@([\w-]+\.)+[A-Za-z]{2,}$/)
    ]),
    ciudad: new FormControl('Tarija', Validators.required),
    direccion: new FormControl(''),
    estado: new FormControl('1'),
  });

  get control() {
    return this.proveForm.controls;
  }
  AgregarProveedor() {
    const Proveedor = this.proveForm.value;
    this.proser.saveProveedor(Proveedor).subscribe({
      next: (data) => {
        this.Listar();
        this.proveForm.reset();
        this.mensajeExito = data.mensaje;
      }, error: (error) => {
        console.log(error);
      }
    });
    const toastEl = document.getElementById('toastExito');
        if (toastEl) {
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
  }
  idProveedor: number = 0;
  ModificarProveedor(proveedor: any) {
    this.idProveedor = proveedor.id_proveedor;
    this.proveForm.patchValue({
      nombre: proveedor.nombre,
      celular: proveedor.celular,
      email: proveedor.email,
      ciudad: proveedor.ciudad,
      direccion: proveedor.direccion,
      estado: proveedor.estado
    });
  }
  guardarModificacion(){
    const proveedor={
      id_proveedor:this.idProveedor,
      ...this.proveForm.value
    }
    this.proser.modificarProveedor(proveedor).subscribe({
       next: (data) => {
      console.log('devuelve: ', data.mensaje, data.nombre);
      this.Listar()
      this.proveForm.reset()
      this.mensajeExito = data.mensaje;
    }, error: (error) => {
      console.log(error);
    }
    })
    const toastEl = document.getElementById('toastExito');
        if (toastEl) {
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
  }
  provSeleccionado: any = null;
  estadoTemporal: number = 0;
  showModal(event: Event, per: any) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    // Revertir el cambio visual hasta que confirme
    input.checked = per.estado == 1;
    // Guardamos referencia al proveedor y estado temporal
    this.provSeleccionado = per;
    this.estadoTemporal = isChecked ? 1 : 2;
    // Mostramos modal dinámico
    const modal = new bootstrap.Modal(document.getElementById('estadoModal')!);
    modal.show();
  }
  cancelarCambio() {
    this.provSeleccionado = null;
  }
  guardarCambio() {
    if (this.provSeleccionado) {
      this.provSeleccionado.estado = this.estadoTemporal;
      this.proser.modificarProveedor(this.provSeleccionado).subscribe({
         next: (data) => {
      console.log('devuelve: ', data.mensaje, data.nombre);
      this.Listar()
       this.mensajeExito = data.mensaje;
    }, error: (error) => {
      console.log(error);
    }
      })
    }
    this.provSeleccionado = null;
    // Mostrar mensaje de éxito
    const toastEl = document.getElementById('toastExito');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
}
