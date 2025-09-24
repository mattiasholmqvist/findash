/**
 * Swedish currency and date formatting components
 * Constitutional compliance: React functional component, TypeScript strict typing, kebab-case filename
 */

import { formatSwedishCurrency, formatSwedishDate } from '@/types/transaction-types'
import { BASClass, getBASClassName } from '@/types/bas-types'

interface CurrencyFormatterProps {
  amount: number // Amount in öre
  className?: string
  showSign?: boolean
  variant?: 'default' | 'compact' | 'accounting'
}

interface DateFormatterProps {
  date: string | Date
  format?: 'short' | 'long' | 'relative'
  className?: string
}

interface BASClassFormatterProps {
  basClass: BASClass
  showNumber?: boolean
  className?: string
}

interface AccountFormatterProps {
  accountNumber: string
  accountName: string
  showNumber?: boolean
  className?: string
  maxLength?: number
}

interface DebitCreditFormatterProps {
  type: 'DEBIT' | 'CREDIT'
  amount?: number
  className?: string
  variant?: 'text' | 'badge' | 'icon'
}

// Swedish currency formatter component
export const CurrencyFormatter = ({
  amount,
  className = '',
  showSign = false,
  variant = 'default'
}: CurrencyFormatterProps) => {
  const formatCurrency = (amountInOre: number): string => {
    switch (variant) {
      case 'compact':
        return formatSwedishCurrency(amountInOre, { compact: true })
      case 'accounting':
        return formatSwedishCurrency(amountInOre, { accounting: true })
      default:
        return formatSwedishCurrency(amountInOre)
    }
  }

  const formattedAmount = formatCurrency(amount)
  const displayAmount = showSign && amount > 0 ? `+${formattedAmount}` : formattedAmount
  const isNegative = amount < 0
  const isZero = amount === 0

  const variantClasses = {
    default: 'currency-formatter',
    compact: 'currency-formatter currency-formatter--compact',
    accounting: 'currency-formatter currency-formatter--accounting'
  }

  return (
    <span
      className={`${variantClasses[variant]} ${isNegative ? 'currency-formatter--negative' : ''} ${isZero ? 'currency-formatter--zero' : ''} ${className}`}
      title={`${(amount / 100).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} SEK`}
    >
      {displayAmount}
    </span>
  )
}

