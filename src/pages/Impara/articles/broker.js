export const brokerContent = [
  { type: 'p', text: "Per comprare ETF in Italia hai bisogno di un broker — una piattaforma autorizzata che esegue gli ordini sul mercato per tuo conto. Ce ne sono molti, con differenze significative su commissioni, facilità d'uso e gestione fiscale." },
  { type: 'h2', text: 'I 4 criteri che contano davvero' },
  { type: 'list', items: [
    "Commissioni per transazione: quanto paghi ogni volta che compri o vendi un ETF",
    "Catalogo ETF disponibili: non tutti i broker offrono tutti gli ETF",
    "Regime fiscale: italiano (amministrato, tasse automatiche) o estero (dichiarativo, devi fare tu la dichiarazione)",
    "Facilità d'uso: importante soprattutto per chi inizia",
  ]},
  { type: 'h2', text: 'Confronto tra i principali broker' },
  {
    type: 'table',
    headers: ['Broker', 'Commissione ETF', 'Regime fiscale', 'Adatto a'],
    rows: [
      ['Fineco', '€2,95/ordine (piano gratuito)', 'Amministrato', 'Chi vuole tutto in una banca'],
      ['Scalable Capital', '€0 (piano Free, 1 ETF/mese) o €2,99/mese illimitato', 'Dichiarativo', 'Chi conosce il regime dichiarativo'],
      ['Trade Republic', '€1/ordine', 'Amministrato', 'Semplicità, piccoli importi'],
      ['DEGIRO', '€1–3/ordine', 'Dichiarativo', 'Chi vuole ampio catalogo'],
      ['IBKR', 'Molto basse (variabili)', 'Dichiarativo', 'Investitori avanzati'],
    ],
  },
  { type: 'h2', text: 'Regime amministrato vs dichiarativo' },
  { type: 'p', text: "Con un broker italiano in regime amministrato (Fineco, Directa, Trade Republic), le tasse vengono calcolate e versate automaticamente dal broker. Non devi fare nulla in dichiarazione dei redditi per questi investimenti." },
  { type: 'p', text: "Con un broker estero in regime dichiarativo (DEGIRO, IBKR), sei tu a dover dichiarare plusvalenze, dividendi e patrimonio estero ogni anno nel modello 730/Redditi. Richiede più lavoro e, spesso, un commercialista." },
  { type: 'box', variant: 'info', title: 'Consiglio per chi inizia', text: "Scegli un broker italiano in regime amministrato. Le commissioni leggermente più alte sono ampiamente compensate dalla semplicità fiscale: non rischi errori, sanzioni o stress a fine anno. Directa o Trade Republic sono tra le opzioni migliori per chi fa PAC su ETF." },
  { type: 'box', variant: 'example', title: 'Attenzione al conto deposito', text: "Alcuni broker (come Trade Republic) offrono un conto con interessi sulla liquidità. È comodo, ma ricorda: il tuo obiettivo principale è investire in ETF, non parcheggiare liquidità. Valuta il broker principalmente sulla sua offerta ETF e sulle commissioni di trading." },
]
