import { Injectable } from '@angular/core';
import { AppPreferences } from '@ionic-native/app-preferences/ngx';

@Injectable({
  providedIn: 'root'
})
export class PrefsService {

  prefsStazione: string;
  prefsNotifica: boolean;
  prefsEveryNot: number;

  constructor(
    private prefs: AppPreferences
  ) { }

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

  changePrefs(key, value){
    this.prefs.store(key, value);
  }
}