import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';

declare var window: any;
//import * as bootstrap from 'bootstrap';
import { Persona } from '../../Modelos/persona.model';
import { PersonaService } from '../../Servicios/persona.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})
export class PersonalComponent implements OnInit {

  modal: any;

  personaModel!: Persona;
  apiPersonal: any[] = []


  constructor(
    private perSer: PersonaService
  ) { }

  ngOnInit() {
    console.log("gcghg");
    this.listar()
  }

  listar() {
    this.perSer.getListaPersonal().subscribe((lista)=>{
      this.apiPersonal = lista
    })
  }
  personaForm = new UntypedFormGroup({
    nombres: new UntypedFormControl('', [Validators.required]),
    foto: new UntypedFormControl('', [Validators.required]),
    apellidos: new UntypedFormControl('', [Validators.required]),
    celular: new UntypedFormControl('', [Validators.required]),
    ci: new UntypedFormControl('', [Validators.required]),
    roles: new UntypedFormControl('', [Validators.required]),
    genero: new UntypedFormControl('', [Validators.required]),
    estado: new UntypedFormControl('1', [Validators.required])
  })
  get control() {
    return this.personaForm.controls
  }
  AgregarPersona() {
    console.log("jungkook");
    this.personaModel = {
      nombre: (this.personaForm.get('nombres')?.value),
      ap_paterno: (this.personaForm.get('apellidos')?.value),
      ap_materno: (this.personaForm.get('apellidos')?.value),
      ci: (this.personaForm.get('ci')?.value),
      genero: (this.personaForm.get('genero')?.value),
      tipo: (this.personaForm.get('roles')?.value),
      celular: (this.personaForm.get('celular')?.value),
      estado: (this.personaForm.get('estado')?.value),
      foto: (null),
    }
    console.log("persona", this.personaModel);
    this.perSer.savePersonal(this.personaModel).subscribe(() => {
      this.listar()
      this.personaForm.reset()
    }
    )
  }
  Cancelar(){
    this.personaForm.reset()
  }

}
