import { Component, OnInit } from '@angular/core';
import { DetalleVenta } from '../../Modelos/detalle-venta';
import { Usuario } from '../../Modelos/usuario';
import { Venta } from '../../Modelos/venta';
import { DetalleventaService } from '../../Servicios/detalleventa.service';
import { UsuarioService } from '../../Servicios/usuario.service';
import { VentaService } from '../../Servicios/venta.service';
//import * as pdfMake from 'pdfmake/build/pdfmake';
//import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../../Modelos/producto';
import { ProductoService } from '../../Servicios/producto.service';
import { Categoria } from '../../Modelos/categoria';
import { CategoriaService } from '../../Servicios/categoria.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

//(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

@Component({
  selector: 'app-reportes',
  standalone:true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent implements OnInit {
  tipo: string = ''//para filtrar por tipo
  apiUsuarios: Usuario[] = []
  apiVentas: Venta[] = []
  apiDetalleVenta: DetalleVenta[] = []
  apiProducto: Producto[] = []
  apiCategoria:Categoria[]=[]

  compras: any[] = [];
  constructor(
    private VenSer: VentaService,
    private UsuSer: UsuarioService,
    private DetvSer: DetalleventaService,
    private http: HttpClient,
    private ProSer: ProductoService,
    private CatSer:CategoriaService
  ) { }
  //para los filtros

  ngOnInit(): void {

   this.compras = [
      {
        id_compra: 1,
        nro_compra: 'C-0001',
        monto_total: 1520.50,
        estado: 1,
        fecha_registro: '2025-10-10',
        proveedor: {
          id_proveedor: 3,
          nombre: 'Autorepuestos Tarija',
          ciudad: 'Tarija',
          direccion: 'Av. La Paz N°123',
          celular: 72956432,
          email: 'ventas@autorepuestos.com'
        },
        usuario: {
          id_usuario: 1,
          nombre: 'Juan Pérez'
        },
        detalles: [
          {
            id_detcompra: 1,
            producto: {
              id_producto: 10,
              nombre: 'Filtro de aceite Toyota',
              codigo: 'FA-001',
              precio_compra: 50,
              precio_venta: 75
            },
            cantidad: 10,
            precio_unitario: 50,
            sub_total: 500
          },
          {
            id_detcompra: 2,
            producto: {
              id_producto: 11,
              nombre: 'Bujía NGK',
              codigo: 'BJ-005',
              precio_compra: 25,
              precio_venta: 40
            },
            cantidad: 8,
            precio_unitario: 25,
            sub_total: 200
          }
        ]
      },
      {
        id_compra: 2,
        nro_compra: 'C-0002',
        monto_total: 800,
        estado: 1,
        fecha_registro: '2025-10-12',
        proveedor: {
          id_proveedor: 4,
          nombre: 'Repuestos La Torre',
          ciudad: 'Tarija',
          direccion: 'C. Cochabamba 456',
          celular: 76123456,
          email: 'contacto@latorre.com'
        },
        usuario: {
          id_usuario: 2,
          nombre: 'María López'
        },
        detalles: [
          {
            id_detcompra: 3,
            producto: {
              id_producto: 15,
              nombre: 'Pastillas de freno Bosch',
              codigo: 'PF-007',
              precio_compra: 100,
              precio_venta: 140
            },
            cantidad: 4,
            precio_unitario: 100,
            sub_total: 400
          },
          {
            id_detcompra: 4,
            producto: {
              id_producto: 16,
              nombre: 'Aceite Castrol 20W50',
              codigo: 'AC-010',
              precio_compra: 100,
              precio_venta: 130
            },
            cantidad: 4,
            precio_unitario: 100,
            sub_total: 400
          }
        ]
      }
    ];

  }

   async descargarPDF(): Promise<void> {
    console.log("haciendo pdf");

    const imageUrl = 'assets/logo.jpg'; // Ruta de la imagen en assets

    // Convertimos la imagen a Base64
    const logoBase64 = await this.getImageBase64(imageUrl);
    // Generar las filas dinámicamente desde el array `ventas`
    const filas = this.apiVentas.map((venta, index) => [


      index + 1,
      venta.id_venta.toString(),
      venta.fecha_registro.toString(),
      venta.tipo_venta==1?"Fisico":"Pedido",
      venta.usuario.persona.nombre + " " + venta.usuario.persona.ap_paterno + " " + venta.usuario.persona.ap_materno,
      venta.monto_total.toString()+" Bs."
    ]
  );

    // Definición del contenido del PDF
    const documentDefinition: any = {
      content: [
        {
          columns: [
            {
              image: logoBase64,
              width: 100, // Ajusta el tamaño del logo
              alignment: 'left', // Alineación del logo
            },
            {
              text: 'Repuestos y Accesorios Pinedo', // El título que irá al lado del logo
              style: 'header', // Estilo para el título
              alignment: 'left', // Alineación del texto
              margin: [20, 0, 0, 0], // Espaciado entre el logo y el título
            },
          ],
        },
        { text: 'Reporte de Ventas', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              ['Nro', 'Nro venta', 'Fecha', 'Tipo', 'Vendedor', 'Total'], // Encabezados
              ...filas
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 20],
        },
      },
    };

    // Generar y descargar el PDF
    //pdfMake.createPdf(documentDefinition).download('reporte-ventas.pdf');
  }

  // Función para convertir imagen a Base64
  private getImageBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get(url, { responseType: 'blob' }).subscribe(
        (response: Blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(response);
        },
        (error) => reject(error)
      );
    });
  }
  async descargarIPDF(): Promise<void> {
    console.log("haciendo pdf");

    const imageUrl = 'assets/logo.jpg'; // Ruta de la imagen en assets

    // Convertimos la imagen a Base64
    const logoBase64 = await this.getImageBase64(imageUrl);
    // Generar las filas dinámicamente desde el array `ventas`
    const filas = this.apiProducto.map((producto, index) => [
      index + 1,
      producto.id_producto.toString(),
      producto.categoria.nombre,
      producto.cantidad.toString(),
      producto.precio_compra,
      producto.precio_compra*producto.cantidad
    ]);
    // Definición del contenido del PDF
    const documentDefinition: any = {
      content: [
        {
          columns: [
            {
              image: logoBase64,
              width: 100, // Ajusta el tamaño del logo
              alignment: 'left', // Alineación del logo
            },
            {
              text: 'Repuestos y Accesorios Pinedo', // El título que irá al lado del logo
              style: 'header', // Estilo para el título
              alignment: 'left', // Alineación del texto
              margin: [20, 0, 0, 0], // Espaciado entre el logo y el título
            },
          ],
        },
        { text: 'Reporte de Inventario', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              ['Nro', 'Cod producto', 'Categoria', 'Cantidad en Stock', 'Precio Unitario', 'Valor Total'], // Encabezados
              ...filas
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 20],
        },
      },
    };

    // Generar y descargar el PDF
    //pdfMake.createPdf(documentDefinition).download('reporte-inventario.pdf');
  }


 ventasPDF(){
  console.log('llamando pdf en ts');

 this.VenSer.getPDF().subscribe((pdfBlob) => {
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });

      // Abre en una nueva pestaña
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
}
inventarioPDF(){
  console.log('llamando pdf en ts');

 this.ProSer.getPDF().subscribe((pdfBlob) => {
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });

      // Abre en una nueva pestaña
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
}


}