// Swedish date formatter component
export const DateFormatter = ({
  date,
  format = 'short',
  className = ''
}: DateFormatterProps) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return <span className={`date-formatter date-formatter--invalid ${className}`}>Ogiltigt datum</span>
  }

  const formatDate = (): string => {
    switch (format) {
      case 'long':
        return dateObj.toLocaleDateString('sv-SE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      case 'relative':
        return formatRelativeDate(dateObj)
      default:
        return formatSwedishDate(typeof date === 'string' ? date : date.toISOString().split('T')[0])
    }
  }

  const formatRelativeDate = (dateObj: Date): string => {
    const now = new Date()
    const diffTime = now.getTime() - dateObj.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Idag'
    if (diffDays === 1) return 'Igår'
    if (diffDays === -1) return 'Imorgon'
    if (diffDays < 7 && diffDays > 0) return `${diffDays} dagar sedan`
    if (diffDays > -7 && diffDays < 0) return `Om ${Math.abs(diffDays)} dagar`

    return formatSwedishDate(dateObj.toISOString().split('T')[0])
  }

  return (
    <time
      className={`date-formatter date-formatter--${format} ${className}`}
      dateTime={dateObj.toISOString()}
      title={dateObj.toLocaleDateString('sv-SE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    >
      {formatDate()}
    </time>
  )
}

// BAS class formatter component
export const BASClassFormatter = ({
  basClass,
  showNumber = true,
  className = ''
}: BASClassFormatterProps) => {
  const className_ = getBASClassName(basClass)

  return (
    <span className={`bas-class-formatter ${className}`} title={`BAS-klass ${basClass}: ${className_}`}>
      {showNumber && (
        <span className="bas-class-number">{basClass}</span>
      )}
      <span className="bas-class-name">{className_}</span>
    </span>
  )
}

// Account formatter component
export const AccountFormatter = ({
  accountNumber,
  accountName,
  showNumber = true,
  className = '',
  maxLength
}: AccountFormatterProps) => {
  const truncatedName = maxLength && accountName.length > maxLength
    ? `${accountName.substring(0, maxLength)}...`
    : accountName

  return (
    <span className={`account-formatter ${className}`} title={`${accountNumber} - ${accountName}`}>
      {showNumber && (
        <span className="account-number">{accountNumber}</span>
      )}
      <span className="account-name">{truncatedName}</span>
    </span>
  )
}

// Debit/Credit formatter component
export const DebitCreditFormatter = ({
  type,
  amount,
  className = '',
  variant = 'text'
}: DebitCreditFormatterProps) => {
  const isDebit = type === 'DEBIT'
  const typeText = isDebit ? 'Debet' : 'Kredit'
  const typeShort = isDebit ? 'Deb' : 'Kred'

  const renderIcon = () => (
    <svg className="debit-credit-icon" viewBox="0 0 12 12" fill="currentColor">
      {isDebit ? (
        <path d="M6 1L11 6H7v5H5V6H1l5-5z" />
      ) : (
        <path d="M6 11L1 6h4V1h2v5h4l-5 5z" />
      )}
    </svg>
  )

  const variantClasses = {
    text: 'debit-credit-formatter',
    badge: 'debit-credit-formatter debit-credit-badge',
    icon: 'debit-credit-formatter debit-credit-icon-only'
  }

  return (
    <span
      className={`${variantClasses[variant]} ${isDebit ? 'debit-credit--debit' : 'debit-credit--credit'} ${className}`}
      title={`${typeText}${amount ? `: ${formatSwedishCurrency(amount)}` : ''}`}
    >
      {variant === 'icon' ? (
        renderIcon()
      ) : variant === 'badge' ? (
        <>
          {renderIcon()}
          <span className="debit-credit-text">{typeShort}</span>
        </>
      ) : (
        <span className="debit-credit-text">{typeText}</span>
      )}
    </span>
  )
}

// VAT formatter component
export const VATFormatter = ({
  amount,
  rate,
  className = ''
}: {
  amount: number
  rate: number
  className?: string
}) => {
  return (
    <span className={`vat-formatter ${className}`} title={`Moms: ${rate}%`}>
      <span className="vat-amount">
        <CurrencyFormatter amount={amount} />
      </span>
      <span className="vat-rate">({rate}%)</span>
    </span>
  )
}

// Summary formatter for transaction lists
export const TransactionSummaryFormatter = ({
  totalAmount,
  debitTotal,
  creditTotal,
  transactionCount,
  className = ''
}: {
  totalAmount: number
  debitTotal: number
  creditTotal: number
  transactionCount: number
  className?: string
}) => {
  return (
    <div className={`transaction-summary-formatter ${className}`}>
      <div className="summary-item">
        <span className="summary-label">Antal transaktioner:</span>
        <span className="summary-value">{transactionCount.toLocaleString('sv-SE')}</span>
      </div>

      <div className="summary-item">
        <span className="summary-label">Totalt debet:</span>
        <span className="summary-value">
          <CurrencyFormatter amount={debitTotal} variant="accounting" />
        </span>
      </div>

      <div className="summary-item">
        <span className="summary-label">Totalt kredit:</span>
        <span className="summary-value">
          <CurrencyFormatter amount={creditTotal} variant="accounting" />
        </span>
      </div>

      <div className="summary-item summary-item--total">
        <span className="summary-label">Nettosaldo:</span>
        <span className="summary-value">
          <CurrencyFormatter
            amount={totalAmount}
            variant="accounting"
            showSign={true}
            className={totalAmount >= 0 ? 'positive-balance' : 'negative-balance'}
          />
        </span>
      </div>
    </div>
  )
}

// Percentage formatter
export const PercentageFormatter = ({
  value,
  decimals = 1,
  className = ''
}: {
  value: number
  decimals?: number
  className?: string
}) => {
  const formatted = (value * 100).toLocaleString('sv-SE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

  return (
    <span className={`percentage-formatter ${className}`}>
      {formatted}%
    </span>
  )
}

// Utility component for number formatting with Swedish locale
export const NumberFormatter = ({
  value,
  decimals,
  className = '',
  unit
}: {
  value: number
  decimals?: number
  className?: string
  unit?: string
}) => {
  const formatted = value.toLocaleString('sv-SE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

  return (
    <span className={`number-formatter ${className}`}>
      {formatted}
      {unit && <span className="number-unit">{unit}</span>}
    </span>
  )
}

// Export all formatters
export default {
  CurrencyFormatter,
  DateFormatter,
  BASClassFormatter,
  AccountFormatter,
  DebitCreditFormatter,
  VATFormatter,
  TransactionSummaryFormatter,
  PercentageFormatter,
  NumberFormatter
}