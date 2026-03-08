import { Categoria } from "./categoria"
import { Proveedor } from "./proveedor"

export interface Marca {
    id_marca?: number;
    nombre: string;
    descripcion?: string;
    estado?: number;
}

export interface UnidadMedida {
    id_unidad_medida?: number;
    nombre: string;
    abreviatura: string;
    estado?: number;
}

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
    stock?:number
    id_categoria?:number
    id_marca?:number
    id_unidad_medida?:number
    categoria?:Categoria
    categorium?:Categoria
    proveedor?:Proveedor
    marca?:Marca
    unidad_medida?:UnidadMedida
}
