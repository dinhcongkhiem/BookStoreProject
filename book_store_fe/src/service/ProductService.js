import axios from 'axios';
import httpRequest from '../utills/httpRequest';
import { PRODUCT_URL } from './config';
class ProductServiceClass {
    getListProduct = ({ page = 1, pageSize = 20, categoryId, price, publisher, keyword, sort }) => {
        price = price === 'null,null' ? null : price;
        
        let config = {
            method: 'get',
            url: PRODUCT_URL + '/list',
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                page: page - 1,
                pageSize,
                category: categoryId,
                price,
                publisher,
                keyword:  keyword,
                sort,
            },
            withCredentials: true,
        };
        return axios.request(config);
    };

    getProductDetail = (id) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: PRODUCT_URL,
            params: { id: id },
            headers: {},
            withCredentials: true,
        };

        return httpRequest.request(config);
    };

    uploadImgInDescription = (formData) => {
        console.log('haha');

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://localhost:8080/api/v1/image',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,

            data: formData,
        };
        return httpRequest.request(config);
    };

    insertProduct = (product, images) => {
        const data = new FormData();
        data.append(product);
        images?.foreach((img) => {
            data.append('images', img);
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: PRODUCT_URL,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
            data: data,
        };

        return httpRequest.request(config);
    };

    getPriceRange = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: PRODUCT_URL + '/price-range',
            withCredentials: true,
        };

        return axios.request(config);
    };
}
const ProductService = new ProductServiceClass();
export default ProductService;
