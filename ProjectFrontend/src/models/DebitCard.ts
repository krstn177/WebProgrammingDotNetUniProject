export type DebitCard = {
    id: string,
    cardNumber: string,
    holderName: string,
    expirationDate: Date,
    type: number,
    bankAccountId: string,
    cvv: string,
    ownerId: string
}

export type AdminCreateDebitCardRequest = {
    cardNumber: string,
    holderName: string,
    expirationDate: Date,
    type: number,
    cvv: string,
    bankAccountId: string,
    ownerId: string,
    pin: string
}

export type AdminUpdateDebitCardRequest = {
  id: string;
  holderName: string;
  expirationDate: Date;
  type: number;
  newPIN: string; 
}

export type UserCreateDebitCardRequest = {
    type: number,
    bankAccountId: string,
    pin: string
}

export type UserChangePinRequest = {
    newPin: string
}