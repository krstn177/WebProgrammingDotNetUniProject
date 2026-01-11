export type AdminListTransaction = {
    id: string,
    amount: number,
    description: string,
    type: string,
    createdAt?: Date,
    fromAccountId?: string,
    toAccountId?: string
}

export type Transaction = {
    id: string,
    amount: number,
    description: string,
    type: string,
    createdAt?: Date,
    fromUserName?: string,
    toUserName?: string
}

export type DepositWithdrawalRequest = {
    debitCardId: string,
    pin: string,
    amount: number,
    description: string
}

export type TransferRequest = {
  senderBankAccountId: string,
  receiverIban: string,
  amount: number,
  description: string
}
