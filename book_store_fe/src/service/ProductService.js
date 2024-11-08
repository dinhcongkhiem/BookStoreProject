import axios from 'axios';
import httpRequest from '../utills/httpRequest';
import { PRODUCT_URL } from './config';
class ProductServiceClass {
    getListProduct = ({ page = 1, pageSize = 20, categoryId, price, publisher, keyword, sort }) => {
        price = price === 'null,null' ? null : price;
        let config = {
            method: 'get',
            url: PRODUCT_URL + '/available',
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                page: page - 1,
                pageSize,
                category: categoryId,
                price,
                publisher,
                keyword: keyword,
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

    insertProduct = (product, images, indexThumbnail) => {
        const data = new FormData();
        data.append('product', JSON.stringify(product));
        data.append('i_thumbnail', indexThumbnail);
        images?.forEach((img) => {
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

    updateProduct = (productId, product, images, indexThumbnail) => {
        const data = new FormData();
        let listOldImg = [];
        data.append('product', JSON.stringify(product));
        data.append('i_thumbnail', indexThumbnail);
        images?.forEach((img, index) => {
            if (img.productImgId) {
                listOldImg.push(img.productImgId);
            }
            data.append('images', img);
        });
        data.append('listOldImg', listOldImg);

        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: PRODUCT_URL + `/${productId}`,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
            data: data,
        };

        return httpRequest.request(config);
    };

    removeProduct = (productId) => {
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: PRODUCT_URL,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
            params: { id: productId },
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

    getAllProductForMng = ({ page = 1, pageSize = 20, keyword, sort }) => {
        let config = {
            method: 'get',
            url: PRODUCT_URL + '/all',
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                page: page - 1,
                pageSize,
                keyword: keyword,
                sort,
            },
            withCredentials: true,
        };
        return httpRequest.request(config);
    };

    getAttributes = () => {
        let config = {
            method: 'get',
            url: PRODUCT_URL + '/attributes',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };
        return httpRequest.request(config);
    };
}
const ProductService = new ProductServiceClass();
export default ProductService;
