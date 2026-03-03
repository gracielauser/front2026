import { Persona } from "./persona.model"

export interface Usuario {
    id_usuario?:string
    usuario:string
    clave:string
    estado?:number
    persona?:Persona
}
