import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NrtService } from './services/nrt.service';
import { File } from '@ionic-native/file/ngx';

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
    private file: File
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initData();
    });
  }

  initData(){
    this.file.checkDir(this.file.dataDirectory, 'nrt_arpac').then(_ =>{
      this.nrt.refreshData();
    }).catch(_ => {
      this.file.createDir(this.file.dataDirectory, 'nrt_arpac', false).then(_ => {
        this.nrt.refreshData();
      })
    });
  }

}
