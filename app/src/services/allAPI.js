import commonAPI from "./commonAPI"
import SERVERURL from "./SERVERURL"

export const userLogin = async (reqBody) => {
    return await commonAPI("POST", `/api/login`, reqBody)
}

export const userRegister = async (reqBody) => {
    return await commonAPI("POST", `/api/register`, reqBody)
}

export const getAllUsers = async () => {
    return await commonAPI("GET", `/api/users`, {})
}

export const getAllMessages = async (reqBody) => {
    return await commonAPI("POST", `/api/all`, reqBody)
}

export const sendMessage = async (reqBody) => {
    return await commonAPI("POST", `/api/send`, reqBody)
}