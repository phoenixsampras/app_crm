import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { OrdersService } from '../orders/orders.service';
import { AlertController } from 'ionic-angular';
import { ChartsService } from './charts.service';
import { LoginPage } from '../login/login';
import moment from 'moment';

import * as HighCharts from 'highcharts';
import highchartsMore from 'highcharts/highcharts-more';
import solidGauge from 'highcharts/modules/solid-gauge';

highchartsMore(HighCharts);
solidGauge(HighCharts);

@Component({
  selector: 'charts-page',
  templateUrl: 'charts.html'
})
export class ChartsPage {

  type: any = 'line';
  data = { labels: [], datasets: [] };
  loading: any;
  options = {
    responsive: true,
    maintainAspectRatio: true,
    displayFormats: {
      'millisecond': 'MMM DD',
      'second': 'MMM DD',
      'minute': 'MMM DD',
      'hour': 'MMM DD',
      'day': 'MMM DD',
      'week': 'MMM DD',
      'month': 'MMM DD',
      'quarter': 'MMM DD',
      'year': 'MMM DD',
    }
  };
  constructor(
    public nav: NavController,
    public ordersService: OrdersService,
    public loadingCtrl: LoadingController,
    public chartsService: ChartsService,
    public alertCtrl: AlertController
  ) {

  }

  ionViewWillLoad() {
    if (!this.ordersService.loginId) {
      this.nav.setRoot(LoginPage);
    }
  }

  getVentasDiarias() {
    if (window.navigator.onLine) {
      this.chartsService
        .getDataFromServer(this.ordersService.loginId)
        .then(data => {
          let items = data.rmGraficoVentasDiarioPlan;

          let fechas = [];
          let monto = [];
          let plan = [];
          for (var i = 0; i < items.length; i++) {

            fechas.push(moment(items[i].date_order).format('D/M/YY'));
            monto.push(parseInt(items[i].quantity));
            plan.push(parseInt(items[i].plan));
          }
          // console.log(JSON.stringify(fechas));
          // console.log(JSON.stringify(monto));
          // console.log(JSON.stringify(plan));
          // Configurar Grafico Highchart
          var myChart = HighCharts.chart('container', {

            title: {
              text: 'Cumplimiento Diario'
            },
            xAxis: {
              categories: fechas
            },
            yAxis: {
              title: {
                text: 'Ejecutado'
              }
            },
            series: [{
              type: 'column',
              name: 'Monto Bs.',
              data: monto
            }, {
              type: 'spline',
              name: 'Plan Bs.',
              data: plan
            }]
          });

        });
    }
  }

  getVentasMes() {
    if (window.navigator.onLine) {
      this.chartsService
        .getDataFromServerVentasMes(this.ordersService.loginId)
        .then(data => {
          let items = data.rmGraficoVentasMesPlan;

          let sales_total = [];
          let rm_proyeccion_ventas_mensual = [];
          for (var i = 0; i < items.length; i++) {

            rm_proyeccion_ventas_mensual.push(parseInt(items[i].rm_proyeccion_ventas_mensual));
            sales_total.push(parseInt(items[i].sales_total));
          }
          console.log(JSON.stringify(sales_total));
          console.log(JSON.stringify(rm_proyeccion_ventas_mensual[0]));
          // console.log(JSON.stringify(plan));

          var gaugeOptions = {

              chart: {
                  type: 'solidgauge'
              },

              title: null,

              pane: {
                  center: ['50%', '85%'],
                  size: '100%',
                  startAngle: -90,
                  endAngle: 90,
                  background: {
                      // backgroundColor: (HighCharts.theme && HighCharts.theme.background2) || '#EEE',
                      innerRadius: '60%',
                      outerRadius: '100%',
                      shape: 'arc'
                  }
              },

              tooltip: {
                  enabled: false
              },

              // the value axis
              yAxis: {
                  stops: [
                      [0.1, '#55BF3B'], // green
                      [0.5, '#DDDF0D'], // yellow
                      [0.9, '#DF5353'] // red
                  ],
                  lineWidth: 0,
                  minorTickInterval: null,
                  tickAmount: 2,
                  title: {
                      y: -70
                  },
                  labels: {
                      y: 16
                  }
              },

              plotOptions: {
                  solidgauge: {
                      dataLabels: {
                          y: 5,
                          borderWidth: 0,
                          useHTML: true
                      }
                  }
              }
          };

          var chartSpeed = HighCharts.chart('container-speed', HighCharts.merge(gaugeOptions, {
              yAxis: {
                  min: 0,
                  max: rm_proyeccion_ventas_mensual[0],
                  title: {
                      text: 'Ventas <br/>Acumuladas'
                  }
              },

              credits: {
                  enabled: false
              },

              series: [{
                  name: 'Ventas Mes',
                  data: sales_total,
                  dataLabels: {
                      format: '<div style="text-align:center"><span style="font-size:25px;color:black;">{y}</span><br/>' +
                             '<span style="font-size:12px;color:silver">Bs.</span></div>'
                  },
                  tooltip: {
                      valueSuffix: ' Bs.'
                  }
              }]

          }));

        });
    }
  }


