export const tasseEtfContent = [
  { type: 'p', text: "In Italia, i guadagni da investimenti finanziari sono tassati al 26%. Vale per le plusvalenze (quando vendi a un prezzo più alto di quello a cui hai comprato) e per i dividendi (le cedole distribuite dagli ETF). Capire come funziona questa tassazione ti aiuta a prendere decisioni più efficienti." },
  { type: 'h2', text: 'Cosa viene tassato e quando' },
  { type: 'list', items: [
    "Plusvalenze: la differenza tra prezzo di vendita e prezzo di acquisto, tassata al 26% solo nel momento in cui vendi",
    "Dividendi (ETF a distribuzione): ogni cedola ricevuta è tassata subito al 26%, automaticamente dal broker",
    "ETF ad accumulo: nessuna tassazione finché non vendi — i dividendi si reinvestono senza passare per il fisco",
  ]},
  { type: 'h2', text: "Accumulo vs distribuzione: l'impatto fiscale" },
  { type: 'p', text: "Con un ETF ad accumulo (ACC), i dividendi interni vengono reinvestiti direttamente nell'ETF senza che tu li riceva o li dichiari. Paghi il 26% solo quando decidi di vendere, e solo sulla plusvalenza complessiva." },
  { type: 'p', text: "Con un ETF a distribuzione (DIST), ogni dividendo che ricevi viene tassato subito al 26%. Quella quota di guadagno non può più lavorare per te — è uscita dal portafoglio. Nel lungo periodo, questo frena significativamente l'interesse composto." },
  { type: 'box', variant: 'info', title: 'Perché gli ETF ad accumulo sono più efficienti', text: "Esempio: \u20ac100 di dividendi su un ETF a distribuzione \u2192 \u20ac74 che puoi reinvestire (perdi \u20ac26 subito). Su un ETF ad accumulo \u2192 \u20ac100 rimangono nel fondo e continuano a crescere. Dopo 20 anni a 7%, quei \u20ac26 \"risparmiati\" diventano circa \u20ac100 in più. La differenza si accumula ogni anno." },
  { type: 'h2', text: 'Broker italiano vs estero: la differenza fiscale' },
  { type: 'p', text: "Con un broker italiano (Fineco, Scalable, Trade Republic) in regime amministrato, il broker fa tutto: calcola le tasse, le trattiene e le versa allo Stato per tuo conto. Non devi dichiarare nulla nel 730." },
  { type: 'p', text: "Con un broker estero (DEGIRO, IBKR) in regime dichiarativo, sei tu responsabile di dichiarare ogni anno plusvalenze, minusvalenze, dividendi esteri e il patrimonio detenuto all'estero (quadro RW del modello Redditi). Richiede attenzione e spesso un commercialista." },
  { type: 'h2', text: 'Le minusvalenze: come compensarle' },
  { type: 'p', text: "Se vendi un ETF in perdita, quella minusvalenza può essere usata per ridurre le tasse su future plusvalenze. C'è però un limite importante: in Italia, le minusvalenze da ETF (classificati come redditi di capitale) non si possono compensare direttamente con le plusvalenze da ETF. Si possono compensare solo con plusvalenze da strumenti come singole azioni o ETF a leva, classificate come redditi diversi." },
  { type: 'box', variant: 'info', title: 'In pratica', text: "Per la maggior parte degli investitori in ETF con un broker italiano, la questione delle minusvalenze è secondaria: se mantieni gli ETF nel lungo periodo e non vendi mai in perdita, il problema non si pone. Concentrati sul costruire un buon portafoglio e sul tenerlo nel tempo." },
]
