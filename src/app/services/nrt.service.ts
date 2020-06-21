import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { NrtOrg } from '../classes/nrt-org';
import { AppPreferences } from '@ionic-native/app-preferences/ngx';

@Injectable({
  providedIn: 'root'
})
export class NrtService {

// TODO http://cemec.arpacampania.it/meteoambientecampania/php/misure_suolo.php

  formatDate = (new Date().toISOString().substring(0, 10)).replace('-', '').replace('-', '');
  actualData: NrtOrg[];
  actualDataTime: string;
  workDir = this.file.dataDirectory + 'nrt_arpac/';
  secret = 'xxx';

  constructor(
    private file: File,
    private fo: FileOpener,
    private ns: NativeStorage,
    private prefs: AppPreferences) {
  }

  ////////////////////////////////////////////////////////////// RISTRUTTURIAMO /////////////////////////////////////////////////////////

  // NativeStorage => "latest_nrt_data"
  async refreshData() {
    this.getStazioni();
    this.downloadLatestNrtCsv();
  }

  async checkDirs(){
    return this.file.checkDir(this.file.dataDirectory, 'nrt_arpac').then((ok) => {
    }).catch((noDir) => {
      this.file.createDir(this.file.dataDirectory, 'nrt_arpac', false);
    });
  }

