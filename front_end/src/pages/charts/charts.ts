import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ChartsService } from './charts.service';


@Component({
  selector: 'charts-page',
  templateUrl: 'charts.html'
})
export class ChartsPage {

  type: any = 'line';
  data = {labels:[], datasets:[]};
  loading: any;
  options = {
	responsive: true,
	maintainAspectRatio: true,
	
  };
  constructor(
    public nav: NavController,
    public loadingCtrl: LoadingController,
    public chartsService: ChartsService,
    public alertCtrl: AlertController
  ) {

  }

	
  
	ionViewDidEnter() {

		if (window.navigator.onLine) {
			this.chartsService
			.getDataFromServer()
			.then(data => {
				console.log(data);
				let items = data.rmGraficoVentasPlan;
				var yaxis1 = [];
				var yaxis2 = [];
				let labels = [];
				for(var i=0; i< items.length; i++) {
					/*let y1 = {'x' : items[i].date_order, 'y' : items[i].quantity};
					let y2 = {'x' : items[i].date_order, 'y' : items[i].plan};
					yaxis1.push(y1);
					yaxis2.push(y2);*/
					labels.push(items[i].date_order);
					yaxis1.push(items[i].quantity);
					yaxis2.push(items[i].plan);
				}
				let y1 = {'label' : 'Quantity', data: yaxis1,fill: false, borderColor: 'rgb(255, 99, 132)',backgroundColor: 'rgb(255, 99, 132)',};
				let y2 = {'label' : 'Plan', data: yaxis2,fill: false,  borderColor: 'rgb(54, 162, 235)',backgroundColor: 'rgb(54, 162, 235)',};
				this.data.datasets.push(y1);
				this.data.datasets.push(y2);
				this.data.labels = labels;
				console.log(this.data);
				
			});
		}
	}

}
