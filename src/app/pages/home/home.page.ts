import { Component } from '@angular/core';
import { NrtService } from '../../services/nrt.service';
import { NrtOrg } from '../../classes/nrt-org';

import { AppPreferences } from '@ionic-native/app-preferences/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  prefsStazione: string;
  prefsNotifica: boolean;
  prefsEveryNot: number;

  all: NrtOrg[];
  custom: NrtOrg;
  msg: string;
  lastFetch: string;

  constructor(
    private ns: NativeStorage,
    private prefs: AppPreferences,
    private nrt: NrtService
  ) {
    // this.testPrefs();
  }

  // 1) check prefs
  async getPrefsStazione(){
    await this.prefs.fetch('stazione').then((data: string) => {
      this.prefsStazione = data;
    });
  }
  // 2) filter data
  getDataStazione(stazione: string){
    this.custom = this.all.find(x => x.stazione === this.prefsStazione);
    console.log(this.all, this.prefsStazione);
  }
  // 3) display
  ionViewWillEnter(){
    this.ns.getItem('latest_nrt_data').then((data) => {
      console.log(data);
      this.all = data.array;
      this.lastFetch = data.time;
      this.getPrefsStazione().then(_ => {
        this.getDataStazione(this.prefsStazione);
      });
    });
  }
  refreshData(){
    this.nrt.refreshData();
  }

  testPrefs(){
    this.msg = 'ho la minchia blu';
    this.setUserPrefs('asd', 'minchia').then(_ => {
      this.getUserPrefs('asd').then((p) => {
        this.msg = p;
      });
    });
  }

  async setUserPrefs(key: string, value: string) {
    await this.prefs.store(key, value);
  }

  async getUserPrefs(key: string) {
    return this.prefs.fetch(key).then((value: string) => {
      return value;
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
