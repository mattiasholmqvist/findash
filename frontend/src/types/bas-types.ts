/**
 * Swedish BAS (Baskontoplan) accounting system types
 * Constitutional compliance: TypeScript strict typing, kebab-case filename
 */

export enum BASClass {
  ASSETS = 1,                 // Tillgångar
  LIABILITIES = 2,           // Skulder
  EQUITY = 3,                // Eget kapital
  REVENUE = 4,               // Intäkter
  COST_OF_SALES = 5,         // Kostnad för sålda varor
  OPERATING_EXPENSES = 6,    // Rörelsekostnader
  FINANCIAL_ITEMS = 7,       // Finansiella poster
  EXTRAORDINARY_ITEMS = 8,   // Extraordinära poster
}

export interface BASClassInfo {
  readonly class: BASClass
  readonly swedishName: string
  readonly englishName: string
  readonly description: string
  readonly accountRange: {
    readonly min: number
    readonly max: number
  }
}

export const BAS_CLASS_INFO: Record<BASClass, BASClassInfo> = {
  [BASClass.ASSETS]: {
    class: BASClass.ASSETS,
    swedishName: 'Tillgångar',
    englishName: 'Assets',
    description: 'Tillgångar som företaget äger eller kontrollerar',
    accountRange: { min: 1000, max: 1999 }
  },
  [BASClass.LIABILITIES]: {
    class: BASClass.LIABILITIES,
    swedishName: 'Skulder',
    englishName: 'Liabilities',
    description: 'Skulder och förpliktelser',
    accountRange: { min: 2000, max: 2999 }
  },
  [BASClass.EQUITY]: {
    class: BASClass.EQUITY,
    swedishName: 'Eget kapital',
    englishName: 'Equity',
    description: 'Ägarnas kapital i företaget',
    accountRange: { min: 3000, max: 3999 }
  },
  [BASClass.REVENUE]: {
    class: BASClass.REVENUE,
    swedishName: 'Intäkter',
    englishName: 'Revenue',
    description: 'Intäkter från företagets verksamhet',
    accountRange: { min: 4000, max: 4999 }
  },
  [BASClass.COST_OF_SALES]: {
    class: BASClass.COST_OF_SALES,
    swedishName: 'Kostnad för sålda varor',
    englishName: 'Cost of Sales',
    description: 'Direkta kostnader för sålda varor och tjänster',
    accountRange: { min: 5000, max: 5999 }
  },
  [BASClass.OPERATING_EXPENSES]: {
    class: BASClass.OPERATING_EXPENSES,
    swedishName: 'Rörelsekostnader',
    englishName: 'Operating Expenses',
    description: 'Kostnader för den löpande verksamheten',
    accountRange: { min: 6000, max: 6999 }
  },
  [BASClass.FINANCIAL_ITEMS]: {
    class: BASClass.FINANCIAL_ITEMS,
    swedishName: 'Finansiella poster',
    englishName: 'Financial Items',
    description: 'Finansiella intäkter och kostnader',
    accountRange: { min: 7000, max: 7999 }
  },
  [BASClass.EXTRAORDINARY_ITEMS]: {
    class: BASClass.EXTRAORDINARY_ITEMS,
    swedishName: 'Extraordinära poster',
    englishName: 'Extraordinary Items',
    description: 'Extraordinära intäkter och kostnader',
    accountRange: { min: 8000, max: 8999 }
  }
}

export const SWEDISH_VAT_RATES = [0, 6, 12, 25] as const
export type SwedishVATRate = typeof SWEDISH_VAT_RATES[number]

export const isValidBASAccountNumber = (accountNumber: string, basClass: BASClass): boolean => {
  const num = parseInt(accountNumber, 10)
  if (isNaN(num) || accountNumber.length !== 4) {
    return false
  }

  const classInfo = BAS_CLASS_INFO[basClass]
  return num >= classInfo.accountRange.min && num <= classInfo.accountRange.max
}

export const getBASClassForAccountNumber = (accountNumber: string): BASClass | null => {
  const num = parseInt(accountNumber, 10)
  if (isNaN(num) || accountNumber.length !== 4) {
    return null
  }

  for (const [, info] of Object.entries(BAS_CLASS_INFO)) {
    if (num >= info.accountRange.min && num <= info.accountRange.max) {
      return info.class
    }
  }

  return null
}

// Get the Swedish name for a BAS class
export const getBASClassName = (basClass: BASClass): string => {
  return BAS_CLASS_INFO[basClass]?.swedishName || 'Okänd klass'
}