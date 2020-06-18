import { Injectable, ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AppPreferences } from '@ionic-native/app-preferences/ngx';
import { NrtOrg } from '../classes/nrt-org';
import { NrtService } from './nrt.service';

@Injectable({
  providedIn: 'root'
})
export class BgService {

  constructor(
    private nrt: NrtService,
    private localNotification: LocalNotifications,
    private prefs: AppPreferences,
    private ns: NativeStorage
  ) { }

  getText(){
    this.nrt.refreshData().then(_ => {
      this.prefs.fetch('stazione').then((stazione) => {
        this.ns.getItem('latest_nrt_custom').then((custom: NrtOrg) => {
          return custom.inquinanti.pop();
        }).catch((noCustom) => {
          return 'NULL';
        });
      });
    });
  }

  startNotifications(ok: boolean, time: number){
    if (ok){
      this.localNotification.schedule({
        text: 'lol' + this.getText(),
        sound: 'file://beef.caf',
        trigger: { in: time }
      });
    }
  }

}
