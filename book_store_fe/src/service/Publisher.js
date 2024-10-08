import axios from 'axios';
// import httpRequest from '../utills/httpRequest';
import { PUBLISHER_URL } from './config';
class PublisherServiceClass {
    getAll = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: PUBLISHER_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };

        return axios.request(config);

    };
}
const PublisherService = new PublisherServiceClass();
export default PublisherService;
