import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { NrtOrg } from '../classes/nrt-org';
import { AppPreferences } from '@ionic-native/app-preferences/ngx';

@Injectable({
  providedIn: 'root'
})
export class NrtService {

// TODO http://cemec.arpacampania.it/meteoambientecampania/php/misure_suolo.php

  formatDate = (new Date().toISOString().substring(0, 10)).replace('-', '').replace('-', '');
  DATI_GREZZI_NEAR_REAL_TIME_URL = 'http://cemec.arpacampania.it/meteoambientecampania/php/downloadFileDati.php?path=/var/www/html/meteoambientecampania/prodotti/aria/arpac_dati_centraline_' + this.formatDate + '.csv';
  STAZIONI_NRT_URL = 'http://cemec.arpacampania.it/meteoambientecampania/prodotti/aria/stazioni.csv';
  ftc: FileTransferObject;
  actualData: NrtOrg[];
  actualDataTime: string;

  constructor(
    private ft: FileTransfer,
    private file: File,
    private fo: FileOpener,
    private ns: NativeStorage,
    private prefs: AppPreferences) {
  }

  ////////////////////////////////////////////////////////////// RISTRUTTURIAMO /////////////////////////////////////////////////////////

  // NativeStorage => "latest_nrt_data"
  async refreshData() {
    this.getStazioni();
    this.downloadLatestNrtCsv().then((ok) => {
      this.fsCsvToNrtOrgArray().then((nrtOrgArray: NrtOrg[]) => {
        console.log('got array: ', nrtOrgArray);
        if (nrtOrgArray !== undefined){
          this.prefs.fetch('stazione').then((stazione) => {
            this.ns.setItem('latest_nrt_custom', nrtOrgArray.find(x => x.stazione === stazione));
          });
          this.ns.setItem('latest_nrt_data', { array: nrtOrgArray, time: (new Date().toISOString()) }).then(_ => {
            console.log('successfully saved nrtOrgArray on native storage as \'latest_nrt_data\'');
          }).catch((err) => {
            console.log('failed setItem of \'latest_nrt_data\'');
          });
        }
      }).catch((err) => {
        console.log('failed conversion', err);
      });
    }).catch((err) => {
      console.log('failed download', err);
    });
  }

  async downloadLatestNrtCsv() {
    this.ftc = this.ft.create();
    await this.ftc.download(this.DATI_GREZZI_NEAR_REAL_TIME_URL, this.file.dataDirectory + this.formatDate + '.csv').then((entry) => {
      console.log('downloadLatestNrtCsv ok => ', entry);
    }).catch((err) => {
      console.log('downloadLatestNrtCsv bad => ', err);
      this.ftc.abort();
    });
    this.ftc.abort();
  }

  async fsCsvToNrtOrgArray() {
    return await this.file.readAsText(this.file.dataDirectory, this.formatDate + '.csv').then(async (result) => {
      const array = result.split('\n').map(x => x.split(','));
      const nrtArray = new Array<NrtOrg>();
      // OTTENGO TUTTI I NOMI
      const arrayNomi = new Array();
      array.forEach((e) => {
        if (arrayNomi.findIndex(el => el[0] === e[0]) === -1) {
          arrayNomi.push([e[0], e[1]]);
        }
      });
      arrayNomi.shift();
      // CICLO SUI NOMI X
      arrayNomi.forEach((an) => {
        const nome = an[0];
        const desc = an[1];
        let tempNrt = new NrtOrg();
        // OTTENGO TUTTI QUELLI CON LO STESSO NOME X
        const filByNome = array.filter(el => el[0] === nome);
        const arrayInq = new Array();
        // OTTENGO TUTTI GLI INQUINANTI PER QUEL NOME X
        filByNome.forEach((fbn) => {
          if (arrayInq.findIndex(el => el[0] === fbn[2]) === -1) {
            arrayInq.push([fbn[2], fbn[3]]);
          }
        });
        const tempInquinati = new Array();
        // CICLO SUGLI INQUINANTI Z
        arrayInq.forEach(iq => {
          const inq = iq[0];
          const umz = iq[1];
          // OTTENGO TUTTI QUELLI CON LO STESSO (NOME X E) INQUINANTE Z
          const filByInq = filByNome.filter(el => el[2] === inq);
          // SALVO L'ARRAY DEI DATI E ORA
          const dati = filByInq.map(function(m) {
            return {
              data_ora: m[4],
              valore: m[5]
            };
          });
          tempInquinati.push({
            inquinante: inq,
            um: umz,
            dati
          });
        });
        tempNrt = {
          stazione: nome,
          descrizione: desc,
          inquinanti: tempInquinati
        };
        nrtArray.push(tempNrt);

      });
      this.actualData = nrtArray;
      this.actualDataTime = nrtArray[0].inquinanti[0].dati[nrtArray[0].inquinanti[0].dati.length - 1].data_ora;
      return nrtArray;
    }).catch((err) => {
    });
  }

  // NativeStorage => "lista_stazioni"
  async getStazioni() {
    this.ftc = this.ft.create();
    await this.ftc.download(this.STAZIONI_NRT_URL, this.file.dataDirectory + 'lista_stazioni' + '.csv').then((entry) => {
      this.file.readAsText(this.file.dataDirectory, 'lista_stazioni' + '.csv').then(async (result) => {
        const stazioni = result.split('\n').map(x => x.split(','));
        await this.ns.setItem('lista_stazioni', stazioni);
      });
    }).catch((err) => {
      console.log('Error on Download', err);
      this.getStazioni();
    });
    this.ftc.abort();
  }

  async openTodayData() {
    await this.fo.open(this.file.dataDirectory + this.formatDate + '.csv', 'text/csv');
  }

}
