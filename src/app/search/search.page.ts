import { Component } from '@angular/core';
import { NrtService } from '../services/nrt.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { NrtOrg } from '../classes/nrt-org';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage {

  nrt_array : NrtOrg[];
  filter_items : string; 
  filterTerm : string;
  shown_array: NrtOrg[];

  constructor(private nrt: NrtService, private ns: NativeStorage, private navCtrl: NavController) {
    /*
      this.ns.getItem("today_nrt_json").then((data)=>{
        this.nrt_array = data;
        for (let index = 0; index < 10; index++) {
          this.shown_array.push(this.nrt_array.pop())
        }
        console.log("?",this.nrt_array)
      }).catch((err)=>{
        console.log(err, "eroiweroiweroweir")
      })
      */
  }

  filterItems(searchTerm: string) {
    return this.nrt_array.filter(item => {
      return (item.stazione.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 && item.descrizione.toLowerCase().indexOf(searchTerm.toLowerCase()) < -1);
    });
  }

  changeView(a,b){
    document.querySelectorAll("#" + a+b).forEach((element) => {
      //@ts-ignore
      if (element.style.display == "none") element.style.display = "block";
      //@ts-ignore
      else element.style.display = "none";
    })
  }

  goTo(page: string){
    this.navCtrl.navigateRoot("/"+page)
  }

}
