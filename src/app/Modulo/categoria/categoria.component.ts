import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import * as bootstrap from 'bootstrap';
import { Categoria } from '../../Modelos/categoria';
import { CategoriaService } from '../../Servicios/categoria.service';
import { CommonModule } from '@angular/common';
import { EstadoPipe } from '../../Filtros/estado.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { NombrePipe } from '../../Filtros/nombre.pipe';
@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EstadoPipe,NgxPaginationModule,FormsModule,NombrePipe],
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css']
})
export class CategoriaComponent implements OnInit, AfterViewInit {

  // Referencias a modales
  @ViewChild('modalUnificado') modalUnificadoRef!: ElementRef;
  @ViewChild('modalUnificadoSubcategoria') modalSubcategoriaRef!: ElementRef;
  @ViewChild('modalConfirmacion') modalConfirmacionRef!: ElementRef;

  private modalUnificado?: bootstrap.Modal;
  private modalSubcategoria?: bootstrap.Modal;
  private modalConfirmacion?: bootstrap.Modal;

  categoriaModel!: Categoria;
  apiCategoria: any[] = []
  estado=''
  nombre:string=''
  page:number=1

  // Variables para modal unificado
  isEditMode: boolean = false;
  modalTitle: string = 'Nueva Categoría';
  esSubcategoria: boolean = false;
  categoriaPadreId: number | null = null;
  categoriaPadreNombre: string = '';
  categoriaEnEdicion: Categoria | null = null;

  // Variables para guardar estado del modal padre cuando se abre modal hijo
  private estadoModalPadreGuardado: any = null;

  // Variables para toast
  exito: boolean = true;
  mensajeToast: string = '';

  mensajeExito: string | null = null;
cambioEstado(event: any){
  this.estado=event.target.value
}
  constructor(
    private catser: CategoriaService
  ) { }

  ngOnInit(): void {
    this.Listar()
  }

  ngAfterViewInit(): void {
    // Inicializa los modales de Bootstrap
    this.modalUnificado = new bootstrap.Modal(this.modalUnificadoRef.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalSubcategoria = new bootstrap.Modal(this.modalSubcategoriaRef.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    this.modalConfirmacion = new bootstrap.Modal(this.modalConfirmacionRef.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
  }
  cateForm = new UntypedFormGroup({
    nombre: new UntypedFormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
    descripcion: new UntypedFormControl('', [Validators.minLength(6), Validators.maxLength(50)])
  })

  get control() {
    return this.cateForm.controls
  }

  getCategoriasPadre(): any[] {
    if (!this.apiCategoria || !Array.isArray(this.apiCategoria)) {
      return [];
    }
    return this.apiCategoria.filter(cat => !cat.id_categoria_padre);
  }

  getSubcategorias(idPadre: number): any[] {
    if (!this.apiCategoria || !Array.isArray(this.apiCategoria)) {
      return [];
    }
    const categorias = this.apiCategoria.find(cat => cat.id_categoria == idPadre);
    return categorias ? categorias.subCategoria || [] : [];
  }

  // ==================== MÉTODOS DE CONTROL DE MODALES ====================

  abrirModalUnificado(): void {
    if (this.modalUnificado) {
      this.modalUnificado.show();
    }
  }

  cerrarModalUnificado(): void {
    if (this.modalUnificado) {
      this.modalUnificado.hide();
      this.limpiarBackdrop();
    }
  }

  abrirModalSubcategoria(): void {
    if (this.modalSubcategoria) {
      this.modalSubcategoria.show();
    }
  }

  cerrarModalSubcategoria(): void {
    if (this.modalSubcategoria) {
      this.modalSubcategoria.hide();
      // Restaurar estado del modal padre
      this.restaurarEstadoModalPadre();
      // No limpiar el backdrop totalmente, solo ajustar para que el modal padre siga visible
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 1) {
          backdrops[backdrops.length - 1].remove();
        }
        document.body.classList.add('modal-open');
      }, 150);
    }
  }

  abrirModalConfirmacion(): void {
    if (this.modalConfirmacion) {
      this.modalConfirmacion.show();
    }
  }

