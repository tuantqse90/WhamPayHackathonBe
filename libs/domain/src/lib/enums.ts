export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum WalletType {
  MAIN = 'main',
  SUB = 'sub',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}