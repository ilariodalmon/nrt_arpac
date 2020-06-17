export class NrtOrg {
    stazione: string;
    descrizione: string;
    inquinanti: {
        inquinante: string,
        um: string,
        dati: {
            data_ora: string,
            valore: number,
        }[]
    }[];
}
