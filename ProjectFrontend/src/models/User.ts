export type User = {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    token: string,
    roles: string[]
}

export type UserProfile = {
    Id: string,
    Email: string,
    FirstName: string,
    LastName: string,
    Roles: string[]
}

export type AdminListUser = {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    token: string,
    personalIdentificationNumber: string,
    roles: string[]
}

export type AdminEditUserRequest = {
    email: string,
    firstName: string,
    lastName: string,
    personalIdentificationNumber: string,
    roles: string[]
}