  async downloadLatestNrtCsv() {
    const opts = {
      method: 'POST',
      body: 'auth=' + this.secret + '&url=url_dati_centraline',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    fetch('https://www.dalmon.cloud/cors-proxy/nrt_arpac.php', opts).then((res: any) => {
      return res.text();
    }).then((res) => {
      const arr = this.csvToNrtClass(res);
      this.prefs.fetch('stazione').then((stazione) => {
        const custom = arr.find((x) => x.stazione === stazione);
        this.ns.setItem('custom_nrt_data', custom);
      });
      this.ns.setItem('latest_nrt_data', {time: new Date(), array: arr});
      this.file.removeFile(this.workDir, this.formatDate + '.csv').then(_ => {
        this.file.writeFile(this.workDir, this.formatDate + '.csv', res);
      });
    });
  }

  csvToNrtClass(csv: string){
    const array = csv.split('\n').map(x => x.split(','));
    const nrtArray = new Array<NrtOrg>();
    // OTTENGO TUTTI I NOMI
    const arrayNomi = new Array();
    array.forEach((e) => {
      if (arrayNomi.findIndex((el) => el[0] === e[0]) === -1) {
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
      const filByNome = array.filter((el) => el[0] === nome);
      const arrayInq = new Array();
      // OTTENGO TUTTI GLI INQUINANTI PER QUEL NOME X
      filByNome.forEach((fbn) => {
        if (arrayInq.findIndex((el) => el[0] === fbn[2]) === -1) {
          arrayInq.push([fbn[2], fbn[3]]);
        }
      });
      const tempInquinati = new Array();
      // CICLO SUGLI INQUINANTI Z
      arrayInq.forEach((iq) => {
        const inq = iq[0];
        const umz = iq[1];
        // OTTENGO TUTTI QUELLI CON LO STESSO (NOME X E) INQUINANTE Z
        const filByInq = filByNome.filter((el) => el[2] === inq);
        // SALVO L'ARRAY DEI DATI E ORA
        const dati = filByInq.map((m) => {
          return {
            data_ora: m[4],
            valore: m[5],
          };
        });
        tempInquinati.push({
          inquinante: inq,
          um: umz,
          dati,
        });
      });
      tempNrt = {
        stazione: nome,
        descrizione: desc,
        inquinanti: tempInquinati,
      };
      nrtArray.push(tempNrt);
    });
    this.actualData = nrtArray;
    this.actualDataTime =
      nrtArray[0].inquinanti[0].dati[
        nrtArray[0].inquinanti[0].dati.length - 1
      ].data_ora;
    return nrtArray;
  }

  async fsCsvToNrtOrgArray() {
    return await this.file.readAsText(this.file.dataDirectory + this.workDir, this.formatDate + '.csv').then(async (result) => {
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
          const dati = filByInq.map((m) => {
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
    const opts = {
      method: 'POST',
      body: 'auth=' + this.secret + '&url=url_stazioni',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    fetch('https://www.dalmon.cloud/cors-proxy/nrt_arpac.php', opts).then((res: any) => {
      return res.text();
    }).then((res) => {
      const stazioni = res.split('\n').map(x => x.split(','));
      this.ns.setItem('lista_stazioni', stazioni);
      this.file.removeFile(this.workDir, this.formatDate + '.csv').then(_ => {
        this.file.writeFile(this.workDir, 'lista_stazioni.csv', stazioni);
      });
    });
  }

  async openTodayData() {
    await this.fo.open(this.workDir + '/' + this.formatDate + '.csv', 'text/csv');
  }

  getColoreByValore(inquinante: string, valore: number): string {
    if (valore <= 0){
      return '#40E0D0';
    }
  // molecola - mg/m^2
    const soglie = {
      // microgrammi
      PM10: [
        [0, 10, '#40E0D0'],    // turchese
        [10, 25, '#008000'],   // verde
        [25, 50, '#FFFF00'],   // giallo
        [50, 75, '#FF0000'],   // rosso
        [75, 999999, '#800080']// viola
      ],
      // microgrammi
      'PM2.5': [ // ????? ANNUO ?????
        [0, 15, '#008000'],
        [15, 25, '#FFFF00'],
        [25, 50, '#FF0000'],
        [50, 999999, '#800080']
      ],
      // microgrammi
      Benzene: [
        [0, 2, '#008000'],
        [2, 3.5, '#FF0000'],
        [3.5, 999999, '#800080'],
      ],
      // milligrammi
      CO: [
        [0, 5, '#008000'],
        [5, 7, '#FF0000'],
        [7, 99999, '#FF0000'],
      ],
      SO2: [
        [0, 8, '#40E0D0'],
        [8, 12, '#008000'],
        [12, 50, '#FFFF00'],
        [50, 75, '#FF0000'],
        [75, 999999, '#800080']
      ],
      NO2: [
        [0, 19, '#40E0D0'],
        [19, 32, '#008000'],
        [32, 200, '#FFFF00'],
        [200, 300, '#FF0000'],
        [300, 999999, '#800080']
      ]

    };

    let code: string;
    const arraySoglie = soglie[inquinante];
    arraySoglie.forEach((elem: any[]) => {
      if (valore > elem[0] && valore < elem[1]){
        code = elem[2];
      }
    });
    return code;
  }

  getTextByColore(colore: string): [number, string] {
    switch (colore) {
      case '#40E0D0':
        return [1, 'Valori ottimi, scendi e corri!'];

      case '#008000':
        return [2, 'Valori buoni, passeggia, fai cose..'];

      case '#FFFF00':
        return [3, 'Valori così così, al limite'];

      case '#FF0000':
        return [4, 'Non uscire, valori oltre il limite'];

      case '#800080':
        return [5, 'Amico scappa o chiuditi dentro, sono serio'];
    }
  }

  getTextByNumber(n: number) {
    const diz = {
      1: 'Valori ottimi, scendi e corri!',
      2: 'Valori buoni, passeggia, fai cose..',
      3: 'Valori così così, al limite',
      4:  'Non uscire, valori oltre il limite',
      5: 'Amico scappa o chiuditi dentro, sono serio'
    };

    return diz[n];
  }

  getWorstText(array: NrtOrg) {
    let worst = 0;
    array.inquinanti.forEach((inq) => {
      const val = this.getTextByColore(this.getColoreByValore(inq.inquinante, inq.dati.pop().valore));
      if (val[0] > worst) {
        worst = val[0];
      }
    });
    return this.getTextByNumber(worst);
  }

}