  getVentasEjecutadas() {
    if (window.navigator.onLine) {
      this.chartsService
        .getDataFromServerVentasEjecutadas(this.ordersService.loginId)
        .then(data => {
          let items = data.rmGraficoVentasEjecutadas;
          // console.log(JSON.stringify(items[0].pedidos));
          let clientes = parseInt(items[1].clientes);
          let pedidos = [parseInt(items[0].pedidos)];
          // for (var i = 0; i < items.length; i++) {
          //
          //   pedidos.push(parseInt(items[i].pedidos));
          //   clientes.push(parseInt(items[i].clientes));
          // }
          console.log(JSON.stringify(pedidos));
          console.log(JSON.stringify(clientes));
          // console.log(JSON.stringify(plan));

          var gaugeOptions = {

              chart: {
                  type: 'solidgauge'
              },

              title: null,

              pane: {
                  center: ['50%', '85%'],
                  size: '100%',
                  startAngle: -90,
                  endAngle: 90,
                  background: {
                      // backgroundColor: (HighCharts.theme && HighCharts.theme.background2) || '#EEE',
                      innerRadius: '60%',
                      outerRadius: '100%',
                      shape: 'arc'
                  }
              },

              tooltip: {
                  enabled: false
              },

              // the value axis
              yAxis: {
                  stops: [
                      [0.1, '#55BF3B'], // green
                      [0.5, '#DDDF0D'], // yellow
                      [0.9, '#DF5353'] // red
                  ],
                  lineWidth: 0,
                  minorTickInterval: null,
                  tickAmount: 2,
                  title: {
                      y: -70
                  },
                  labels: {
                      y: 16
                  }
              },

              plotOptions: {
                  solidgauge: {
                      dataLabels: {
                          y: 5,
                          borderWidth: 0,
                          useHTML: true
                      }
                  }
              }
          };

          var chartSpeed = HighCharts.chart('container-ejecutadas', HighCharts.merge(gaugeOptions, {
              yAxis: {
                  min: 0,
                  max: clientes,
                  title: {
                      text: 'Ventas <br/>Ejecutadas'
                  }
              },

              credits: {
                  enabled: false
              },

              series: [{
                  name: 'Ventas Mes',
                  data: pedidos,
                  dataLabels: {
                      format: '<div style="text-align:center"><span style="font-size:25px;color:black;">{y}</span><br/>' +
                             '<span style="font-size:12px;color:silver">Ejecutado</span></div>'
                  },
                  tooltip: {
                      valueSuffix: ' Ejecutado'
                  }
              }]
          }));
        });
    }
  }

  ionViewDidLoad() {
    this.getVentasDiarias();
    this.getVentasMes();
    this.getVentasEjecutadas();
  }

}
