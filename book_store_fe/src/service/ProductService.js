import axios from 'axios';
import httpRequest from '../utills/httpRequest';
import { PRODUCT_URL } from './config';
class ProductServiceClass {
    // getListProduct = (page, pageSize) => {
    //     let config = {
    //         method: 'get',
    //         url: USER_URL,
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         withCredentials: true,
    //     };
    //     return httpRequest.request(config);
    // };

    getProductDetail = (id) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://localhost:8080/api/v1/product?id=4',
            headers: {},
            withCredentials: true,
        };

        return axios.request(config);
    };
}
const ProductService = new ProductServiceClass();
export default ProductService;
