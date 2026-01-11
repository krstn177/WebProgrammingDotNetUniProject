export type Loan = {
    id: string,
    principal: number,
    remainingAmount: number,
    interestRate: number,
    termInMonths: number,
    startDate: Date,
    NextInterestUpdate: Date,
    status: string,
    borrowerAccountId: string,
    bankLenderAccountId: string,
}

export type CreateLoan = {
    principal: number,
    borrowerAccountId: string
}

export type PayLoan = {
  senderBankAccountId: string,
  amount: number,
  description: string
}