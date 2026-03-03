import { Producto } from "./producto"
import { Venta } from "./venta"

export interface DetalleVenta {
    id_detalleventa:number
    cantidad:number
    impuestos:number
    precio_venta:number
    subtotal:number
    producto?:Producto
    venta?:Venta
}
