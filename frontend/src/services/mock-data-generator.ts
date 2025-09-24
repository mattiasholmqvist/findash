/**
 * Swedish mock data generator service
 * Constitutional compliance: TypeScript strict typing, kebab-case filename
 */

import { v4 as uuidv4 } from 'uuid'
import { Transaction } from '@/types/transaction-types'
import { Account } from '@/types/account-types'
import { User, UserRole, getDefaultTestUsers } from '@/types/user-types'
import { BASClass, SWEDISH_VAT_RATES, SwedishVATRate } from '@/types/bas-types'

export interface MockDataConfig {
  datasetSize: number
  dateRangeStart: Date
  dateRangeEnd: Date
  includeVAT: boolean
  seed?: number
}

export class SwedishMockDataGenerator {
  private config: MockDataConfig
  private random: () => number

  constructor(config: MockDataConfig) {
    this.config = config
    this.random = this.createSeededRandom(config.seed || 42)
  }

  private createSeededRandom(seed: number): () => number {
    let current = seed
    return () => {
      current = (current * 9301 + 49297) % 233280
      return current / 233280
    }
  }

  generateAccounts(): Account[] {
    const accounts: Account[] = []
    const baseAccounts = this.getSwedishBaseAccounts()

    baseAccounts.forEach((account, index) => {
      accounts.push({
        id: uuidv4(),
        accountNumber: account.accountNumber,
        name: account.name,
        nameEnglish: account.nameEnglish,
        basClass: account.basClass,
        basDescription: this.getBASDescription(account.basClass),
        isActive: true,
        createdAt: new Date('2024-01-01').toISOString()
      })
    })

    return accounts
  }

