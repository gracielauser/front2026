import { Proveedor } from "./proveedor"
import { Usuario } from "./usuario"

export interface Compra {
    nrocompra?:number
    fecha_registro:Date
    monto_total:number
    estado:number
    descuento:number
    proveedor?:Proveedor
    usuario?:Usuario

}
