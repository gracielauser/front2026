import { Venta } from "./venta"

export interface Factura {
    nro_factura:number
    fecha_emision:Date
    impuesto:number
    total:number
    venta?:Venta
}
