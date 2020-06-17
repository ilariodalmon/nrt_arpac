import { Component, OnInit } from '@angular/core';

import { AppPreferences } from '@ionic-native/app-preferences/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { BgService } from '../../services/bg.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  prefsStazione: string;
  prefsNotifica: boolean;
  prefsEveryNot: number;
  stazioni: string[];

  constructor(
    private prefs: AppPreferences,
    private ns: NativeStorage,
    private bg: BgService
  ) { }

  ngOnInit() {
    this.getAllPrefs();
    this.getStazioni();
    this.bg.startNotifications(this.prefsNotifica, this.prefsEveryNot);
  }

  getAllPrefs(){
    this.prefs.fetch('stazione').then((data: string) => {
      this.prefsStazione = data;
    });
    this.prefs.fetch('notifica').then((data: boolean) => {
      this.prefsNotifica = data;
    });
    this.prefs.fetch('every').then((data: number) => {
      this.prefsEveryNot = data;
    });
  }

  getStazioni(){
    this.ns.getItem('lista_stazioni').then((stazioni) => {
      this.stazioni = stazioni;
    }).catch((err) => {
      console.log('Error', err);
    });
  }

  onChange(event: any){
    const key = event.target.name;
    const value = event.target.value;
    if (key === 'every'){
      this.bg.startNotifications(this.prefsNotifica, value);
    } else if (key === 'notifica'){
      this.bg.startNotifications(value, this.prefsEveryNot);
    }
    console.log(key, value);
    this.prefs.store(key, value);
  }

}