  cerrarModalConfirmacion(): void {
    if (this.modalConfirmacion) {
      this.modalConfirmacion.hide();
      // No limpiar el backdrop si hay un modal padre abierto
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 1) {
          backdrops[backdrops.length - 1].remove();
        }
        // Si solo queda un backdrop o ninguno, verificar si hay modales abiertos
        const modalesAbiertos = document.querySelectorAll('.modal.show');
        if (modalesAbiertos.length === 0) {
          this.limpiarBackdrop();
        } else {
          document.body.classList.add('modal-open');
        }
      }, 150);
    }
  }

  limpiarBackdrop(): void {
    // Elimina todos los backdrops residuales
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    // Habilita el scroll del body
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0';
    document.body.classList.remove('modal-open');
  }

  // ==================== MÉTODOS DE MODAL ====================

  abrirModalNueva(categoriaPadre?: Categoria): void {
    if (categoriaPadre) {
      // Guardar estado del modal padre antes de abrir modal hijo
      this.guardarEstadoModalPadre();

      this.isEditMode = false;
      this.esSubcategoria = true;
      this.modalTitle = `Nueva Subcategoría`;
      this.categoriaPadreId = categoriaPadre.id_categoria!;
      this.categoriaPadreNombre = categoriaPadre.nombre;
      this.cateForm.reset();
      this.abrirModalSubcategoria();
    } else {
      this.isEditMode = false;
      this.esSubcategoria = false;
      this.categoriaEnEdicion = null;
      this.modalTitle = 'Nueva Categoría';
      this.categoriaPadreId = null;
      this.categoriaPadreNombre = '';
      this.cateForm.reset();
      this.abrirModalUnificado();
    }
  }

  abrirModalEditar(categoria: Categoria, esSubcategoria: boolean = false): void {
    if (esSubcategoria) {
      // Guardar estado del modal padre antes de abrir modal hijo
      this.guardarEstadoModalPadre();

      this.isEditMode = true;
      this.esSubcategoria = true;
      this.idCategoria = categoria.id_categoria!;
      this.modalTitle = `Modificar Subcategoría`;
      this.cateForm.patchValue({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion
      });
      this.abrirModalSubcategoria();
    } else {
      this.isEditMode = true;
      this.esSubcategoria = false;
      this.idCategoria = categoria.id_categoria!;
      this.categoriaEnEdicion = categoria;
      this.modalTitle = `Modificar Categoría`;
      this.cateForm.patchValue({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion
      });
      this.abrirModalUnificado();
    }
  }
  // ==================== MÉTODOS CRUD ====================

  Listar() {
    this.catser.getListaCategoria().subscribe((lista) => {
      this.apiCategoria = lista;
      console.log('categorias: ',lista);

      // Actualizar categoriaEnEdicion si está abierta para reflejar cambios en subcategorías
      if (this.categoriaEnEdicion && this.categoriaEnEdicion.id_categoria) {
        const categoriaActualizada = lista.find(cat => cat.id_categoria === this.categoriaEnEdicion!.id_categoria);
        if (categoriaActualizada) {
          this.categoriaEnEdicion = categoriaActualizada;
        }
      }
    })
  }

  guardarCategoria(): void {
    if (this.cateForm.invalid) {
      this.cateForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.actualizarCategoria();
    } else {
      this.crearCategoria();
    }
  }

  crearCategoria(): void {
    const categoria = {
      ...this.cateForm.value,
      estado: 1,
      id_categoria_padre: this.categoriaPadreId
    };

    this.catser.agregarCategoria(categoria).subscribe({
      next: (data) => {
        console.log('Categoría creada:', data.mensaje);
        this.Listar();
        this.exito = true;
        this.mensajeToast = data.mensaje || 'Categoría creada exitosamente';
        this.mostrarToast();

        if (this.esSubcategoria) {
          this.cerrarModalSubcategoria();
        } else {
          this.limpiarForm();
          this.cerrarModalUnificado();
        }
      },
      error: (error) => {
        console.log('Error al crear categoría:', error);
        this.exito = false;
        this.mensajeToast = 'Error al crear la categoría';
        this.mostrarToast();
      }
    });
  }

  actualizarCategoria(): void {
    const categoria = {
      id_categoria: this.idCategoria,
      ...this.cateForm.value
    };

    this.catser.modificarCategoria(categoria).subscribe({
      next: (data) => {
        console.log('Categoría modificada:', data.mensaje);
        this.Listar();
        this.exito = true;
        this.mensajeToast = data.mensaje || 'Categoría actualizada exitosamente';
        this.mostrarToast();

        if (this.esSubcategoria) {
          this.cerrarModalSubcategoria();
        } else {
          this.limpiarForm();
          this.cerrarModalUnificado();
        }
      },
      error: (error) => {
        console.log('Error al modificar categoría:', error);
        this.exito = false;
        this.mensajeToast = 'Error al actualizar la categoría';
        this.mostrarToast();
      }
    });
  }
  idCategoria: number = 0;

  // ==================== MÉTODOS DEPRECADOS (mantener compatibilidad) ====================

  ModificarCategoria(cat: any) {
    this.abrirModalEditar(cat, false);
  }

  GuardarModificacion() {
    this.guardarCategoria();
  }

  AgregarCategoria() {
    this.guardarCategoria();
  }

  // ==================== GESTIÓN DE ESTADO ====================
  // ==================== GESTIÓN DE ESTADO ====================

  catSeleccionado: any = null;
  estadoTemporal: number = 0;

  showModal(event: Event, cat: any) {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    input.checked = cat.estado == 1;

    this.catSeleccionado = cat;
    this.estadoTemporal = isChecked ? 1 : 2;

    this.abrirModalConfirmacion();
  }

  cancelarCambio() {
    this.catSeleccionado = null;
    this.cerrarModalConfirmacion();
  }

  guardarCambio() {
    if (this.catSeleccionado) {
      this.catSeleccionado.estado = this.estadoTemporal;
      this.catser.modificarCategoria(this.catSeleccionado).subscribe({
        next: (data) => {
          console.log('Estado modificado:', data.mensaje);
          this.Listar();
          this.exito = true;
          this.mensajeToast = data.mensaje || 'Estado actualizado exitosamente';
          this.mostrarToast();
          this.cerrarModalConfirmacion();
        },
        error: (error) => {
          console.log('Error al modificar el estado:', error);
          this.exito = false;
          this.mensajeToast = 'Error al cambiar el estado';
          this.mostrarToast();
          this.cerrarModalConfirmacion();
        }
      });
    }
    this.catSeleccionado = null;
  }

  // ==================== MÉTODOS HELPER ====================

  mostrarToast(): void {
    const toastEl = document.getElementById('toastCategoria');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  guardarEstadoModalPadre(): void {
    this.estadoModalPadreGuardado = {
      isEditMode: this.isEditMode,
      modalTitle: this.modalTitle,
      esSubcategoria: this.esSubcategoria,
      categoriaPadreId: this.categoriaPadreId,
      categoriaPadreNombre: this.categoriaPadreNombre,
      categoriaEnEdicion: this.categoriaEnEdicion,
      idCategoria: this.idCategoria,
      formValues: this.cateForm.value
    };
  }

  restaurarEstadoModalPadre(): void {
    if (this.estadoModalPadreGuardado) {
      this.isEditMode = this.estadoModalPadreGuardado.isEditMode;
      this.modalTitle = this.estadoModalPadreGuardado.modalTitle;
      this.esSubcategoria = this.estadoModalPadreGuardado.esSubcategoria;
      this.categoriaPadreId = this.estadoModalPadreGuardado.categoriaPadreId;
      this.categoriaPadreNombre = this.estadoModalPadreGuardado.categoriaPadreNombre;
      this.categoriaEnEdicion = this.estadoModalPadreGuardado.categoriaEnEdicion;
      this.idCategoria = this.estadoModalPadreGuardado.idCategoria;
      this.cateForm.patchValue(this.estadoModalPadreGuardado.formValues);
      this.estadoModalPadreGuardado = null;
    }
  }

  limpiarForm(): void {
    this.cateForm.reset();
    this.idCategoria = 0;
    this.isEditMode = false;
    this.esSubcategoria = false;
    this.categoriaPadreId = null;
    this.categoriaPadreNombre = '';
    this.categoriaEnEdicion = null;
    this.modalTitle = 'Nueva Categoría';
    this.estadoModalPadreGuardado = null;
  }
}
