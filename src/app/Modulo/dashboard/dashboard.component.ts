import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../Servicios/producto.service';
import { CompraService } from '../../Servicios/compra.service';
import { VentaService } from '../../Servicios/venta.service';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { PedidoService } from '../../Servicios/pedido.service';
import { NombrePipe } from '../../Filtros/nombre.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, FormsModule, NombrePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  apiProductos: any[] = [];
  apiCompras: any[] = [];
  apiVentas: any[] = [];
  apiPedidos: any[] = [];
  productoSeleccionado: any = null;
  buscarProducto: string = '';

  // Opciones de los gráficos
  chartOption1!: EChartsOption;  // Gráfico de Rentabilidad por Mes (Line + Bar)
  chartOption2!: EChartsOption;  // Gráfico de Anillos de Productos
  chartOption3!: EChartsOption;  // Gráfico de Flujo de Caja (Line Area con gradiente)
  chartOption4!: EChartsOption;  // Gráfico de Pedidos por Aplicación
  chartOptionProducto!: EChartsOption;  // Gráfico dinámico del producto seleccionado (métricas)
  chartOptionProductoHistorial!: EChartsOption;  // Gráfico de historial temporal del producto

  constructor(
    private productoService: ProductoService,
    private compraService: CompraService,
    private ventaService: VentaService,
    private pedidoService: PedidoService
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCompras();
    this.cargarVentas();
    this.cargarPedidos();
  }
