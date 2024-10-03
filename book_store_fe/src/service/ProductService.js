import axios from 'axios';
import httpRequest from '../utills/httpRequest';
import { PRODUCT_URL } from './config';
class ProductServiceClass {
    getListProduct = (page, pageSize) => {
        let pageRequest = 0;
        let pageSizeRequest = 20;

        if(page) {
            pageRequest = page; 
        }

        if(pageSize) {
            pageSizeRequest = pageSize
        }
        let config = {
            method: 'get',
            url: PRODUCT_URL + '/list',
            headers: {
                'Content-Type': 'application/json',
            },
            params: {pageNumber: pageRequest, pageSize: pageSizeRequest},
            withCredentials: true,
        };
        return httpRequest.request(config);
    };

    getProductDetail = (id) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: PRODUCT_URL,
            params: {id: 4},
            headers: {},
            withCredentials: true,
        };

        return axios.request(config);
    };
}
const ProductService = new ProductServiceClass();
export default ProductService;
