import { Component, OnInit } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { NrtOrg } from 'src/app/classes/nrt-org';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  all: NrtOrg[];
  custom: NrtOrg[];
  filterTerm: string;

  constructor(
    private ns: NativeStorage,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
   this.ns.getItem('latest_nrt_data').then((data) => {
      console.log(data);
      this.all = data.array;
    });
  }

  filterItems(searchTerm: string) {
    return this.all.filter(item => {
      return (item.stazione.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 &&
              item.descrizione.toLowerCase().indexOf(searchTerm.toLowerCase()) < -1);
    });
  }

  changeView(a: string, b: string) {
    document.querySelectorAll('#' + a + b).forEach((element) => {
      // @ts-ignore
      if (element.style.display === 'none') {
      // @ts-ignore
        element.style.display = 'block';
      }
      // @ts-ignore
      else {
      // @ts-ignore
        element.style.display = 'none';
      }
    });
  }

}