cargarPedidos(): void {
  // this.pedidoService.getListaPedidos().subscribe({
  //   next: (data) => {
  //     this.apiPedidos = data;
  //     console.log('Pedidos cargados:', this.apiPedidos);
  //     this.generarGraficos();
  //   },
  //   error: (error) => {
  //     console.error('Error al cargar pedidos:', error);
  //   }
  // });
}
  cargarProductos(): void {
    this.productoService.getListaProductos().subscribe({
      next: (data) => {
        this.apiProductos = data;
        console.log('Productos cargados:', this.apiProductos);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  cargarCompras(): void {
    this.compraService.getListaCompra().subscribe({
      next: (data) => {
        this.apiCompras = data;
        console.log('Compras cargadas:', this.apiCompras);
        this.generarGraficos();
      },
      error: (error) => {
        console.error('Error al cargar compras:', error);
      }
    });
  }

  cargarVentas(): void {
    this.ventaService.getListaVentas().subscribe({
      next: (data) => {
        this.apiVentas = data;
        console.log('Ventas cargadas:', this.apiVentas);
        this.generarGraficos();
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
      }
    });
  }

  generarGraficos(): void {
    if (this.apiCompras.length > 0 && this.apiVentas.length > 0) {
      this.generarGraficoRentabilidad();
      this.generarGraficoProductos();
      this.generarGraficoFlujoCaja();
    }
    // if (this.apiPedidos.length > 0) {
    //   this.generarGraficoPedidos();
    // }
  }

  // Gráfico 1: Últimos 6 meses (5 anteriores + mes actual)
  generarGraficoRentabilidad(): void {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth(); // 0-11
    const yearActual = fechaActual.getFullYear();

    // Calcular los 6 últimos meses
    const meses3 = [];
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    for (let i = 5; i >= 0; i--) {
      let mes = mesActual - i;
      let year = yearActual;

      if (mes < 0) {
        mes += 12;
        year -= 1;
      }

      const nombreMes = `${nombresMeses[mes]} ${year}`;
      meses3.push({ nombre: nombreMes, mes: mes, year: year });
    }

    // Inicializar datos
    const mesesData: any = {};
    meses3.forEach(m => {
      mesesData[m.nombre] = { ventas: 0, compras: 0, ganancia: 0 };
    });

    // Procesar ventas
    this.apiVentas.forEach(venta => {
      const fecha = new Date(venta.fecha_registro);
      const year = fecha.getFullYear();
      const month = fecha.getMonth();

      meses3.forEach(m => {
        if (year === m.year && month === m.mes) {
          mesesData[m.nombre].ventas += venta.monto_total || 0;
        }
      });
    });

    // Procesar compras
    this.apiCompras.forEach(compra => {
      const fecha = new Date(compra.fecha_registro);
      const year = fecha.getFullYear();
      const month = fecha.getMonth();

      meses3.forEach(m => {
        if (year === m.year && month === m.mes) {
          mesesData[m.nombre].compras += compra.monto_total || 0;
        }
      });
    });

    // Calcular ganancia
    Object.keys(mesesData).forEach(mes => {
      mesesData[mes].ganancia = mesesData[mes].ventas - mesesData[mes].compras;
    });

    const meses = Object.keys(mesesData);
    const ventas = meses.map(mes => mesesData[mes].ventas);
    const compras = meses.map(mes => mesesData[mes].compras);
    const ganancias = meses.map(mes => mesesData[mes].ganancia);

    console.log('Datos de rentabilidad:', { meses, ventas, compras, ganancias });

    this.chartOption1 = {
      title: {
        text: 'Rentabilidad: Últimos 6 Meses',
        subtext: 'Comparación Mensual de Ingresos, Egresos y restantes',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#333'
        },
        subtextStyle: {
          fontSize: 12,
          color: '#666'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((param: any) => {
            result += `${param.marker} ${param.seriesName}: Bs. ${param.value.toFixed(2)}<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['Ventas', 'Compras', 'Restante'],
        top: 60,
        textStyle: {
          fontSize: 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: meses,
        axisPointer: {
          type: 'shadow'
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Monto (Bs.)',
          position: 'left',
          axisLabel: {
            formatter: 'Bs. {value}'
          }
        }
      ],
      series: [
        {
          name: 'Ventas',
          type: 'bar',
          data: ventas,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          }
        },
        {
          name: 'Compras',
          type: 'bar',
          data: compras,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#f4a3a8' },
              { offset: 1, color: '#e45165' }
            ])
          }
        },
        {
          name: 'Restante',
          type: 'line',
          data: ganancias,
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#5470c6'
          },
          itemStyle: {
            color: '#5470c6'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
              { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
            ])
          }
        }
      ]
    };
  }

  // Gráfico 2: Gráfico de Barras Horizontal por Categorías
  generarGraficoProductos(): void {
    const categorias: any = {};

    // Agrupar productos por categoría y calcular métricas
    this.apiProductos.forEach(producto => {
      const catNombre = producto.categorium?.nombre || 'Sin Categoría';

      if (!categorias[catNombre]) {
        categorias[catNombre] = {
          nombre: catNombre,
          totalVentas: 0,
          totalCompras: 0,
          ganancia: 0,
          cantidadProductos: 0
        };
      }

      // Calcular ventas del producto
      let ventasProducto = 0;
      let comprasProducto = 0;

      this.apiVentas.forEach(venta => {
        venta.det_venta?.forEach((detalle: any) => {
          if (detalle.producto?.id_producto === producto.id_producto) {
            ventasProducto += detalle.sub_total || 0;
          }
        });
      });

      this.apiCompras.forEach(compra => {
        compra.det_compras?.forEach((detalle: any) => {
          if (detalle.producto?.id_producto === producto.id_producto) {
            comprasProducto += detalle.sub_total || 0;
          }
        });
      });

      const ganancia = ventasProducto - comprasProducto;

      if (ventasProducto > 0 || comprasProducto > 0) {
        categorias[catNombre].totalVentas += ventasProducto;
        categorias[catNombre].totalCompras += comprasProducto;
        categorias[catNombre].ganancia += ganancia;
        categorias[catNombre].cantidadProductos += 1;
      }
    });

    // Preparar datos para gráfico de barras
    const categoriasNombres: string[] = [];
    const ventasData: number[] = [];
    const comprasData: number[] = [];
    const gananciasData: number[] = [];

    Object.values(categorias)
      .filter((cat: any) => cat.totalVentas > 0 || cat.totalCompras > 0)
      .sort((a: any, b: any) => (b.totalVentas + b.totalCompras) - (a.totalVentas + a.totalCompras))
      .forEach((cat: any) => {
        categoriasNombres.push(cat.nombre);
        ventasData.push(cat.totalVentas);
        comprasData.push(cat.totalCompras);
        gananciasData.push(cat.ganancia);
      });

    this.chartOption2 = {
      title: {
        text: 'Análisis por Categorías',
        subtext: 'Ventas, Compras y Ganancias por Categoría',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#333'
        },
        subtextStyle: {
          fontSize: 12,
          color: '#666'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((param: any) => {
            result += `${param.marker} ${param.seriesName}: Bs. ${param.value.toFixed(2)}<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['Ventas', 'Compras', 'Ganancia'],
        top: 60,
        textStyle: {
          fontSize: 12
        }
      },
      grid: {
        left: '15%',
        right: '5%',
        top: '20%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: 'Monto (Bs.)',
        axisLabel: {
          formatter: 'Bs. {value}'
        }
      },
      yAxis: {
        type: 'category',
        data: categoriasNombres,
        axisLabel: {
          fontSize: 12,
          fontWeight: 'bold'
        }
      },
      series: [
        {
          name: 'Ventas',
          type: 'bar',
          data: ventasData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#52c41a' },
              { offset: 1, color: '#95de64' }
            ]),
            borderRadius: [0, 8, 8, 0]
          },
          label: {
            show: true,
            position: 'right',
            formatter: 'Bs. {c}',
            fontSize: 11,
            fontWeight: 'bold',
            color: '#52c41a'
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#389e0d' },
                { offset: 1, color: '#52c41a' }
              ])
            }
          }
        },
        {
          name: 'Compras',
          type: 'bar',
          data: comprasData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#ff4d4f' },
              { offset: 1, color: '#ff7875' }
            ]),
            borderRadius: [0, 8, 8, 0]
          },
          label: {
            show: true,
            position: 'right',
            formatter: 'Bs. {c}',
            fontSize: 11,
            fontWeight: 'bold',
            color: '#ff4d4f'
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#cf1322' },
                { offset: 1, color: '#ff4d4f' }
              ])
            }
          }
        },
        {
          name: 'Ganancia',
          type: 'bar',
          data: gananciasData.map((value: number) => ({
            value: value,
            itemStyle: {
              color: value > 0
                ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#1890ff' },
                    { offset: 1, color: '#69c0ff' }
                  ])
                : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#fa8c16' },
                    { offset: 1, color: '#ffc53d' }
                  ])
            }
          })),
          itemStyle: {
            borderRadius: [0, 8, 8, 0]
          },
          label: {
            show: true,
            position: 'right',
            formatter: 'Bs. {c}',
            fontSize: 11,
            fontWeight: 'bold',
            color: '#1890ff'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          }
        }
      ]
    };
  }

  getColorByCategory(categoryName: string): string {
    const colors: any = {
      'Frenos': '#e74c3c',
      'Aceites': '#f39c12',
      'Filtros': '#3498db',
      'Llantas': '#2c3e50',
      'Baterías': '#9b59b6',
      'Luces': '#f1c40f',
      'Suspensión': '#16a085',
      'Motor': '#c0392b',
      'Transmisión': '#8e44ad',
      'Eléctrico': '#2980b9',
      'Carrocería': '#27ae60'
    };
    return colors[categoryName] || this.getRandomColor();
  }

  getLighterColor(color: string): string {
    // Convierte un color hex a una versión más clara
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Hacer el color más claro (agregando más blanco)
    const lighter = (c: number) => Math.min(255, c + 60);

    return `#${lighter(r).toString(16).padStart(2, '0')}${lighter(g).toString(16).padStart(2, '0')}${lighter(b).toString(16).padStart(2, '0')}`;
  }

  // Gráfico 3: Flujo de Caja Acumulado (Area con Gradiente)
  generarGraficoFlujoCaja(): void {
    const fechasData: any = {};

    // Combinar ventas y compras por fecha
    this.apiVentas.forEach(venta => {
      const fecha = venta.fecha_registro;
      if (!fechasData[fecha]) {
        fechasData[fecha] = { ingresos: 0, egresos: 0, flujo: 0 };
      }
      fechasData[fecha].ingresos += venta.monto_total || 0;
    });

    this.apiCompras.forEach(compra => {
      const fecha = compra.fecha_registro;
      if (!fechasData[fecha]) {
        fechasData[fecha] = { ingresos: 0, egresos: 0, flujo: 0 };
      }
      fechasData[fecha].egresos += compra.monto_total || 0;
    });

    // Ordenar por fecha y calcular flujo acumulado
    const fechasOrdenadas = Object.keys(fechasData).sort();
    let flujoAcumulado = 0;

    const fechas = fechasOrdenadas;
    const ingresos = fechasOrdenadas.map(fecha => fechasData[fecha].ingresos);
    const egresos = fechasOrdenadas.map(fecha => fechasData[fecha].egresos);
    const flujoAcumuladoData = fechasOrdenadas.map(fecha => {
      flujoAcumulado += (fechasData[fecha].ingresos - fechasData[fecha].egresos);
      return flujoAcumulado;
    });

    this.chartOption3 = {
      title: {
        text: 'Flujo de Caja Acumulado',
        subtext: 'Seguimiento Financiero en el Tiempo',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 20,
          fontWeight: 'bold'
        },
        subtextStyle: {
          fontSize: 12,
          color: '#666'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((param: any) => {
            result += `${param.marker} ${param.seriesName}: Bs. ${param.value.toFixed(2)}<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['Ingresos', 'Egresos', 'Flujo Acumulado'],
        top: 60
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: fechas,
        axisLabel: {
          rotate: 45,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: 'Bs. {value}'
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          start: 0,
          end: 100
        }
      ],
      series: [
        {
          name: 'Ingresos',
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#91cc75'
          },
          itemStyle: {
            color: '#91cc75'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(145, 204, 117, 0.5)' },
              { offset: 1, color: 'rgba(145, 204, 117, 0.1)' }
            ])
          },
          data: ingresos
        },
        {
          name: 'Egresos',
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#ee6666'
          },
          itemStyle: {
            color: '#ee6666'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(238, 102, 102, 0.5)' },
              { offset: 1, color: 'rgba(238, 102, 102, 0.1)' }
            ])
          },
          data: egresos
        },
        {
          name: 'Flujo Acumulado',
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 4,
            color: '#5470c6'
          },
          itemStyle: {
            color: '#5470c6'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(84, 112, 198, 0.8)' },
              { offset: 1, color: 'rgba(84, 112, 198, 0.2)' }
            ])
          },
          data: flujoAcumuladoData,
          markLine: {
            data: [{ type: 'average', name: 'Promedio' }]
          }
        }
      ]
    };
  }

  // Gráfico 4: Pedidos por Aplicación (Método de Pago)
  generarGraficoPedidos(): void {
    const metodosPago: any = {};
    const pedidosPorFecha: any = {};

    // Analizar pedidos por método de pago
    this.apiPedidos.forEach(pedido => {
      const metodo = pedido.metodo_pago === 1 ? 'Efectivo' :
                     pedido.metodo_pago === 2 ? 'Tarjeta' :
                     pedido.metodo_pago === 3 ? 'Transferencia' : 'Otro';

      if (!metodosPago[metodo]) {
        metodosPago[metodo] = { cantidad: 0, monto: 0 };
      }

      metodosPago[metodo].cantidad += 1;
      metodosPago[metodo].monto += pedido.monto_total || 0;

      // Agrupar por fecha
      const fecha = pedido.fecha_registro;
      if (!pedidosPorFecha[fecha]) {
        pedidosPorFecha[fecha] = { cantidad: 0, monto: 0 };
      }
      pedidosPorFecha[fecha].cantidad += 1;
      pedidosPorFecha[fecha].monto += pedido.monto_total || 0;
    });

    // Preparar datos para el gráfico de dona
    const metodoData = Object.keys(metodosPago).map(metodo => ({
      name: metodo,
      value: metodosPago[metodo].monto
    }));

    // Preparar datos para línea temporal
    const fechasOrdenadas = Object.keys(pedidosPorFecha).sort();
    const cantidadesPorFecha = fechasOrdenadas.map(f => pedidosPorFecha[f].cantidad);
    const montosPorFecha = fechasOrdenadas.map(f => pedidosPorFecha[f].monto);

    this.chartOption4 = {
      title: {
        text: 'Pedidos por Aplicación',
        subtext: 'Análisis de Métodos de Pago y Tendencias',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#333'
        },
        subtextStyle: {
          fontSize: 12,
          color: '#666'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.componentSubType === 'pie') {
            return `<strong>${params.name}</strong><br/>Monto: Bs. ${params.value}<br/>Porcentaje: ${params.percent}%`;
          }
          return `<strong>${params.seriesName}</strong><br/>${params.name}: ${params.value}`;
        }
      },
      legend: {
        top: 60,
        left: 'center',
        data: ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro', 'Cantidad de Pedidos', 'Monto Total']
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        top: '55%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: fechasOrdenadas,
        axisLabel: {
          rotate: 45,
          fontSize: 10
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Cantidad',
          position: 'left'
        },
        {
          type: 'value',
          name: 'Monto (Bs.)',
          position: 'right',
          axisLabel: {
            formatter: 'Bs. {value}'
          }
        }
      ],
      series: [
        // Gráfico de dona para métodos de pago
        {
          name: 'Método de Pago',
          type: 'pie',
          radius: ['30%', '45%'],
          center: ['50%', '30%'],
          data: metodoData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}: {d}%',
            fontSize: 12,
            fontWeight: 'bold'
          },
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          }
        },
        // Línea de cantidad de pedidos
        {
          name: 'Cantidad de Pedidos',
          type: 'bar',
          yAxisIndex: 0,
          data: cantidadesPorFecha,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#36cfc9' },
              { offset: 1, color: '#13c2c2' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10
          }
        },
        // Línea de monto total
        {
          name: 'Monto Total',
          type: 'line',
          yAxisIndex: 1,
          data: montosPorFecha,
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#ff7a45'
          },
          itemStyle: {
            color: '#ff7a45'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 122, 69, 0.5)' },
              { offset: 1, color: 'rgba(255, 122, 69, 0.1)' }
            ])
          }
        }
      ]
    };
  }

  getRandomColor(): string {
    const colors = [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
      '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#5470c6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  seleccionarProducto(producto: any): void {
    this.productoSeleccionado = producto;
    this.generarGraficoProductoSeleccionado(producto);
    this.generarGraficoHistorialProducto(producto);
  }

  // Gráfico dinámico del producto seleccionado
  generarGraficoProductoSeleccionado(producto: any): void {
    // Recopilar datos del producto en ventas y compras
    const ventasProducto: any[] = [];
    const comprasProducto: any[] = [];

    // Analizar ventas del producto
    this.apiVentas.forEach(venta => {
      venta.det_venta?.forEach((detalle: any) => {
        if (detalle.producto?.id_producto === producto.id_producto) {
          ventasProducto.push({
            fecha: venta.fecha_registro,
            cantidad: detalle.cantidad,
            monto: detalle.sub_total,
            precio: detalle.precio_unitario
          });
        }
      });
    });

    // Analizar compras del producto
    this.apiCompras.forEach(compra => {
      compra.det_compras?.forEach((detalle: any) => {
        if (detalle.producto?.id_producto === producto.id_producto) {
          comprasProducto.push({
            fecha: compra.fecha_registro,
            cantidad: detalle.cantidad,
            monto: detalle.sub_total,
            precio: detalle.precio_unitario
          });
        }
      });
    });

    // Analizar pedidos del producto
    const pedidosProducto: any[] = [];
    // this.apiPedidos.forEach(pedido => {
    //   pedido.detpedidos?.forEach((detalle: any) => {
    //     if (detalle.producto?.id_producto === producto.id_producto) {
    //       pedidosProducto.push({
    //         fecha: pedido.fecha_registro,
    //         cantidad: detalle.cantidad,
    //         monto: detalle.sub_total,
    //         precio: detalle.precio_unitario
    //       });
    //     }
    //   });
    // });

    const totalVendido = ventasProducto.reduce((sum, v) => sum + v.cantidad, 0);
    const totalPedidos = pedidosProducto.reduce((sum, p) => sum + p.cantidad, 0);
    const totalComprado = comprasProducto.reduce((sum, c) => sum + c.cantidad, 0);
    const ingresoTotal = ventasProducto.reduce((sum, v) => sum + v.monto, 0);
    const costoTotal = comprasProducto.reduce((sum, c) => sum + c.monto, 0);
    const gananciaTotal = ingresoTotal - costoTotal;
    const margenPorcentaje = costoTotal > 0 ? ((gananciaTotal / costoTotal) * 100) : 0;

    // Gráfico tipo Gauge + Barras (sin Radar)
    this.chartOptionProducto = {
      title: {
        text: `Análisis de "${producto.nombre}"`,
        subtext: `Código: ${producto.codigo}`,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333'
        },
        subtextStyle: {
          fontSize: 11,
          color: '#666'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `<strong>${params.name}</strong><br/>${params.seriesName}: ${params.value}`;
        }
      },
      legend: {
        top: 60,
        left: 'center',
        data: ['Movimiento', 'Rentabilidad', 'Stock']
      },
      grid: [
        { left: '5%', top: '50%', width: '40%', height: '42%' },
        { right: '5%', top: '50%', width: '45%', height: '42%' }
      ],
      xAxis: [
        { gridIndex: 0, type: 'category', data: ['Comprado', 'Vendido', 'En Stock'] },
        { gridIndex: 1, type: 'value' }
      ],
      yAxis: [
        { gridIndex: 0, type: 'value', name: 'Cantidad' },
        { gridIndex: 1, type: 'category', data: ['Costo', 'Ingreso', 'Ganancia'] }
      ],
      series: [
        // Gauge para Margen de Rentabilidad
        {
          name: 'Margen',
          type: 'gauge',
          center: ['25%', '35%'],
          radius: '45%',
          min: 0,
          max: 100,
          splitNumber: 10,
          axisLine: {
            lineStyle: {
              width: 10,
              color: [
                [0.2, '#FF6E76'],
                [0.5, '#FDDD60'],
                [0.8, '#58D9F9'],
                [1, '#7CFFB2']
              ]
            }
          },
          pointer: {
            itemStyle: {
              color: 'auto'
            }
          },
          axisTick: {
            distance: -10,
            length: 5,
            lineStyle: {
              color: '#fff',
              width: 1
            }
          },
          splitLine: {
            distance: -15,
            length: 15,
            lineStyle: {
              color: '#fff',
              width: 2
            }
          },
          axisLabel: {
            color: 'auto',
            distance: 20,
            fontSize: 10
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: 'auto',
            fontSize: 20,
            fontWeight: 'bold',
            offsetCenter: [0, '70%']
          },
          title: {
            offsetCenter: [0, '90%'],
            fontSize: 12
          },
          data: [
            {
              value: parseFloat(margenPorcentaje.toFixed(2)),
              name: 'Margen Rentabilidad'
            }
          ]
        } as any,
        // Gráfico de barras: Cantidades
        {
          name: 'Cantidad',
          type: 'bar',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: [
            {
              value: totalComprado,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#fa8c16' },
                  { offset: 1, color: '#ffd666' }
                ])
              }
            },
            {
              value: totalVendido,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#52c41a' },
                  { offset: 1, color: '#95de64' }
                ])
              }
            },
            {
              value: producto.stock,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#1890ff' },
                  { offset: 1, color: '#69c0ff' }
                ])
              }
            }
          ],
          label: {
            show: true,
            position: 'top',
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        // Gráfico de barras horizontal: Montos
        {
          name: 'Monto (Bs.)',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: [
            {
              value: costoTotal.toFixed(2),
              itemStyle: { color: '#ff4d4f' }
            },
            {
              value: ingresoTotal.toFixed(2),
              itemStyle: { color: '#52c41a' }
            },
            {
              value: gananciaTotal.toFixed(2),
              itemStyle: {
                color: gananciaTotal > 0 ? '#1890ff' : '#ff7875'
              }
            }
          ],
          label: {
            show: true,
            position: 'right',
            formatter: 'Bs. {c}',
            fontSize: 11,
            fontWeight: 'bold'
          }
        }
      ]
    };
  }

  // Gráfico de historial temporal del producto (ventas y compras a lo largo del tiempo)
  generarGraficoHistorialProducto(producto: any): void {
    const historialData: any = {};

    // Analizar ventas del producto por fecha
    this.apiVentas.forEach(venta => {
      venta.det_venta?.forEach((detalle: any) => {
        if (detalle.producto?.id_producto === producto.id_producto) {
          const fecha = venta.fecha_registro;
          if (!historialData[fecha]) {
            historialData[fecha] = { ventas: 0, compras: 0, pedidos: 0, cantidadVendida: 0, cantidadComprada: 0, cantidadPedidos: 0 };
          }
          historialData[fecha].ventas += detalle.sub_total || 0;
          historialData[fecha].cantidadVendida += detalle.cantidad || 0;
        }
      });
    });

    // Analizar compras del producto por fecha
    this.apiCompras.forEach(compra => {
      compra.det_compras?.forEach((detalle: any) => {
        if (detalle.producto?.id_producto === producto.id_producto) {
          const fecha = compra.fecha_registro;
          if (!historialData[fecha]) {
            historialData[fecha] = { ventas: 0, compras: 0, pedidos: 0, cantidadVendida: 0, cantidadComprada: 0, cantidadPedidos: 0 };
          }
          historialData[fecha].compras += detalle.sub_total || 0;
          historialData[fecha].cantidadComprada += detalle.cantidad || 0;
        }
      });
    });

    // Analizar pedidos del producto por fecha
    // this.apiPedidos.forEach(pedido => {
    //   pedido.detpedidos?.forEach((detalle: any) => {
    //     if (detalle.producto?.id_producto === producto.id_producto) {
    //       const fecha = pedido.fecha_registro;
    //       if (!historialData[fecha]) {
    //         historialData[fecha] = { ventas: 0, compras: 0, pedidos: 0, cantidadVendida: 0, cantidadComprada: 0, cantidadPedidos: 0 };
    //       }
    //       historialData[fecha].pedidos += detalle.sub_total || 0;
    //       historialData[fecha].cantidadPedidos += detalle.cantidad || 0;
    //     }
    //   });
    // });

    const fechasOrdenadas = Object.keys(historialData).sort();
    const ventas = fechasOrdenadas.map(fecha => historialData[fecha].ventas);
    const compras = fechasOrdenadas.map(fecha => historialData[fecha].compras);
    const pedidos = fechasOrdenadas.map(fecha => historialData[fecha].pedidos);
    const cantidadesVendidas = fechasOrdenadas.map(fecha => historialData[fecha].cantidadVendida);
    const cantidadesCompradas = fechasOrdenadas.map(fecha => historialData[fecha].cantidadComprada);
    const cantidadesPedidos = fechasOrdenadas.map(fecha => historialData[fecha].cantidadPedidos);

    this.chartOptionProductoHistorial = {
      title: {
        text: 'Historial de Movimientos',
        subtext: `Evolución temporal de ventas, compras y pedidos por app`,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333'
        },
        subtextStyle: {
          fontSize: 11,
          color: '#666'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: (params: any) => {
          let result = `<strong>Fecha: ${params[0].axisValue}</strong><br/>`;
          params.forEach((param: any) => {
            result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['Ventas (Bs.)', 'Compras (Bs.)', 'Pedidos App (Bs.)', 'Cantidad Vendida', 'Cantidad Comprada', 'Cantidad Pedidos App'],
        top: 60,
        textStyle: {
          fontSize: 11
        }
      },
      grid: [
        { left: '8%', top: '25%', width: '85%', height: '30%' },
        { left: '8%', top: '60%', width: '85%', height: '30%' }
      ],
      xAxis: [
        {
          gridIndex: 0,
          type: 'category',
          data: fechasOrdenadas,
          axisLabel: {
            rotate: 45,
            fontSize: 10
          }
        },
        {
          gridIndex: 1,
          type: 'category',
          data: fechasOrdenadas,
          axisLabel: {
            rotate: 45,
            fontSize: 10
          }
        }
      ],
      yAxis: [
        {
          gridIndex: 0,
          type: 'value',
          name: 'Monto (Bs.)',
          axisLabel: {
            formatter: 'Bs. {value}'
          }
        },
        {
          gridIndex: 1,
          type: 'value',
          name: 'Cantidad'
        }
      ],
      series: [
        // Gráfico superior: Montos
        {
          name: 'Ventas (Bs.)',
          type: 'line',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: ventas,
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#52c41a'
          },
          itemStyle: {
            color: '#52c41a'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(82, 196, 26, 0.5)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
            ])
          },
          markPoint: {
            data: [
              { type: 'max', name: 'Máximo' },
              { type: 'min', name: 'Mínimo' }
            ]
          }
        },
        {
          name: 'Compras (Bs.)',
          type: 'line',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: compras,
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#ff4d4f'
          },
          itemStyle: {
            color: '#ff4d4f'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 77, 79, 0.5)' },
              { offset: 1, color: 'rgba(255, 77, 79, 0.1)' }
            ])
          },
          markPoint: {
            data: [
              { type: 'max', name: 'Máximo' },
              { type: 'min', name: 'Mínimo' }
            ]
          }
        },
        {
          name: 'Pedidos App (Bs.)',
          type: 'line',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: pedidos,
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#1890ff',
            type: 'dashed'
          },
          itemStyle: {
            color: '#1890ff'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.4)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
            ])
          },
          markPoint: {
            data: [
              { type: 'max', name: 'Máximo' },
              { type: 'min', name: 'Mínimo' }
            ]
          }
        },
        // Gráfico inferior: Cantidades
        {
          name: 'Cantidad Vendida',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: cantidadesVendidas,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#73d13d' },
              { offset: 1, color: '#389e0d' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10
          }
        },
        {
          name: 'Cantidad Comprada',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: cantidadesCompradas,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ff7a45' },
              { offset: 1, color: '#d4380d' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10
          }
        },
        {
          name: 'Cantidad Pedidos App',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: cantidadesPedidos,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#597ef7' },
              { offset: 1, color: '#2f54eb' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10
          }
        }
      ]
    };
  }
}
