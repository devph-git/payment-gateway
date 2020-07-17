import { String } from 'typescript-string-operations';

const INVALID_LOGIN_CREDENTIALS = 'Wrong credentials email: {email} password: {password}`'
const INACTIVE_USER = 'User {email} is currently disabled'
const EXPIRED_AUTH_TOKEN = 'Auth token has expired. Please login again.'

const err = (error, args: object = {}) => {
    return String.Format(error, args)
}

export {
    err,
    INVALID_LOGIN_CREDENTIALS,
    INACTIVE_USER,
    EXPIRED_AUTH_TOKEN
}