  generateTransactions(accounts: Account[]): Transaction[] {
    const transactions: Transaction[] = []

    for (let i = 0; i < this.config.datasetSize; i++) {
      const account = this.randomChoice(accounts)
      const transaction = this.generateTransaction(account)
      transactions.push(transaction)
    }

    // Sort by date (newest first)
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  private generateTransaction(account: Account): Transaction {
    const date = this.randomDateInRange()
    const amount = this.generateRealisticAmount(account.basClass)
    const description = this.generateSwedishDescription(account.basClass)
    const debitCredit = this.determineDebitCredit(account.basClass)

    let vatAmount: number | undefined
    let vatRate: SwedishVATRate | undefined

    if (this.config.includeVAT && this.shouldIncludeVAT(account.basClass)) {
      vatRate = this.randomChoice(SWEDISH_VAT_RATES.filter(rate => rate > 0))
      vatAmount = Math.round(amount * vatRate / 100)
    }

    return {
      id: uuidv4(),
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      description,
      amount,
      currency: 'SEK',
      accountId: account.id,
      account,
      basClass: account.basClass,
      accountNumber: account.accountNumber,
      debitCredit,
      vatAmount,
      vatRate,
      reference: this.generateReference(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  private randomDateInRange(): Date {
    const start = this.config.dateRangeStart.getTime()
    const end = this.config.dateRangeEnd.getTime()
    const randomTime = start + this.random() * (end - start)
    return new Date(randomTime)
  }

  private generateRealisticAmount(basClass: BASClass): number {
    // Generate amounts in öre (Swedish currency subdivision)
    let baseAmount: number

    switch (basClass) {
      case BASClass.ASSETS:
        baseAmount = 50000 + this.random() * 500000 // 500-5000 SEK
        break
      case BASClass.LIABILITIES:
        baseAmount = 10000 + this.random() * 200000 // 100-2000 SEK
        break
      case BASClass.EQUITY:
        baseAmount = 100000 + this.random() * 1000000 // 1000-10000 SEK
        break
      case BASClass.REVENUE:
        baseAmount = 5000 + this.random() * 100000 // 50-1000 SEK
        break
      case BASClass.COST_OF_SALES:
        baseAmount = 3000 + this.random() * 50000 // 30-500 SEK
        break
      case BASClass.OPERATING_EXPENSES:
        baseAmount = 1000 + this.random() * 25000 // 10-250 SEK
        break
      case BASClass.FINANCIAL_ITEMS:
        baseAmount = 500 + this.random() * 10000 // 5-100 SEK
        break
      case BASClass.EXTRAORDINARY_ITEMS:
        baseAmount = 10000 + this.random() * 500000 // 100-5000 SEK
        break
      default:
        baseAmount = 5000 + this.random() * 50000
    }

    return Math.round(baseAmount)
  }

  private generateSwedishDescription(basClass: BASClass): string {
    const descriptions = this.getSwedishDescriptions(basClass)
    const baseDescription = this.randomChoice(descriptions)
    const companies = this.getSwedishCompanies()
    const company = this.randomChoice(companies)

    return `${baseDescription} - ${company}`
  }

  private getSwedishDescriptions(basClass: BASClass): string[] {
    switch (basClass) {
      case BASClass.ASSETS:
        return [
          'Inköp av inventarier',
          'Datorutrustning',
          'Kontorsmöbler',
          'Fordon',
          'Maskiner och verktyg'
        ]
      case BASClass.LIABILITIES:
        return [
          'Leverantörsfaktura',
          'Hyra lokaler',
          'Lån från bank',
          'Kreditkort',
          'Skatteskuld'
        ]
      case BASClass.EQUITY:
        return [
          'Aktiekapital',
          'Kapitaltillskott',
          'Balanserat resultat',
          'Reservfond'
        ]
      case BASClass.REVENUE:
        return [
          'Försäljning av varor',
          'Konsulttjänster',
          'Licensintäkter',
          'Uthyrning',
          'Provisioner'
        ]
      case BASClass.COST_OF_SALES:
        return [
          'Inköp av råvaror',
          'Frakt och transport',
          'Produktionskostnader',
          'Varulager'
        ]
      case BASClass.OPERATING_EXPENSES:
        return [
          'Kontorshyra',
          'Telefon och internet',
          'Marknadsföring',
          'Försäkringar',
          'Revision och juridik',
          'Bankkostnader',
          'Kontorsmaterial'
        ]
      case BASClass.FINANCIAL_ITEMS:
        return [
          'Ränteintäkter',
          'Räntekostnader',
          'Valutakursvinst',
          'Valutakursförlust'
        ]
      case BASClass.EXTRAORDINARY_ITEMS:
        return [
          'Försäljning av anläggningstillgång',
          'Extraordinär kostnad',
          'Skadeersättning'
        ]
      default:
        return ['Diverse transaktion']
    }
  }

  private getSwedishCompanies(): string[] {
    return [
      'Svensk Handel AB',
      'Malmö Teknik HB',
      'Stockholm Konsult AB',
      'Göteborg Transport AB',
      'Nordic Services AB',
      'Scandinavian Solutions HB',
      'Uppsala Innovation AB',
      'Västerås Utveckling AB',
      'Örebro Business AB',
      'Linköping Tech HB',
      'Karlstad Handel AB',
      'Sundsvall Export AB',
      'Umeå Digital AB',
      'Luleå Logistik HB',
      'Kiruna Mining AB'
    ]
  }

  private determineDebitCredit(basClass: BASClass): 'DEBIT' | 'CREDIT' {
    // Swedish accounting principles for normal balances
    switch (basClass) {
      case BASClass.ASSETS:
      case BASClass.COST_OF_SALES:
      case BASClass.OPERATING_EXPENSES:
        return 'DEBIT'
      case BASClass.LIABILITIES:
      case BASClass.EQUITY:
      case BASClass.REVENUE:
        return 'CREDIT'
      case BASClass.FINANCIAL_ITEMS:
      case BASClass.EXTRAORDINARY_ITEMS:
        // Mix of debit and credit
        return this.random() < 0.5 ? 'DEBIT' : 'CREDIT'
      default:
        return 'DEBIT'
    }
  }

  private shouldIncludeVAT(basClass: BASClass): boolean {
    // VAT is typically included in revenue and some expense transactions
    switch (basClass) {
      case BASClass.REVENUE:
      case BASClass.OPERATING_EXPENSES:
        return this.random() < 0.8 // 80% chance of VAT
      case BASClass.COST_OF_SALES:
        return this.random() < 0.6 // 60% chance of VAT
      default:
        return false
    }
  }

  private generateReference(): string {
    const prefixes = ['INV', 'REF', 'ORD', 'PAY', 'TXN']
    const prefix = this.randomChoice(prefixes)
    const number = Math.floor(this.random() * 999999) + 100000
    const year = new Date().getFullYear()
    return `${prefix}-${year}-${number}`
  }

  private randomChoice<T>(array: T[]): T {
    const index = Math.floor(this.random() * array.length)
    return array[index]
  }

  private getBASDescription(basClass: BASClass): string {
    switch (basClass) {
      case BASClass.ASSETS:
        return 'Tillgångar'
      case BASClass.LIABILITIES:
        return 'Skulder'
      case BASClass.EQUITY:
        return 'Eget kapital'
      case BASClass.REVENUE:
        return 'Intäkter'
      case BASClass.COST_OF_SALES:
        return 'Kostnad för sålda varor'
      case BASClass.OPERATING_EXPENSES:
        return 'Rörelsekostnader'
      case BASClass.FINANCIAL_ITEMS:
        return 'Finansiella poster'
      case BASClass.EXTRAORDINARY_ITEMS:
        return 'Extraordinära poster'
      default:
        return 'Okänd'
    }
  }

  private getSwedishBaseAccounts(): Array<{
    accountNumber: string
    name: string
    nameEnglish: string
    basClass: BASClass
  }> {
    return [
      // Class 1 - Assets
      { accountNumber: '1220', name: 'Inventarier och verktyg', nameEnglish: 'Equipment and Tools', basClass: BASClass.ASSETS },
      { accountNumber: '1510', name: 'Kundfordringar', nameEnglish: 'Accounts Receivable', basClass: BASClass.ASSETS },
      { accountNumber: '1910', name: 'Kassa', nameEnglish: 'Cash', basClass: BASClass.ASSETS },
      { accountNumber: '1930', name: 'Företagskonto', nameEnglish: 'Business Account', basClass: BASClass.ASSETS },

      // Class 2 - Liabilities
      { accountNumber: '2440', name: 'Leverantörsskulder', nameEnglish: 'Accounts Payable', basClass: BASClass.LIABILITIES },
      { accountNumber: '2610', name: 'Utgående moms', nameEnglish: 'VAT Payable', basClass: BASClass.LIABILITIES },
      { accountNumber: '2640', name: 'Ingående moms', nameEnglish: 'VAT Receivable', basClass: BASClass.LIABILITIES },

      // Class 3 - Equity
      { accountNumber: '3000', name: 'Eget kapital', nameEnglish: 'Equity', basClass: BASClass.EQUITY },

      // Class 4 - Revenue
      { accountNumber: '3010', name: 'Försäljning varor', nameEnglish: 'Sales of Goods', basClass: BASClass.REVENUE },
      { accountNumber: '3040', name: 'Försäljning tjänster', nameEnglish: 'Sales of Services', basClass: BASClass.REVENUE },

      // Class 5 - Cost of Sales
      { accountNumber: '4010', name: 'Inköp varor', nameEnglish: 'Purchase of Goods', basClass: BASClass.COST_OF_SALES },

      // Class 6 - Operating Expenses
      { accountNumber: '6110', name: 'Kontorsmaterial', nameEnglish: 'Office Supplies', basClass: BASClass.OPERATING_EXPENSES },
      { accountNumber: '6210', name: 'Telefon', nameEnglish: 'Telephone', basClass: BASClass.OPERATING_EXPENSES },
      { accountNumber: '6570', name: 'Bankkostnader', nameEnglish: 'Bank Charges', basClass: BASClass.OPERATING_EXPENSES },

      // Class 7 - Financial Items
      { accountNumber: '8310', name: 'Ränteintäkter', nameEnglish: 'Interest Income', basClass: BASClass.FINANCIAL_ITEMS },
      { accountNumber: '8410', name: 'Räntekostnader', nameEnglish: 'Interest Expenses', basClass: BASClass.FINANCIAL_ITEMS },
    ]
  }

  generateUsers(): User[] {
    return getDefaultTestUsers()
  }
}