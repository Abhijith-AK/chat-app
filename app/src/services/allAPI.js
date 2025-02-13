import commonAPI from "./commonAPI"
import SERVERURL from "./SERVERURL"

export const userLogin = async (reqBody) => {
    return await commonAPI("POST", `${SERVERURL}/api/login`, reqBody)
}

export const userRegister = async (reqBody) => {
    return await commonAPI("POST", `${SERVERURL}/api/register`, reqBody)
}

export const getAllUsers = async () => {
    return await commonAPI("GET", `${SERVERURL}/api/users`, {})
}

export const getAllMessages = async (reqBody) => {
    return await commonAPI("POST", `${SERVERURL}/api/all`, reqBody)
}

export const sendMessage = async (reqBody) => {
    return await commonAPI("POST", `${SERVERURL}/api/send`, reqBody)
}