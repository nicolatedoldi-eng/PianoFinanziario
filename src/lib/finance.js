// Calcoli finanziari per il simulatore

/**
 * Calcola il capitale finale con contributi mensili e interesse composto
 * @param {number} initialCapital - Capitale iniziale in €
 * @param {number} monthlyPayment - Versamento mensile in €
 * @param {number} annualReturn - Rendimento annuo in percentuale (es. 7.5)
 * @param {number} years - Anni di investimento
 * @param {number} annualPaymentGrowth - Crescita annua del versamento in % (default 3)
 * @returns {object} Risultati del calcolo
 */
export function calculateProjection(
  initialCapital,
  monthlyPayment,
  annualReturn,
  years,
  annualPaymentGrowth = 3
) {
  const monthlyRate = annualReturn / 100 / 12
  const months = years * 12
  const monthlyGrowthRate = annualPaymentGrowth / 100 / 12

  let capital = initialCapital
  let totalDeposited = initialCapital
  let currentMonthlyPayment = monthlyPayment
  const dataPoints = []

  // Punto iniziale
  dataPoints.push({
    month: 0,
    year: 0,
    capital: Math.round(initialCapital),
    deposited: Math.round(initialCapital),
    interest: 0,
  })

  for (let m = 1; m <= months; m++) {
    // Applica rendimento mensile
    capital = capital * (1 + monthlyRate) + currentMonthlyPayment
    totalDeposited += currentMonthlyPayment

    // Aumenta il versamento mensile ogni anno
    if (m % 12 === 0) {
      currentMonthlyPayment *= 1 + annualPaymentGrowth / 100
    }

    // Salva punto dati ogni anno
    if (m % 12 === 0 || m === months) {
      dataPoints.push({
        month: m,
        year: Math.round(m / 12),
        capital: Math.round(capital),
        deposited: Math.round(totalDeposited),
        interest: Math.round(capital - totalDeposited),
      })
    }
  }

  const finalCapital = Math.round(capital)
  const totalDepositedFinal = Math.round(totalDeposited)
  const totalInterest = finalCapital - totalDepositedFinal
  const monthlyIncome = Math.round((finalCapital * 0.04) / 12) // Regola 4%

  return {
    finalCapital,
    totalDeposited: totalDepositedFinal,
    totalInterest,
    monthlyIncome,
    dataPoints,
    multiplier: totalDepositedFinal > 0 ? (finalCapital / totalDepositedFinal).toFixed(1) : 0,
  }
}

/**
 * Calcola i 3 scenari (ottimista, base, ribassista)
 */
export function calculateScenarios(initialCapital, monthlyPayment, baseReturn, years, annualGrowth = 3) {
  const optimistic = calculateProjection(initialCapital, monthlyPayment, baseReturn + 2, years, annualGrowth)
  const base = calculateProjection(initialCapital, monthlyPayment, baseReturn, years, annualGrowth)
  const pessimistic = calculateProjection(initialCapital, monthlyPayment, baseReturn - 2, years, annualGrowth)

  return { optimistic, base, pessimistic }
}

/**
 * Calcola le milestone (quando si raggiunge ogni soglia)
 */
export function calculateMilestones(initialCapital, monthlyPayment, annualReturn, years, annualGrowth = 3) {
  const targets = [10000, 25000, 50000, 100000, 250000, 500000, 1000000]
  const monthlyRate = annualReturn / 100 / 12
  const milestones = []

  let capital = initialCapital
  let currentMonthlyPayment = monthlyPayment
  let targetIndex = targets.findIndex(t => t > initialCapital)

  for (let m = 1; m <= years * 12; m++) {
    capital = capital * (1 + monthlyRate) + currentMonthlyPayment

    if (m % 12 === 0) {
      currentMonthlyPayment *= 1 + annualGrowth / 100
    }

    while (targetIndex < targets.length && capital >= targets[targetIndex]) {
      milestones.push({
        amount: targets[targetIndex],
        month: m,
        year: Math.floor(m / 12),
        monthInYear: m % 12,
      })
      targetIndex++
    }
  }

  // Aggiungi milestone non raggiunte
  while (targetIndex < targets.length) {
    milestones.push({
      amount: targets[targetIndex],
      month: null,
      year: null,
      monthInYear: null,
    })
    targetIndex++
  }

  return milestones
}

/**
 * Formatta un numero in euro
 */
export function formatEuro(amount) {
  if (amount >= 1000000) {
    return `€${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `€${(amount / 1000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

/**
 * Formatta un numero in euro con decimali
 */
export function formatEuroFull(amount) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(amount)
}

/**
 * Genera insight testuale basato sul moltiplicatore
 */
export function generateInsight(multiplier, years) {
  return `In ${years} anni il tuo capitale si moltiplica per ${multiplier}x rispetto a quanto hai versato.`
}
