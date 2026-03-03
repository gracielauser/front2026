import { Producto } from "./producto"

export interface Inventario {
    id_inventario:number
    stock_actual:number
    stock_minimo: number
    fecha_ultimaactualizacion:Date
    producto?:Producto
}
