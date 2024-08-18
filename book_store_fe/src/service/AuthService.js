import axios from 'axios';
import { AUTH_URL } from './config';
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
            data: data,
        };
        console.log(data);
        return axios.request(config);
    };
}
const AuthService = new AuthServiceClass();
export default AuthService;
