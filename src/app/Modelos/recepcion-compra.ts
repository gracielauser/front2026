import { DetallePedido } from "./detalle-pedido"

export interface RecepcionCompra {
    id_recepcion?:number
    cantidad_recibida:number
    fecha_registro:Date
    defectuosos:number
    detalle_pedido?:DetallePedido
}
