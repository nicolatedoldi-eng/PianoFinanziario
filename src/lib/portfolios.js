// Definizione dei 4 profili portafoglio
export const PORTFOLIOS = {
  essenziale: {
    id: 'essenziale',
    name: 'Essenziale',
    description: 'Il punto di partenza ideale. Due soli ETF, un acquisto al mese, zero decisioni complesse. Perfetto per chi inizia da zero.',
    expectedReturn: 6.5,
    rebalanceFrequency: 'mensile',
    color: '#534AB7',
    etfs: [
      {
        ticker: 'VWCE',
        name: 'Vanguard FTSE All-World UCITS ETF',
        isin: 'IE00B3RBWM25',
        description: 'Azioni di tutto il mondo (sia sviluppati che emergenti)',
        percentage: 80,
      },
      {
        ticker: 'AGGH',
        name: 'iShares Core Global Aggregate Bond UCITS ETF',
        isin: 'IE00BDBRDM35',
        description: 'Obbligazioni globali per stabilizzare il portafoglio',
        percentage: 20,
      },
    ],
    rebalanceRule: 'Controlla ogni mese se gli ETF si sono allontanati di oltre il 5% dai target. Imposta una volta, funziona sempre: se VWCE supera 85% o scende sotto 75%, ribilancia.',
    alerts: [
      { when: 'VWCE > 85% o < 75%', action: 'Ribilancia vendendo/comprando per tornare a 80/20' },
      { when: 'Mercato cala > 20%', action: 'Nessuna azione. Continua il PAC, massima semplicit\u00e0' },
    ],
    steps: [
      'Apri un conto su un broker come Directa, Fineco o DEGIRO',
      "Acquista VWCE con l'80% del tuo capitale iniziale",
      'Acquista AGGH con il restante 20%',
      'Imposta un ordine ricorrente mensile con la stessa proporzione 80/20',
    ],
  },
  prudente: {
    id: 'prudente',
    name: 'Prudente',
    description: 'Portafoglio conservativo con forte componente obbligazionaria. Per chi non vuole sorprese.',
    expectedReturn: 5.5,
    rebalanceFrequency: 'semestrale',
    color: '#1D9E75',
    etfs: [
      {
        ticker: 'SWRD',
        name: 'SPDR MSCI World UCITS ETF',
        isin: 'IE00B4L5Y983',
        description: 'Azioni dei paesi sviluppati (Europa, USA, Giappone...)',
        percentage: 40,
      },
      {
        ticker: 'IBTM',
        name: 'iShares EUR Govt Bond 7-10yr UCITS ETF',
        isin: 'IE00B1FZS467',
        description: 'Titoli di stato europei in euro - nessun rischio valutario',
        percentage: 35,
      },
      {
        ticker: 'SGLE',
        name: 'iShares Physical Gold ETC',
        isin: 'IE00B4ND3602',
        description: "Oro fisico come protezione dall'inflazione",
        percentage: 15,
      },
      {
        ticker: 'XEON',
        name: 'Xtrackers EUR Overnight Rate Swap UCITS ETF',
        isin: 'LU0290358497',
        description: 'Liquidit\u00e0 remunerata al tasso BCE, zero rischio',
        percentage: 10,
      },
    ],
    rebalanceRule: 'Verifica ogni 6 mesi (gennaio e luglio) le percentuali. Ribilancia se qualcuno si allontana di oltre 5% dal target.',
    alerts: [
      { when: 'Azionario (SWRD) > 45% o < 35%', action: 'Ribilancia verso i target originali' },
      { when: 'Crisi di mercato', action: "L'oro e le obbligazioni proteggono. Non intervenire." },
    ],
    steps: [
      'Apri un conto su un broker (Directa, Fineco o DEGIRO)',
      'Suddividi il capitale: 40% SWRD, 35% IBTM, 15% SGLE, 10% XEON',
      'Configura il PAC mensile con le stesse proporzioni',
      'Agenda un promemoria a gennaio e luglio per il controllo semestrale',
    ],
  },
  bilanciato: {
    id: 'bilanciato',
    name: 'Bilanciato',
    description: 'Mix equilibrato tra crescita e stabilit\u00e0. Il portafoglio pi\u00f9 popolare per obiettivi a lungo termine.',
    expectedReturn: 7.5,
    rebalanceFrequency: 'semestrale',
    color: '#EF9F27',
    etfs: [
      {
        ticker: 'VWCE',
        name: 'Vanguard FTSE All-World UCITS ETF',
        isin: 'IE00B3RBWM25',
        description: 'Azioni di tutto il mondo (sia sviluppati che emergenti)',
        percentage: 55,
      },
      {
        ticker: 'EIMI',
        name: 'iShares Core MSCI Emerging Markets IMI UCITS ETF',
        isin: 'IE00B4L5YC18',
        description: 'Mercati emergenti extra per maggiore diversificazione',
        percentage: 10,
      },
      {
        ticker: 'AGGH',
        name: 'iShares Core Global Aggregate Bond UCITS ETF',
        isin: 'IE00BDBRDM35',
        description: 'Obbligazioni globali per ammortizzare le cadute',
        percentage: 25,
      },
      {
        ticker: 'SGLE',
        name: 'iShares Physical Gold ETC',
        isin: 'IE00B4ND3602',
        description: 'Oro fisico come riserva di valore',
        percentage: 10,
      },
    ],
    rebalanceRule: "Controlla ogni 6 mesi. Ribilancia se l'azionario totale (VWCE + EIMI) supera il 70% o scende sotto il 60%.",
    alerts: [
      { when: 'Azionario totale > 70% o < 60%', action: 'Ribilancia per tornare a 65% azionario' },
      { when: 'EIMI > 15%', action: 'Riduci gli emergenti, hanno corso troppo' },
    ],
    steps: [
      'Apri un conto su un broker (Directa, Fineco o DEGIRO)',
      'Suddividi il capitale: 55% VWCE, 10% EIMI, 25% AGGH, 10% SGLE',
      'Configura il PAC mensile con le stesse proporzioni',
      'Imposta promemoria a gennaio e luglio per il ribilanciamento',
    ],
  },
  crescita: {
    id: 'crescita',
    name: 'Crescita',
    description: 'Portafoglio aggressivo orientato alla massima crescita nel lungo periodo. Per stomaci forti.',
    expectedReturn: 9.5,
    rebalanceFrequency: 'mensile',
    color: '#E24B4A',
    etfs: [
      {
        ticker: 'VWCE',
        name: 'Vanguard FTSE All-World UCITS ETF',
        isin: 'IE00B3RBWM25',
        description: 'Azioni di tutto il mondo come base globale',
        percentage: 60,
      },
      {
        ticker: 'EIMI',
        name: 'iShares Core MSCI Emerging Markets IMI UCITS ETF',
        isin: 'IE00B4L5YC18',
        description: 'Overweight sui mercati emergenti per pi\u00f9 crescita',
        percentage: 15,
      },
      {
        ticker: 'ZPRV',
        name: 'SPDR MSCI USA Small Cap Value UCITS ETF',
        isin: 'IE00BSPLC413',
        description: 'Small cap value USA: storicamente il miglior fattore di rendimento',
        percentage: 15,
      },
      {
        ticker: 'SGLE',
        name: 'iShares Physical Gold ETC',
        isin: 'IE00B4ND3602',
        description: 'Piccola quota oro come copertura estrema',
        percentage: 10,
      },
    ],
    rebalanceRule: 'Controlla ogni mese. Con questo profilo il mercato pu\u00f2 oscillare molto: ribilancia solo se qualcuno supera \u00b17% dal target.',
    alerts: [
      { when: 'Calo di mercato > 30%', action: 'Questo \u00e8 normale per il tuo profilo. Compra di pi\u00f9 se puoi.' },
      { when: 'VWCE > 67% o < 53%', action: 'Ribilancia verso il 60% target' },
      { when: 'ZPRV > 22%', action: 'Le small cap hanno corso: riduci e riequilibra' },
    ],
    steps: [
      'Apri un conto su un broker (Directa, Fineco o DEGIRO)',
      'Suddividi il capitale: 60% VWCE, 15% EIMI, 15% ZPRV, 10% SGLE',
      'Configura il PAC mensile con le stesse proporzioni',
      'Controlla mensilmente \u2014 la volatilit\u00e0 \u00e8 alta, serve disciplina',
    ],
  },
}

// Logica per determinare il profilo consigliato
export function recommendPortfolio(answers) {
  let score = 0
  const goalScores = { casa: 0, pensione: 1, liberta: 2, emergenze: 0 }
  score += goalScores[answers.goal] || 0
  const expScores = { zero: 0, letto: 1, qualcosa: 2, esperto: 3 }
  score += expScores[answers.experience] || 0
  const riskScores = { vendo: 0, aspetto: 1, continuo: 2, compro: 3 }
  score += riskScores[answers.risk] || 0
  if (answers.horizon >= 20) score += 2
  else if (answers.horizon >= 10) score += 1
  if (score <= 2) return 'essenziale'
  if (score <= 4) return 'prudente'
  if (score <= 6) return 'bilanciato'
  return 'crescita'
}
