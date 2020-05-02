import { NrtOrg } from './../classes/nrt-org';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { NrtService } from './../services/nrt.service';
import { Component, OnInit } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { NavController, Platform, LoadingController } from '@ionic/angular';
import { DatePicker } from '@ionic-native/date-picker/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  minute_of_notification: number;
  nrt_array: NrtOrg[];
  filter_items: string;
  filterTerm: string;
  chosenStazione: string;
  chosenStazioneData: NrtOrg;
  lastDown: string;
  getNotification: boolean;
  lista_stazioni: any[];
  soglie: {
    'Benzene': 3.25,
    'NO2': 0,
    'O3': 0,
    'SO2': 0
  }
  loading = this.loadingController.create({
    message: 'Carico dati...',
  });

  constructor(private platform: Platform, private nrt: NrtService, private ns: NativeStorage, private datePicker: DatePicker, private notSched: LocalNotifications, private navCtrl: NavController, public loadingController: LoadingController) {
    this.minute_of_notification = 1;
    this.platform.ready().then(()=>{
      this.ns.getItem("notChoice").then(async (choice) => {
        console.log("notification choice found: ", choice);
        this.getNotification = choice;
       
      }).catch((not_a_choice) => {
        console.log("not a choice on notifications or err => ", not_a_choice);
      })
    })
  }

  async presentLoading() {
    (await this.loading).present();
  }

  async closeLoading() {
    await (await this.loading).dismiss();
  }

  ngOnInit() {
    this.presentLoading();
    this.platform.ready().then(_ => {
      this.ns.getItem("latest_nrt_data").then((data) => {
        this.nrt_array = data.array;
        this.lastDown = data.time;
        console.log("asd", data);
        this.ns.getItem("chosenStazione").then((stazione) => {
          console.log("chosen stazione found: ", stazione);
          this.chosenStazioneData = this.nrt_array.find(s => s.stazione == stazione);
          this.chosenStazione = stazione;
        }).catch((err) => {
          this.chosenStazioneData = this.nrt_array.pop();
          this.chosenStazione = this.chosenStazioneData.descrizione;
        }).then(async ()=>{
          if (this.getNotification) {
            this.notSched.schedule({
              title: "ARPAC NearRealTime",
              text: this.chosenStazioneData.descrizione + "\n" + await this.getChosenDataForNot(),
              trigger: { every: { minute: this.minute_of_notification }, count: 1 },
            });
          }
        });
      })
    }).then((tutt_ok) => {
      console.log("okokokokokokok")
      this.closeLoading();
    });
  }

  trackByFn(index, item) {
    return item.stazione;
  }

  async refresh() {
    await this.nrt.refreshData().then(_ => {
      this.ns.getItem("latest_nrt_data").then((data) => {
        this.nrt_array = data.array;
        this.lastDown = data.time;
        this.chosenStazioneData = this.nrt_array.find(s => s.stazione == this.chosenStazione);
        console.log("chosen data: ", this.chosenStazioneData);
      });
    });
  }

  async ngChangeSelectStazione(event) {
    this.ns.remove("chosenStazione").then(_ => {
      console.log(event.detail.value);
      this.chosenStazione = event.detail.value;
      this.chosenStazioneData = this.nrt_array.find(el => el.stazione == this.chosenStazione);
      this.ns.setItem("chosenStazione", event.detail.value);
    })
  }

  changeView(a, b) {
    document.querySelectorAll("#" + a + b).forEach((element) => {
      //@ts-ignore
      if (element.style.display == "none") element.style.display = "block";
      //@ts-ignore
      else element.style.display = "none";
    })
  }

  async getChosenDataForNot() {
    var out = "aaa"
    await this.nrt.refreshData().then(_ => {
      this.ns.getItem("latest_nrt_data").then((data) => {
        this.nrt_array = data;
        this.chosenStazioneData = this.nrt_array.find(s => s.stazione == this.chosenStazione);
        this.chosenStazioneData.inquinanti.forEach(element => {
          var last = element.dati[element.dati.length - 1];
          out = out + element.inquinante + " " + last.valore + "\n";
        });
      })
    })
    return out;
  }

  changedNotificationChoice() {
    console.log("setting choice: ", this.getNotification);
    this.ns.remove("notChoice").then(()=>{this.ns.setItem("notChoice", this.getNotification).then(async (ok) => {
        if (this.getNotification) {
          this.notSched.schedule({
            title: "ARPAC NearRealTime",
            text: this.chosenStazioneData.descrizione + "\n" + await this.getChosenDataForNot(),
            trigger: { every: { minute: this.minute_of_notification }, count: 1 },
          });
        }
      });
    });
  }

  goTo(page: string) {
    this.navCtrl.navigateRoot("/" + page)
  }

}
