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

  async getText(){
        return await this.ns.getItem('latest_nrt_custom').then((custom: NrtOrg) => {
          let out = '';
          custom.inquinanti.forEach((inq) => {
            out += '[' + inq.inquinante + '] ' + inq.dati.pop().valore + ' ' + inq.um + '\n';
          });
          out += this.nrt.getWorstText(custom);
          return out;
        }).catch((noCustom) => {
          return 'NULL';
        });
  }

  async startNotifications(ok: boolean, time: number){
    if (ok){
      this.localNotification.schedule({
        text: await this.getText(),
        sound: 'file://sound.mp3',
        trigger: { every: { minute: 0 } },
      });
    }
  }

}
