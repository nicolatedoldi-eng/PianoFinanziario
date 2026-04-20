import { jsPDF } from 'jspdf'
import { calculateProjection } from './finance'

// Palette
const C = {
  purple:      [83, 74, 183],    // #534AB7
  purpleLight: [238, 237, 254],  // #EEEDFE
  green:       [29, 158, 117],   // #1D9E75
  gray:        [107, 114, 128],  // #6B7280
  grayLight:   [248, 248, 248],  // #F8F8F8
  grayFoot:    [241, 241, 241],  // #F1F1F1
  dark:        [17, 24, 39],     // #111827
  border:      [229, 231, 235],  // #E5E7EB
  white:       [255, 255, 255],
  red:         [185, 28, 28],
  redLight:    [254, 242, 242],
  redBorder:   [254, 202, 202],
  amber:       [180, 120, 0],
  amberLight:  [255, 251, 235],
  amberBorder: [253, 230, 138],
}

const W = 210
const MARGIN = 16
const CW = W - MARGIN * 2
const PAGE_H = 297
const FOOTER_H = 14

function fmt(n) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n)
}
function fmtFull(n) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
  }).format(n)
}
function fmtK(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(Math.round(n))
}

export function generatePianoPDF(profile, dbProfile, params) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  // ── 1. HEADER BAND ───────────────────────────────────
  const HEADER_H = 18
  doc.setFillColor(...C.purple)
  doc.rect(0, 0, W, HEADER_H, 'F')

  doc.setFillColor(...C.white)
  doc.circle(MARGIN + 5, HEADER_H / 2, 4.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...C.purple)
  doc.text('P', MARGIN + 5, HEADER_H / 2 + 3, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...C.white)
  doc.text('PianoFinanziario', MARGIN + 12, HEADER_H / 2 - 1)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(200, 200, 240)
  doc.text('Piano di investimento personalizzato', MARGIN + 12, HEADER_H / 2 + 4.5)

  const today = new Date().toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.white)
  doc.text(`Generato il ${today}`, W - MARGIN, HEADER_H / 2 + 1.5, { align: 'right' })

  let y = HEADER_H + 8

  function sectionTitle(text) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...C.purple)
    doc.text(text, MARGIN, y)
    doc.setDrawColor(...C.purple)
    doc.setLineWidth(0.35)
    doc.line(MARGIN, y + 1.5, MARGIN + CW, y + 1.5)
    y += 6.5
  }

  function hRule(color = C.border, lw = 0.25) {
    doc.setDrawColor(...color)
    doc.setLineWidth(lw)
    doc.line(MARGIN, y, MARGIN + CW, y)
  }

  // ── 2. PROFILO BOX ──────────────────────────────────
  sectionTitle('1. Il tuo profilo')

  const BOX_H = 20
  doc.setFillColor(...C.purpleLight)
  doc.setDrawColor(...C.purple)
  doc.setLineWidth(0.3)
  doc.roundedRect(MARGIN, y, CW, BOX_H, 3, 3, 'FD')

  const cells = [
    { label: 'Profilo', value: profile.name },
    { label: 'Capitale iniziale', value: fmt(params.initialCapital) },
    { label: 'PAC mensile', value: fmt(params.monthlyPayment) },
    { label: 'Orizzonte', value: `${params.horizon} anni` },
  ]
  const cellW = CW / 4
  cells.forEach((cell, i) => {
    const cx = MARGIN + i * cellW
    if (i > 0) {
      doc.setDrawColor(...C.purple)
      doc.setLineWidth(0.25)
      doc.line(cx, y + 3, cx, y + BOX_H - 3)
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...C.purple)
    doc.text(cell.label, cx + cellW / 2, y + 6.5, { align: 'center' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...C.purple)
    doc.text(cell.value, cx + cellW / 2, y + 14.5, { align: 'center' })
  })
  y += BOX_H + 8

  // ── 3. PROIEZIONE ───────────────────────────────────────────────────────
  sectionTitle('2. Proiezione finanziaria (scenario base)')

  const result = calculateProjection(
    params.initialCapital,
    params.monthlyPayment,
    profile.expectedReturn,
    params.horizon,
    params.annualGrowth,
  )

  hRule(C.border, 0.25)
  y += 3
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.gray)
  doc.text('Capitale finale stimato', MARGIN, y + 1)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...C.green)
  doc.text(fmt(result.finalCapital), MARGIN + CW / 2, y + 10, { align: 'center' })
  y += 14
  hRule(C.border, 0.25)
  y += 5

  const statW = (CW - 4) / 3
  const statCards = [
    { label: 'Totale versato', value: fmt(result.totalDeposited), color: C.dark },
    { label: 'Interessi guadagnati', value: fmt(result.totalInterest), color: C.green },
    { label: 'Rendita mensile (regola 4%)', value: fmt(result.monthlyIncome), color: [239, 159, 39] },
  ]
  statCards.forEach((sc, i) => {
    const sx = MARGIN + i * (statW + 2)
    doc.setFillColor(249, 250, 251)
    doc.setDrawColor(...C.border)
    doc.setLineWidth(0.25)
    doc.roundedRect(sx, y, statW, 16, 2, 2, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...C.gray)
    doc.text(sc.label, sx + statW / 2, y + 5, { align: 'center' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...sc.color)
    doc.text(sc.value, sx + statW / 2, y + 12, { align: 'center' })
  })
  y += 20

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7)
  doc.setTextColor(...C.gray)
  doc.text(
    `Ipotesi: rendimento annuo ${profile.expectedReturn}%, crescita PAC ${params.annualGrowth}% annuo, orizzonte ${params.horizon} anni.`,
    MARGIN, y,
  )
  y += 8

  // ── 4. MINI RIEPILOGO CRESCITA ──────────────────────────────────────────
  const multiplier = result.totalDeposited > 0
    ? (result.finalCapital / result.totalDeposited).toFixed(1)
    : '-'
  // ASCII arrow: jsPDF built-in Helvetica (Windows-1252) does not support U+2192
  const summaryLine = `In ${params.horizon} anni: versati EUR ${fmtK(result.totalDeposited)} -> accumulati EUR ${fmtK(result.finalCapital)} (x${multiplier} il capitale investito)`
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  const summaryLines = doc.splitTextToSize(summaryLine, CW - 6)
  const summaryBoxH = summaryLines.length * 5.5 + 5
  doc.setFillColor(...C.purpleLight)
  doc.roundedRect(MARGIN, y, CW, summaryBoxH, 2, 2, 'F')
  doc.setTextColor(...C.green)
  summaryLines.forEach((line, i) => {
    doc.text(line, MARGIN + CW / 2, y + 6 + i * 5.5, { align: 'center' })
  })
  y += summaryBoxH + 5

  // ── 5. TABELLA ETF ───────────────────────────────────────────────────────────────────────
  sectionTitle('3. Portafoglio ETF consigliato')

  const cols = [
    { label: 'Ticker',    x: MARGIN,       w: 17 },
    { label: 'Strumento', x: MARGIN + 17,  w: 66 },
    { label: 'ISIN',      x: MARGIN + 83,  w: 34 },
    { label: '%',         x: MARGIN + 117, w: 12 },
    { label: 'Importo',   x: MARGIN + 129, w: 27 },
    { label: 'PAC/mese',  x: MARGIN + 156, w: 22 },
  ]

  doc.setFillColor(...C.purple)
  doc.rect(MARGIN, y, CW, 6.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.white)
  cols.forEach(c => doc.text(c.label, c.x + 1.5, y + 4.5))
  y += 6.5

  profile.etfs.forEach((etf, idx) => {
    const rowH = 13
    doc.setFillColor(...(idx % 2 === 0 ? C.grayLight : C.white))
    doc.rect(MARGIN, y, CW, rowH, 'F')
    doc.setDrawColor(...C.border)
    doc.setLineWidth(0.2)
    doc.rect(MARGIN, y, CW, rowH, 'D')

    doc.setFillColor(...C.purpleLight)
    doc.roundedRect(cols[0].x + 1, y + 2.5, 14, 7, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...C.purple)
    doc.text(etf.ticker, cols[0].x + 8, y + 7.5, { align: 'center' })

    const nameLines = doc.splitTextToSize(etf.name, cols[1].w - 3)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...C.dark)
    doc.text(nameLines[0], cols[1].x + 1.5, y + 5.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...C.gray)
    doc.text(etf.description || '', cols[1].x + 1.5, y + 10.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...C.gray)
    doc.text(etf.isin, cols[2].x + 1.5, y + 7)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...C.purple)
    doc.text(`${etf.percentage}%`, cols[3].x + 1.5, y + 7)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...C.dark)
    doc.text(fmt(params.initialCapital * etf.percentage / 100), cols[4].x + 1.5, y + 7)
    doc.text(fmtFull(params.monthlyPayment * etf.percentage / 100), cols[5].x + 1.5, y + 7)

    y += rowH
  })
  y += 8

  // ── 6. RIBILANCIAMENTO ────────────────────────────────────────────────────────
  sectionTitle('4. Regola di ribilanciamento')

  const ruleLines = doc.splitTextToSize(profile.rebalanceRule, CW - 10)
  const ruleH = ruleLines.length * 4.5 + 9
  doc.setFillColor(...C.amberLight)
  doc.setDrawColor(...C.amberBorder)
  doc.setLineWidth(0.35)
  doc.roundedRect(MARGIN, y, CW, ruleH, 3, 3, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...C.amber)
  doc.text('!', MARGIN + 4, y + ruleH / 2 + 2)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(120, 80, 0)
  doc.text(ruleLines, MARGIN + 10, y + 6.5)
  y += ruleH + 4

  doc.setFillColor(...C.purpleLight)
  doc.roundedRect(MARGIN, y, 64, 7, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.purple)
  doc.text(`Frequenza controllo: ${profile.rebalanceFrequency}`, MARGIN + 4, y + 4.8)
  y += 13

  // ── 7. DISCLAIMER ────────────────────────────────────────────────────────
  if (y > PAGE_H - FOOTER_H - 28) { doc.addPage(); y = 16 }

  const disclaimer = 'Questo documento è generato automaticamente a scopo informativo e non costituisce consulenza finanziaria. Gli investimenti comportano rischi. Rendimenti passati non garantiscono risultati futuri.'
  const discLines = doc.splitTextToSize(disclaimer, CW - 10)
  const discH = discLines.length * 4.5 + 11
  doc.setFillColor(...C.redLight)
  doc.setDrawColor(...C.redBorder)
  doc.setLineWidth(0.3)
  doc.roundedRect(MARGIN, y, CW, discH, 3, 3, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.red)
  doc.text('Avviso legale', MARGIN + 4, y + 6.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(127, 29, 29)
  doc.text(discLines, MARGIN + 4, y + 12)

  // ── 8. FOOTER BAND ────────────────────────────────────────────────────────
  doc.setFillColor(...C.grayFoot)
  doc.rect(0, PAGE_H - FOOTER_H, W, FOOTER_H, 'F')
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.25)
  doc.line(0, PAGE_H - FOOTER_H, W, PAGE_H - FOOTER_H)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...C.gray)
  doc.text(
    'Strumento educativo - non costituisce consulenza finanziaria',
    W / 2, PAGE_H - FOOTER_H + 5.5, { align: 'center' },
  )
  doc.text(
    'I rendimenti passati non garantiscono quelli futuri.',
    W / 2, PAGE_H - FOOTER_H + 10, { align: 'center' },
  )
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.purple)
  doc.text('PianoFinanziario.it', W - MARGIN, PAGE_H - FOOTER_H + 7.5, { align: 'right' })

  return doc
}
