import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../Servicios/producto.service';
import { ClienteService } from '../../Servicios/cliente.service';
import { MarcaService } from '../../Servicios/marca.service';
import { CategoriaService } from '../../Servicios/categoria.service';
import { ProveedorService } from '../../Servicios/proveedor.service';
import { Categoria } from '../../Modelos/categoria';
import { Cliente } from '../../Modelos/cliente';
import { Proveedor } from '../../Modelos/proveedor';

@Component({
  selector: 'app-principal',
  standalone:true,
  imports: [],
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {

  apiProductos:any[]=[]
  apiMarcas:any[]=[]
  apiCategorias:any[]=[]
  apiProveedores:any[]=[]
  apiCliente:any[]=[]
  constructor(
    private proSer:ProductoService,
    private cliSer:ClienteService,
    private marcaSer:MarcaService,
    private cateSer:CategoriaService,
    private proveSer:ProveedorService
  ) { }

  ngOnInit(): void {
    this.Producto()
    this.Marca()
    this.Categoria()
    this.Cliente()
    this.Proveedor()
  }
  Producto(){
    this.proSer.getListaProductos().subscribe((lista)=>{
      this.apiProductos=lista
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
