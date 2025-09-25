# Data Model: Frontend MVP - Transaction Viewer

## Domain Entities

### Transaction
Represents individual accounting entries in the Swedish BAS system.

**Fields**:
- `id`: string (unique identifier, UUID format)
- `date`: Date (transaction date, YYYY-MM-DD format)
- `description`: string (transaction description, max 200 characters)
- `amount`: number (transaction amount in öre, Swedish currency subdivision)
- `currency`: string (always 'SEK' for Swedish Kronor)
- `accountId`: string (reference to Account entity)
- `basClass`: BASClass (Swedish BAS account class 1-8)
- `accountNumber`: string (Swedish BAS account number, 4 digits)
- `debitCredit`: 'DEBIT' | 'CREDIT' (transaction type)
- `vatAmount`: number (VAT amount in öre, optional)
- `vatRate`: number (VAT rate percentage, optional)
- `reference`: string (transaction reference/invoice number, optional)
- `createdAt`: Date (record creation timestamp)
- `updatedAt`: Date (last modification timestamp)

**Validation Rules**:
- `id`: Must be valid UUID format
- `date`: Must be valid date, not future date
- `description`: Required, 1-200 characters, no HTML
- `amount`: Required, integer (öre), can be negative
- `currency`: Must be 'SEK'
- `accountId`: Must reference existing Account
- `basClass`: Must be valid BAS class (1-8)
- `accountNumber`: Must match BAS account number format (4 digits)
- `debitCredit`: Required, must be 'DEBIT' or 'CREDIT'
- `vatAmount`: Optional, non-negative integer if present
- `vatRate`: Optional, 0-25% if vatAmount present
- `reference`: Optional, max 50 characters

**State Transitions**: None (read-only in MVP)

### Account
Represents Swedish BAS chart of accounts structure.

**Fields**:
- `id`: string (unique identifier, UUID format)
- `accountNumber`: string (4-digit BAS account number)
- `name`: string (account name in Swedish)
- `nameEnglish`: string (account name in English for documentation)
- `basClass`: BASClass (BAS class 1-8)
- `basDescription`: string (BAS class description in Swedish)
- `parentAccountId`: string (parent account for sub-accounts, optional)
- `isActive`: boolean (account status)
- `createdAt`: Date (record creation timestamp)

**Validation Rules**:
- `id`: Must be valid UUID format
- `accountNumber`: Required, exactly 4 digits, unique
- `name`: Required, 1-100 characters Swedish text
- `nameEnglish`: Required, 1-100 characters English text
- `basClass`: Must be valid BAS class (1-8)
- `basDescription`: Required Swedish BAS description
- `parentAccountId`: Must reference existing Account if present
- `isActive`: Required boolean
- Account number must match BAS class ranges:
  - Class 1 (Assets): 1000-1999
  - Class 2 (Liabilities): 2000-2999
  - Class 3 (Equity): 3000-3999
  - Class 4 (Revenue): 4000-4999
  - Class 5 (Cost of Sales): 5000-5999
  - Class 6 (Operating Expenses): 6000-6999
  - Class 7 (Financial Income/Costs): 7000-7999
  - Class 8 (Extraordinary Items): 8000-8999

**Relationships**:
- One-to-many with Transaction (one Account has many Transactions)
- Self-referencing for parent-child account hierarchy

### User
Represents authenticated users with access to transaction data.

**Fields**:
- `id`: string (unique identifier, UUID format)
- `username`: string (unique username for login)
- `email`: string (user email address)
- `firstName`: string (user first name)
- `lastName`: string (user last name)
- `role`: UserRole ('VIEWER' | 'ACCOUNTANT' | 'CONTROLLER')
- `isActive`: boolean (account status)
- `lastLoginAt`: Date (last successful login timestamp)
- `createdAt`: Date (account creation timestamp)

**Validation Rules**:
- `id`: Must be valid UUID format
- `username`: Required, 3-30 characters, alphanumeric + underscore
- `email`: Required, valid email format
- `firstName`: Required, 1-50 characters, letters only
- `lastName`: Required, 1-50 characters, letters only
- `role`: Required, must be valid UserRole
- `isActive`: Required boolean

**State Transitions**:
- Active ↔ Inactive (account activation/deactivation)
- Role changes (permission updates)

### MockDataService
Provides configurable mock data generation for demonstration.

