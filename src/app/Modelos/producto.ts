import { Categoria } from "./categoria"
import { Proveedor } from "./proveedor"

export interface Producto {
    id_producto?:number
    nombre:string
    codigo?:string
    descripcion?:string
    estado?:number
    precio_compra?:number
    precio_venta?:number
    cantidad?:number
    foto?:string
    defectuosos?:number
    fecha_registro:Date
    stock_minimo:number
    categoria?:Categoria
    proveedor?:Proveedor
}
