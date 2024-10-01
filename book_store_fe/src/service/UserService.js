import httpRequest from '../utills/httpRequest';
import { USER_URL } from './config';
class UserServiceClass {
    getUserInfo = () => {
        let config = {
            method: 'get',
            url: USER_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };
        return httpRequest.request(config);
    };

    updateUser = (data) => {
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: USER_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            data: data,
        };

        return httpRequest.request(config);
    };
}
const UserService = new UserServiceClass();
export default UserService;
