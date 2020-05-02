import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx'
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx'
import { NrtOrg } from '../classes/nrt-org';

@Injectable({
  providedIn: 'root'
})
export class NrtService {

  format_date = (new Date().toISOString().substring(0, 10)).replace("-", "").replace("-", "");
  DATI_GREZZI_NEAR_REAL_TIME_URL = "http://cemec.arpacampania.it/meteoambientecampania/php/downloadFileDati.php?path=/var/www/html/meteoambientecampania/prodotti/aria/arpac_dati_centraline_" + this.format_date + ".csv";
  STAZIONI_NRT_URL = "http://cemec.arpacampania.it/meteoambientecampania/prodotti/aria/stazioni.csv"
  ftc: FileTransferObject;
  actual_data: NrtOrg[];
  actual_data_time: string;

  constructor(private ft: FileTransfer, private file: File, private fo: FileOpener, private ns: NativeStorage) {
  }

  ////////////////////////////////////////////////////////////// RISTRUTTURIAMO /////////////////////////////////////////////////////////

  async refreshData() {
    this.downloadLatestNrtCsv().then((ok) => {
      this.fsCsvToNrtOrgArray().then((nrtOrgArray: NrtOrg[]) => {
        console.log("got array: ", nrtOrgArray);
        this.ns.setItem("latest_nrt_data", { array: nrtOrgArray, time: (new Date().toISOString()) }).then(_ => {
          console.log("successfully saved nrtOrgArray on native storage as 'latest_nrt_data'");
        }).catch((err) => {
          console.log("failed setItem of 'latest_nrt_data'");
        });
      }).catch((err) => {
        console.log("failed conversion", err)
      })
    }).catch((err) => {
      console.log("failed download", err)
    })
  }

  async downloadLatestNrtCsv() {
    this.ftc = this.ft.create();
    await this.ftc.download(this.DATI_GREZZI_NEAR_REAL_TIME_URL, this.file.dataDirectory + this.format_date + ".csv").then((entry) => {
      console.log("downloadLatestNrtCsv ok => ", entry);
    }).catch((err) => {
      console.log("downloadLatestNrtCsv bad => ", err);
      this.ftc.abort();
    })
    this.ftc.abort();
  }

  async fsCsvToNrtOrgArray() {
    return await this.file.readAsText(this.file.dataDirectory, this.format_date + ".csv").then(async (result) => {
      var array = result.split("\n").map(x => x.split(","))
      var nrtArray = new Array<NrtOrg>();
      // OTTENGO TUTTI I NOMI
      var array_nomi = new Array();
      array.forEach((e) => {
        if (array_nomi.findIndex(el => el[0] == e[0]) == -1) {
          array_nomi.push([e[0], e[1]]);
        }
      })
      array_nomi.shift();
      // CICLO SUI NOMI X
      array_nomi.forEach((an) => {
        var nome = an[0];
        var desc = an[1];
        var temp_nrt = new NrtOrg();
        // OTTENGO TUTTI QUELLI CON LO STESSO NOME X
        var fil_by_nome = array.filter(el => el[0] == nome);
        var array_inq = new Array();
        // OTTENGO TUTTI GLI INQUINANTI PER QUEL NOME X
        fil_by_nome.forEach((fbn) => {
          if (array_inq.findIndex(el => el[0] == fbn[2]) == -1) {
            array_inq.push([fbn[2], fbn[3]]);
          }
        })
        var temp_inquinati = new Array();
        // CICLO SUGLI INQUINANTI Z
        array_inq.forEach(iq => {
          var inq = iq[0];
          var umz = iq[1];
          // OTTENGO TUTTI QUELLI CON LO STESSO (NOME X E) INQUINANTE Z
          var fil_by_inq = fil_by_nome.filter(el => el[2] == inq);
          // SALVO L'ARRAY DEI DATI E ORA
          var dati = fil_by_inq.map(function (m) {
            return {
              data_ora: m[4],
              valore: m[5]
            }
          });
          temp_inquinati.push({
            inquinante: inq,
            um: umz,
            dati
          });
        })
        temp_nrt = {
          stazione: nome,
          descrizione: desc,
          inquinanti: temp_inquinati
        }
        nrtArray.push(temp_nrt);

      })
      this.actual_data = nrtArray;
      this.actual_data_time = nrtArray[0].inquinanti[0].dati[nrtArray[0].inquinanti[0].dati.length - 1].data_ora;
      return nrtArray;
    }).catch((err) => {
    });
  }

  async getStazioni() {
    this.ftc = this.ft.create();
    await this.ftc.download(this.STAZIONI_NRT_URL, this.file.dataDirectory + "lista_stazioni" + ".csv").then((entry) => {
      console.log(entry);
      this.file.readAsText(this.file.dataDirectory, "lista_stazioni" + ".csv").then(async (result) => {
        var stazioni = result.split("\n").map(x => x.split(","));
        console.log(stazioni);
        await this.ns.setItem("lista_stazioni", stazioni);
      });
    }).catch((err) => {
      console.log("Error on Download", err);
      this.getStazioni();
    })
    this.ftc.abort();
  }

  async openTodayData() {
    await this.fo.open(this.file.dataDirectory + this.format_date + ".csv", "text/csv");
  }

}
