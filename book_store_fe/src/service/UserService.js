import httpRequest from '../utills/httpRequest';
import { USER_URL } from './config';
class UserServiceClass {
    getAllUser = ({ page, size, keyword }) => {
        let config = {
            method: 'get',
            url: USER_URL + '/all',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            params: {
                page: page - 1,
                size,
                keyword: keyword,
            },
        };
        console.log('jâja');

        return httpRequest.request(config);
    };

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

    changePassword = (data) => {
        let config = {
            method: 'patch',
            url: USER_URL + '/change-password',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            data: data,
        };
        return httpRequest.request(config);
    };

    sendContactMail = (data) => {
        let config = {
            method: 'post',
            url: "http://localhost:8080/api/v1/contact",
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            data: data,
        };
        return httpRequest.request(config);
    }
}
const UserService = new UserServiceClass();
export default UserService;
