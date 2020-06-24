import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NrtService } from './services/nrt.service';
import { PrefsService } from './services/prefs.service';
import { BgService } from './services/bg.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private nrt: NrtService,
    private prefs: PrefsService,
    private bg: BgService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initData();
      this.startNotificationIfEnabled();
    });
  }

  initData(){
    this.nrt.checkDirs().then(_ => {
      this.nrt.refreshData();
    });
  }

  startNotificationIfEnabled(){
    const prefs = this.prefs.getAllPrefs();
    this.bg.startNotifications(prefs[1], prefs[2]);

  }

}
