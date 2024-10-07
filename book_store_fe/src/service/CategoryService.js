import axios from 'axios';
// import httpRequest from '../utills/httpRequest';
import { CATEGORY_URL } from './config';
class CategoryServiceClass {
    getAll = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: CATEGORY_URL,
            withCredentials: true,

        };

        return axios.request(config);

    };
}
const CatogoryService = new CategoryServiceClass();
export default CatogoryService;
