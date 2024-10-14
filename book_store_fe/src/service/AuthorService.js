import httpRequest from '../utills/httpRequest';
import { AUTHOR_URL } from './config';
class CategoryServiceClass {
    getAll = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: AUTHOR_URL,
            withCredentials: true,

        };

        return httpRequest.request(config);

    };
}
const CatogoryService = new CategoryServiceClass();
export default CatogoryService;
