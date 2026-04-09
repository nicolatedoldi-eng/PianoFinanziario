import { jsPDF } from 'jspdf'
import { calculateProjection } from './finance'

const PURPLE = [83, 74, 183]    // #534AB7
const GREEN  = [29, 158, 117]   // #1D9E75
const GRAY   = [107, 114, 128]  // #6B7280
const DARK   = [17, 24, 39]     // #111827
const LIGHT  = [249, 250, 251]  // #F9FAFB
const BORDER = [229, 231, 235]  // #E5E7EB

function euro(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
function euroFull(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n)
}

export function generatePianoPDF(profile, dbProfile, params) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 18
  const contentW = W - margin * 2

  // ── Header band ────────────────────────────────────────────────────────────────────────────
  doc.setFillColor(...PURPLE)
  doc.rect(0, 0, W, 38, 'F')

  // Logo "P" circle
  doc.setFillColor(255, 255, 255)
  doc.circle(margin + 5, 19, 5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...PURPLE)
  doc.text('P', margin + 5, 19 + 3.5, { align: 'center' })

  // App name
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('PianoFinanziario', margin + 13, 17)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(200, 200, 230)
  doc.text('Il tuo piano finanziario personale', margin + 13, 24)

  // Date — right side
  const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.setFontSize(8.5)
  doc.setTextColor(200, 200, 230)
  doc.text(`Generato il ${today}`, W - margin, 19, { align: 'right' })

  let y = 50

  function sectionTitle(text) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...PURPLE)
    doc.text(text, margin, y)
    doc.setDrawColor(...PURPLE)
    doc.setLineWidth(0.4)
    doc.line(margin, y + 1.5, margin + contentW, y + 1.5)
    y += 7
  }

  function labelValue(label, value, x, yy, valueColor = DARK) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...GRAY)
    doc.text(label, x, yy)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...valueColor)
    doc.text(value, x, yy + 5)
  }

  function statCard(label, value, x, yy, w, valueColor = DARK) {
    doc.setFillColor(...LIGHT)
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, yy, w, 18, 2, 2, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...GRAY)
    doc.text(label, x + 3, yy + 5.5)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...valueColor)
    doc.text(value, x + 3, yy + 13.5)
  }

  // ── 1. Riepilogo profilo ─────────────────────────────────────────────────────────────────────────
  sectionTitle('1. Il tuo profilo')

  const cardW = (contentW - 6) / 4
  labelValue('Profilo', profile.name, margin, y, PURPLE)
  y += 12
  const profileCards = [
    { label: 'Capitale iniziale', value: euro(params.initialCapital) },
    { label: 'PAC mensile', value: euro(params.monthlyPayment) },
    { label: 'Orizzonte', value: `${params.horizon} anni` },
    { label: 'Rendimento atteso', value: `${profile.expectedReturn}%` },
  ]
  profileCards.forEach((c, i) => {
    statCard(c.label, c.value, margin + i * (cardW + 2), y, cardW)
  })
  y += 24

  // ── 2. Proiezione finanziaria ────────────────────────────────────────────────────────────────────────
  sectionTitle('2. Proiezione finanziaria (scenario base)')

  const result = calculateProjection(
    params.initialCapital,
    params.monthlyPayment,
    profile.expectedReturn,
    params.horizon,
    params.annualGrowth,
  )

  const projCards = [
    { label: 'Capitale finale stimato', value: euro(result.finalCapital), color: PURPLE },
    { label: 'Totale versato', value: euro(result.totalDeposited), color: GREEN },
    { label: 'Interessi guadagnati', value: euro(result.totalInterest), color: GREEN },
    { label: 'Rendita mensile (regola 4%)', value: euro(result.monthlyIncome), color: [239, 159, 39] },
  ]

  const projW = (contentW - 6) / 4
  projCards.forEach((c, i) => {
    statCard(c.label, c.value, margin + i * (projW + 2), y, projW, c.color)
  })
  y += 24

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  const note = `Ipotesi: rendimento annuo ${profile.expectedReturn}%, crescita PAC ${params.annualGrowth}% annuo, orizzonte ${params.horizon} anni.`
  doc.text(note, margin, y)
  y += 10

  // ── 3. Portafoglio ETF ────────────────────────────────────────────────────────────────────────────
  sectionTitle('3. Portafoglio ETF consigliato')

  const cols = [
    { label: 'Ticker', x: margin, w: 18 },
    { label: 'ETF', x: margin + 18, w: 68 },
    { label: 'ISIN', x: margin + 86, w: 34 },
    { label: '%', x: margin + 120, w: 14 },
    { label: 'Importo', x: margin + 134, w: 26 },
    { label: 'PAC/mese', x: margin + 160, w: 14 },
  ]

  doc.setFillColor(...PURPLE)
  doc.rect(margin, y, contentW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  cols.forEach(c => doc.text(c.label, c.x + 1.5, y + 4.8))
  y += 7

  profile.etfs.forEach((etf, idx) => {
    const rowH = 12
    if (idx % 2 === 0) {
      doc.setFillColor(...LIGHT)
      doc.rect(margin, y, contentW, rowH, 'F')
    }
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.2)
    doc.rect(margin, y, contentW, rowH, 'D')

    doc.setFillColor(238, 240, 251)
    doc.roundedRect(cols[0].x + 1, y + 2, 15, 7, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...PURPLE)
    doc.text(etf.ticker, cols[0].x + 8.5, y + 7.2, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...DARK)
    const nameLines = doc.splitTextToSize(etf.name, cols[1].w - 3)
    doc.text(nameLines[0], cols[1].x + 1.5, y + 5)
    if (nameLines.length > 1) {
      doc.setFontSize(6.5)
      doc.setTextColor(...GRAY)
      doc.text(nameLines[1], cols[1].x + 1.5, y + 9.5)
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...GRAY)
    doc.text(etf.isin, cols[2].x + 1.5, y + 6.5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...PURPLE)
    doc.text(`${etf.percentage}%`, cols[3].x + 1.5, y + 6.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...DARK)
    doc.text(euro(params.initialCapital * etf.percentage / 100), cols[4].x + 1.5, y + 6.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...DARK)
    doc.text(euroFull(params.monthlyPayment * etf.percentage / 100), cols[5].x + 1.5, y + 6.5)

    y += rowH
  })
  y += 8

  // ── 4. Regola di ribilanciamento ────────────────────────────────────────────────────────────────────────
  sectionTitle('4. Regola di ribilanciamento')

  const ruleLines = doc.splitTextToSize(profile.rebalanceRule, contentW - 8)
  const ruleBoxH = ruleLines.length * 4.5 + 8
  doc.setFillColor(255, 251, 235)
  doc.setDrawColor(253, 230, 138)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, y, contentW, ruleBoxH, 3, 3, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(180, 120, 0)
  doc.text('!', margin + 4, y + ruleBoxH / 2 + 2)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(120, 80, 0)
  doc.text(ruleLines, margin + 10, y + 6)
  y += ruleBoxH + 6

  doc.setFillColor(238, 240, 251)
  doc.roundedRect(margin, y, 60, 7, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...PURPLE)
  doc.text(`Frequenza controllo: ${profile.rebalanceFrequency}`, margin + 4, y + 4.8)
  y += 14

  // ── 5. Disclaimer ─────────────────────────────────────────────────────────────────────────────────
  if (y > 260) {
    doc.addPage()
    y = 20
  }

  doc.setFillColor(254, 242, 242)
  doc.setDrawColor(254, 202, 202)
  doc.setLineWidth(0.3)

  const disclaimer = 'Questo documento è generato automaticamente a scopo informativo e non costituisce consulenza finanziaria. Gli investimenti comportano rischi. Rendimenti passati non garantiscono risultati futuri.'
  const discLines = doc.splitTextToSize(disclaimer, contentW - 10)
  const discH = discLines.length * 4.5 + 10

  doc.roundedRect(margin, y, contentW, discH, 3, 3, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(185, 28, 28)
  doc.text('Avviso legale', margin + 4, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(127, 29, 29)
  doc.text(discLines, margin + 4, y + 11)
  y += discH + 4

  // ── Footer ───────────────────────────────────────────────────────────────────────────────
  const pageH = 297
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.3)
  doc.line(margin, pageH - 14, W - margin, pageH - 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text('PianoFinanziario — Strumento educativo, non consulenza finanziaria', margin, pageH - 9)
  doc.text('Pagina 1', W - margin, pageH - 9, { align: 'right' })

  return doc
}
