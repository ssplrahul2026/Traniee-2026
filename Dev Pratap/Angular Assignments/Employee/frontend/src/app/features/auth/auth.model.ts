export interface IlogInUser {
    email: string,
    password: string
}
export interface IregisterUser {
    fullName: string,
    email: string,
    password: string,
}


export interface ILogInRes {
    accessToken: string,
    refreshToken: string
}