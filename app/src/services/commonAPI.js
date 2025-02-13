import axios from "axios";

const commonAPI = async (method, url, data) => {
    const config = {
        method,
        url,
        data,
        withCredentials: true,
    }
    return await axios(config).then(res => res).catch(err => err)
}

export default commonAPI