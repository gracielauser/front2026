import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../Servicios/producto.service';
import { ClienteService } from '../../Servicios/cliente.service';
import { MarcaService } from '../../Servicios/marca.service';
import { CategoriaService } from '../../Servicios/categoria.service';
import { ProveedorService } from '../../Servicios/proveedor.service';
import { Categoria } from '../../Modelos/categoria';
import { Cliente } from '../../Modelos/cliente';
import { Proveedor } from '../../Modelos/proveedor';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-principal',
  standalone:true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {

  apiProductos:any[]=[]
  productosStockBajo:any[]=[]
  apiMarcas:any[]=[]
  apiCategorias:any[]=[]
  apiProveedores:any[]=[]
  apiCliente:any[]=[]
  rol: any;
  page: number = 1;

  constructor(
    private proSer:ProductoService,
    private cliSer:ClienteService,
    private marcaSer:MarcaService,
    private cateSer:CategoriaService,
    private proveSer:ProveedorService
  ) { }

  ngOnInit(): void {
    // Cargar rol del usuario desde localStorage
    const rolSeleccionado = localStorage.getItem('rol');
    if (rolSeleccionado) {
      this.rol = JSON.parse(rolSeleccionado);
    }

    this.Producto()
    this.Marca()
    this.Categoria()
    this.Cliente()
    this.Proveedor()
  }

  tienePermiso(permisoId: number): boolean {
    // Rol con id 1 (Administrador) tiene acceso total
    if (this.rol && this.rol.id_rol === 1) {
      return true;
    }

    if (!this.rol || !this.rol.permisos) {
      return false;
    }

    const permisos = this.rol.permisos.split(',');
    return permisos.some(p => Number(p.trim()) === permisoId);
  }
  Producto(){
    this.proSer.getListaProductos().subscribe((lista)=>{
      this.apiProductos=lista
      // Filtrar productos con stock bajo (estado=1 y stock < stock_minimo)
      this.productosStockBajo = lista.filter(producto =>
        producto.estado === 1 && producto.stock < producto.stock_minimo
      );
    })
  }
  Marca(){
    this.marcaSer.getListaMarcas().subscribe((lista)=>{
      this.apiMarcas=lista
    })
  }
  Categoria(){
    this.cateSer.getListaCategoria().subscribe((lista)=>{
      this.apiCategorias=lista
    })
  }
  Proveedor(){
    this.proveSer.getListaProveedor().subscribe((lista)=>{
      this.apiProveedores=lista
    })
  }
  Cliente(){
    this.cliSer.getListaClientes().subscribe((lista)=>{
      this.apiCliente=lista
    })
  }
}
