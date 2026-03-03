import { Routes } from '@angular/router';
import { LoginComponent } from './Modulo/login/login.component';
import { HomeComponent } from './Modulo/home/home.component';
import { PrincipalComponent } from './Modulo/principal/principal.component';
import { UsuariosComponent } from './Modulo/usuarios/usuarios.component';
import { PersonalComponent } from './Modulo/personal/personal.component';
import { ProveedoresComponent } from './Modulo/proveedores/ProveedoresComponent';
import { ClientesComponent } from './Modulo/clientes/clientes.component';
import { VentasComponent } from './Modulo/ventas/ventas.component';
import { InventarioComponent } from './Modulo/inventario/inventario.component';
import { ProductosComponent } from './Modulo/productos/productos.component';
import { ComprasComponent } from './Modulo/compras/compras.component';
import { ReportesComponent } from './Modulo/reportes/reportes.component';
import { CategoriaComponent } from './Modulo/categoria/categoria.component';
import { SidevarComponent } from './Modulo/sidevar/sidevar.component';
import { FooterComponent } from './Modulo/footer/footer.component';
import { HeaderComponent } from './Modulo/header/header.component';
import { EmpleadosComponent } from './Modulo/empleados/empleados.component';
import { RolesComponent } from './Modulo/roles/roles.component';
import { MarcasComponent } from './Modulo/marcas/marcas.component';
import { UnidadesComponent } from './Modulo/unidades/unidades.component';
import { GastosComponent } from './Modulo/gastos/gastos.component';
import { PedidosComponent } from './Modulo/pedidos/pedidos.component';
import { KardexComponent } from './Modulo/kardex/kardex.component';
import { DashboardComponent } from './Modulo/dashboard/dashboard.component';

export const routes: Routes = [
    //{path: '', component:LoginComponent},
  {path:'',redirectTo:'/login', pathMatch:'full'},
   {path: 'login', component:LoginComponent},
  { path:'home', component:HomeComponent,
    children:[
       { path: '', redirectTo: 'principal', pathMatch: 'full' },
      {path:'principal',component:PrincipalComponent},
      {path:'empleados', component:EmpleadosComponent},
      {path:'usuarios', component:UsuariosComponent},
      {path:'clientes', component:ClientesComponent},
      {path:'proveedores', component:ProveedoresComponent},
      {path:'ventas', component:VentasComponent},
      {path:'compras', component:ComprasComponent},
      {path:'productos', component:ProductosComponent},
      {path:'dashboard', component:DashboardComponent},
      {path:'inventario', component:InventarioComponent},
      {path:'reportes', component:ReportesComponent},
      {path:'categoria', component:CategoriaComponent},
      {path:'roles',component:RolesComponent},
      {path:'marcas',component:MarcasComponent},
      {path:'unidades',component:UnidadesComponent},
      {path:'gastos',component:GastosComponent},
      {path:'pedidos',component:PedidosComponent},
      {path:'kardex',component:KardexComponent}
    ]
  },
  {path:'header', component:HeaderComponent, outlet:'cabeza'},
  {path:'footer', component:FooterComponent, outlet:'pie'},
  {path:'sidevar', component:SidevarComponent, outlet:'menu'},

  { path: '**', redirectTo: '/login' }
];
