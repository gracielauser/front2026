import { Pedido } from "./pedido"
import { Producto } from "./producto"

export interface DetallePedido {
    id_detallepedido?:number
    cantidad:number
    precio_unitario:number
    subtotal:number
    producto:string
    pedido?:Pedido
}