**Fields**:
- `datasetSize`: number (number of transactions to generate)
- `dateRange`: DateRange (start and end dates for transaction generation)
- `includeVAT`: boolean (whether to include VAT transactions)
- `companyTypes`: string[] (types of Swedish companies to simulate)
- `seed`: number (random seed for consistent data generation)

**Methods**:
- `generateTransactions(size: number): Transaction[]`
- `generateAccounts(): Account[]`
- `generateUsers(): User[]`
- `configureDateRange(start: Date, end: Date): void`
- `setDatasetSize(size: number): void`

## Type Definitions

### BASClass Enumeration
```typescript
enum BASClass {
  ASSETS = 1,           // Tillgångar
  LIABILITIES = 2,      // Skulder
  EQUITY = 3,           // Eget kapital
  REVENUE = 4,          // Intäkter
  COST_OF_SALES = 5,    // Kostnad för sålda varor
  OPERATING_EXPENSES = 6, // Rörelsekostnader
  FINANCIAL_ITEMS = 7,   // Finansiella poster
  EXTRAORDINARY_ITEMS = 8 // Extraordinära poster
}
```

### UserRole Enumeration
```typescript
enum UserRole {
  VIEWER = 'VIEWER',         // Read-only access
  ACCOUNTANT = 'ACCOUNTANT', // Full accounting access
  CONTROLLER = 'CONTROLLER'  // Management oversight access
}
```

### DateRange Interface
```typescript
interface DateRange {
  startDate: Date;
  endDate: Date;
}
```

### TransactionFilter Interface
```typescript
interface TransactionFilter {
  dateFrom?: Date;
  dateTo?: Date;
  basClass?: BASClass;
  accountId?: string;
  minAmount?: number;
  maxAmount?: number;
  searchText?: string;
  debitCredit?: 'DEBIT' | 'CREDIT';
}
```

## Data Relationships

### Primary Relationships
1. **Transaction → Account**: Many-to-one relationship
   - Each transaction references exactly one account
   - Each account can have multiple transactions
   - Foreign key: `Transaction.accountId → Account.id`

2. **Account → Account**: Self-referencing hierarchy
   - Parent-child relationships for sub-accounts
   - Optional relationship: `Account.parentAccountId → Account.id`

3. **User → Session**: One-to-one for authentication
   - Each user has one active session
   - Session contains user authentication state

### Data Integrity Rules
1. **Referential Integrity**:
   - All `Transaction.accountId` must reference valid `Account.id`
   - All `Account.parentAccountId` must reference valid `Account.id`
   - No circular references in account hierarchy

2. **Business Rules**:
   - Transaction amounts in öre (integer values)
   - Account numbers must match BAS class ranges
   - VAT rates must be valid Swedish VAT percentages (0%, 6%, 12%, 25%)
   - Transaction dates cannot be in the future
   - Debit/Credit rules follow Swedish accounting principles

3. **Data Consistency**:
   - Currency is always 'SEK' for Swedish implementation
   - Date formats follow Swedish standard (YYYY-MM-DD)
   - Account names use proper Swedish accounting terminology
   - BAS class assignments follow Swedish accounting standards

## Mock Data Specifications

### Swedish Company Examples
- AB Svensk Handel (Trading company)
- Malmö Teknik AB (Technology company)
- Stockholm Konsult HB (Consulting partnership)
- Göteborg Transport AB (Transportation company)

### Common Transaction Scenarios
1. **Revenue Transactions** (BAS Class 4):
   - Customer invoices
   - Service revenue
   - Product sales

2. **Expense Transactions** (BAS Class 6):
   - Office supplies
   - Rent payments
   - Utility bills
   - Staff salaries

3. **Asset Transactions** (BAS Class 1):
   - Equipment purchases
   - Bank transfers
   - Cash transactions

4. **VAT Scenarios**:
   - 25% VAT on standard goods/services
   - 12% VAT on food and hotels
   - 6% VAT on books, newspapers, transport
   - 0% VAT on exports

### Data Generation Rules
- Transaction dates: Random distribution over last 12 months
- Amount ranges: 100 SEK to 50,000 SEK for realistic business scenarios
- Description patterns: Swedish business terminology
- Account distribution: Weighted by typical business transaction patterns
- VAT inclusion: 80% of transactions include VAT calculations