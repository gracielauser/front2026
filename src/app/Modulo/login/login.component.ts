import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from '../../Modelos/Login.model';
import { Usuario } from '../../Modelos/usuario';
import { LoginService } from '../../Servicios/login.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  standalone:true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginDat!:Login;
  errorMessage: string = '';

  constructor(
    private logser:LoginService,
    private router:Router
  ) {
     }
  ngOnInit(): void {
    localStorage.removeItem('usuario');
  localStorage.removeItem('rol');
  localStorage.removeItem('token');
  }
  loginForm=new UntypedFormGroup({
    login:new UntypedFormControl('userprimer',[Validators.required]),
    password:new UntypedFormControl('1234',[Validators.required])
   })
  guardarDatos(){
    this.errorMessage = '';
    const us:any={
      usuario:(this.loginForm.get('login')?.value),
      clave:(this.loginForm.get('password')?.value)
    }
this.logser.obtenerUsuario(us).subscribe({
  next: (data) => {
    console.log(data);
    if(data==null)console.log("no existe usuario");
    else{
      localStorage.setItem('usuario',JSON.stringify(data.user))
      localStorage.setItem('token',JSON.stringify(data.token))

      this.router.navigate(['/home'])
    }
  },
  error: (error) => {
    console.log('Error en login:', error);
    if(error.error && error.error.mensaje){
      this.errorMessage = error.error.mensaje;
    } else if(error.error && typeof error.error === 'string'){
      this.errorMessage = error.error;
    } else {
      this.errorMessage = 'Error al iniciar sesión. Intente nuevamente';
    }
  }
})
  }

  get d(){
    return this.loginForm.controls
  }




}
