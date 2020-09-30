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
  ) {
  }

  getAllPrefs(): [string, boolean, number]{
    this.prefs.fetch('stazione').then((data: string) => {
      this.prefsStazione = data;
    });
    this.prefs.fetch('notifica').then((data: boolean) => {
      this.prefsNotifica = data;
    });
    this.prefs.fetch('every').then((data: number) => {
      this.prefsEveryNot = data;
    });
    return [this.prefsStazione, this.prefsNotifica, this.prefsEveryNot];
  }

  changePrefs(key: string, value: any){
    this.prefs.store(key, value);
  }
}
