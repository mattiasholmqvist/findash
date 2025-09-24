/**
 * Account entity types with Swedish BAS compliance
 * Constitutional compliance: TypeScript strict typing, kebab-case filename
 */

import { BASClass, BAS_CLASS_INFO, isValidBASAccountNumber } from './bas-types'

export interface Account {
  readonly id: string // UUID format
  readonly accountNumber: string // 4-digit BAS account number
  readonly name: string // Account name in Swedish
  readonly nameEnglish: string // Account name in English for documentation
  readonly basClass: BASClass // BAS class (1-8)
  readonly basDescription: string // BAS class description in Swedish
  readonly parentAccountId?: string // Parent account for hierarchy (optional)
  readonly isActive: boolean // Account status
  readonly createdAt: string // ISO 8601 timestamp
}

export interface AccountCreateRequest {
  readonly accountNumber: string
  readonly name: string
  readonly nameEnglish: string
  readonly basClass: BASClass
  readonly parentAccountId?: string
  readonly isActive?: boolean
}

export interface AccountFilter {
  readonly basClass?: BASClass
  readonly active?: boolean
  readonly searchText?: string
  readonly parentAccountId?: string
}

export interface AccountListResponse {
  readonly accounts: Account[]
  readonly totalCount: number
}

export interface AccountHierarchy extends Account {
  readonly children: AccountHierarchy[]
  readonly level: number
}

// Validation functions
export const validateAccount = (account: Partial<Account>): string[] => {
  const errors: string[] = []

  if (!account.id || !isValidUUID(account.id)) {
    errors.push('ID must be a valid UUID')
  }

  if (!account.accountNumber || !/^\d{4}$/.test(account.accountNumber)) {
    errors.push('Account number must be exactly 4 digits')
  }

  if (!account.name || account.name.length < 1 || account.name.length > 100) {
    errors.push('Swedish name must be 1-100 characters')
  }

  if (!account.nameEnglish || account.nameEnglish.length < 1 || account.nameEnglish.length > 100) {
    errors.push('English name must be 1-100 characters')
  }

  if (!account.basClass || account.basClass < 1 || account.basClass > 8) {
    errors.push('BAS class must be between 1 and 8')
  }

  if (account.accountNumber && account.basClass && !isValidBASAccountNumber(account.accountNumber, account.basClass)) {
    const classInfo = BAS_CLASS_INFO[account.basClass]
    errors.push(`Account number ${account.accountNumber} is not valid for BAS class ${account.basClass} (${classInfo.swedishName}). Expected range: ${classInfo.accountRange.min}-${classInfo.accountRange.max}`)
  }

  if (!account.basDescription || account.basDescription.length < 1) {
    errors.push('BAS description is required')
  }

  if (account.parentAccountId && !isValidUUID(account.parentAccountId)) {
    errors.push('Parent account ID must be a valid UUID if provided')
  }

  if (typeof account.isActive !== 'boolean') {
    errors.push('Active status must be a boolean')
  }

  return errors
}

const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Account hierarchy utilities
export const buildAccountHierarchy = (accounts: Account[]): AccountHierarchy[] => {
  const accountMap = new Map<string, AccountHierarchy>()
  const rootAccounts: AccountHierarchy[] = []

  // Initialize all accounts with empty children arrays
  accounts.forEach(account => {
    accountMap.set(account.id, {
      ...account,
      children: [],
      level: 0
    })
  })

  // Build hierarchy
  accounts.forEach(account => {
    const hierarchyAccount = accountMap.get(account.id)
    if (!hierarchyAccount) return

    if (account.parentAccountId) {
      const parent = accountMap.get(account.parentAccountId)
      if (parent) {
        hierarchyAccount.level = parent.level + 1
        parent.children.push(hierarchyAccount)
      } else {
        // Parent not found, treat as root
        rootAccounts.push(hierarchyAccount)
      }
    } else {
      rootAccounts.push(hierarchyAccount)
    }
  })

  return rootAccounts.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber))
}

// Swedish BAS account utilities
export const getStandardBASAccounts = (): Partial<AccountCreateRequest>[] => {
  return [
    // Class 1 - Assets (Tillgångar)
    { accountNumber: '1010', name: 'Utvecklingsutgifter', nameEnglish: 'Development Costs', basClass: BASClass.ASSETS },
    { accountNumber: '1030', name: 'Koncessioner, patent, licenser', nameEnglish: 'Concessions, Patents, Licenses', basClass: BASClass.ASSETS },
    { accountNumber: '1220', name: 'Inventarier och verktyg', nameEnglish: 'Equipment and Tools', basClass: BASClass.ASSETS },
    { accountNumber: '1510', name: 'Kundfordringar', nameEnglish: 'Accounts Receivable', basClass: BASClass.ASSETS },
    { accountNumber: '1910', name: 'Kassa', nameEnglish: 'Cash', basClass: BASClass.ASSETS },
    { accountNumber: '1930', name: 'Företagskonto/checkkonto', nameEnglish: 'Business Account/Checking Account', basClass: BASClass.ASSETS },

    // Class 2 - Liabilities (Skulder)
    { accountNumber: '2010', name: 'Aktiekapital', nameEnglish: 'Share Capital', basClass: BASClass.LIABILITIES },
    { accountNumber: '2440', name: 'Leverantörsskulder', nameEnglish: 'Accounts Payable', basClass: BASClass.LIABILITIES },
    { accountNumber: '2610', name: 'Utgående moms', nameEnglish: 'VAT Payable', basClass: BASClass.LIABILITIES },
    { accountNumber: '2640', name: 'Ingående moms', nameEnglish: 'VAT Receivable', basClass: BASClass.LIABILITIES },

    // Class 3 - Equity (Eget kapital)
    { accountNumber: '3000', name: 'Eget kapital', nameEnglish: 'Equity', basClass: BASClass.EQUITY },

    // Class 4 - Revenue (Intäkter)
    { accountNumber: '3010', name: 'Försäljning varor', nameEnglish: 'Sales of Goods', basClass: BASClass.REVENUE },
    { accountNumber: '3040', name: 'Försäljning tjänster', nameEnglish: 'Sales of Services', basClass: BASClass.REVENUE },

    // Class 5 - Cost of Sales (Kostnad för sålda varor)
    { accountNumber: '4010', name: 'Inköp varor', nameEnglish: 'Purchase of Goods', basClass: BASClass.COST_OF_SALES },

    // Class 6 - Operating Expenses (Rörelsekostnader)
    { accountNumber: '5010', name: 'Lokalkostnader', nameEnglish: 'Premises Costs', basClass: BASClass.OPERATING_EXPENSES },
    { accountNumber: '6110', name: 'Kontorsmaterial', nameEnglish: 'Office Supplies', basClass: BASClass.OPERATING_EXPENSES },
    { accountNumber: '6570', name: 'Bankkostnader', nameEnglish: 'Bank Charges', basClass: BASClass.OPERATING_EXPENSES },

    // Class 7 - Financial Items (Finansiella poster)
    { accountNumber: '8310', name: 'Ränteintäkter', nameEnglish: 'Interest Income', basClass: BASClass.FINANCIAL_ITEMS },
    { accountNumber: '8410', name: 'Räntekostnader', nameEnglish: 'Interest Expenses', basClass: BASClass.FINANCIAL_ITEMS },
  ]
}