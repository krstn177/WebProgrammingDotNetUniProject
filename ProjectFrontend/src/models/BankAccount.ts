export type BankAccount = {
    id: string,
    iban: string,
    accountNumber: string,
    balance: number,
    bankUserId: string
}

export type AdminCreateBankAccountRequest = {
    iban: string,
    accountNumber: string,
    balance: number,
    bankUserId: string
}

export type AdminUpdateBankAccountRequest = {
    iban: string,
    accountNumber: string,
    balance: number,
}
