import axios from 'axios';
import httpRequest from '../utills/httpRequest';
import { AUTH_URL, USER_URL } from './config';
class AuthServiceClass {
    Login = (data, remember) => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: AUTH_URL + '/login',
            params: { isRemember: remember },
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            data: data,
        };
        return axios.request(config);
    };

    Register = (data) => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: AUTH_URL + '/register',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            data: data,
        };
        console.log(data);
        return axios.request(config);
    };
    logout = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: USER_URL + '/logout',
            withCredentials: true,
        };

        return httpRequest.request(config);
    };
    verifyAccount = (activeKey) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: AUTH_URL + '/verify',
            params: { verifyKey: activeKey },
            withCredentials: true,
        };

        return axios.request(config);
    };
}
const AuthService = new AuthServiceClass();
export default AuthService;
