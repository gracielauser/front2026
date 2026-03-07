export interface Categoria {
    id_categoria?:number
    nombre:string
    estado:number
    descripcion:string
    id_categoria_padre?: number | null
    subCategoria?: Categoria[]
}
