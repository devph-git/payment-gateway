import { String } from 'typescript-string-operations';

const INVALID_LOGIN_CREDENTIALS = 'Wrong credentials email: {email} password: {password}`'

const err = (error, args: object = {}) => {
    return String.Format(error, args)
}

export {
    err,
    INVALID_LOGIN_CREDENTIALS
}