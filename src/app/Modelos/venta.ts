import { Cliente } from "./cliente"
import { Usuario } from "./usuario"

export interface Venta {
    id_venta?:number
    tipo_venta:number
    tipo_pago:number
    fecha_registro:Date
    monto_total:number
    estado:number
    descuento:number
    confactura:number
    usuario?:Usuario
    cliente?:Cliente
}
