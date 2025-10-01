export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
  TRANSFER_721 = 'transfer_721',
  TRANSFER_1155 = 'transfer_1155',
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

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
}