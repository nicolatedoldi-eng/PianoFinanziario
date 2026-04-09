// Calcoli finanziari per il simulatore

/**
 * Calcola il capitale finale con contributi mensili e interesse composto
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

  let capital = initialCapital
  let totalDeposited = initialCapital
  let currentMonthlyPayment = monthlyPayment
  const dataPoints = []

  dataPoints.push({
    month: 0,
    year: 0,
    capital: Math.round(initialCapital),
    deposited: Math.round(initialCapital),
    interest: 0,
  })

  for (let m = 1; m <= months; m++) {
    capital = capital * (1 + monthlyRate) + currentMonthlyPayment
    totalDeposited += currentMonthlyPayment

    if (m % 12 === 0) {
      currentMonthlyPayment *= 1 + annualPaymentGrowth / 100
    }

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
  const monthlyIncome = Math.round((finalCapital * 0.04) / 12)

  return {
    finalCapital,
    totalDeposited: totalDepositedFinal,
    totalInterest,
    monthlyIncome,
    dataPoints,
    multiplier: initialCapital > 0 ? (finalCapital / initialCapital).toFixed(1) : 0,
  }
}

export function calculateScenarios(initialCapital, monthlyPayment, baseReturn, years, annualGrowth = 3) {
  const optimistic = calculateProjection(initialCapital, monthlyPayment, baseReturn + 2, years, annualGrowth)
  const base = calculateProjection(initialCapital, monthlyPayment, baseReturn, years, annualGrowth)
  const pessimistic = calculateProjection(initialCapital, monthlyPayment, baseReturn - 2, years, annualGrowth)

  return { optimistic, base, pessimistic }
}

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

export function formatEuro(amount) {
  if (amount >= 1000000) {
    return `€${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `€${(amount / 1000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

export function formatEuroFull(amount) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(amount)
}

export function generateInsight(multiplier, years) {
  if (multiplier >= 10) {
    return `Straordinario! In ${years} anni il tuo capitale si moltiplica per ${multiplier}x. La potenza dell'interesse composto fa il lavoro pesante al posto tuo.`
  }
  if (multiplier >= 5) {
    return `Ottimo risultato! In ${years} anni trasformi ogni euro in ${multiplier}. La costanza dei versamenti mensili fa la differenza.`
  }
  if (multiplier >= 3) {
    return `In ${years} anni il tuo capitale triplica. L'interesse composto inizia a lavorare in modo significativo nella seconda metà del periodo.`
  }
  if (multiplier >= 2) {
    return `In ${years} anni il tuo capitale raddoppia. Considera di aumentare i versamenti o allungare l'orizzonte per accelerare la crescita.`
  }
  return `Con orizzonte breve, la crescita è limitata. I primi anni servono a costruire le fondamenta: continua con costanza.`
}
