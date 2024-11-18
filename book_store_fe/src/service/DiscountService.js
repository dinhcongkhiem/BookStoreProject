import { DISCOUNT_URL } from './config';
import httpRequest from '../utills/httpRequest';
class DiscountServiceClass {
    getDiscounts = ({ page, size, orderBy, keyword, status }) => {
        let config = {
            method: 'get',
            url: DISCOUNT_URL,
            withCredentials: true,
            params: {
                page: page - 1,
                size,
                orderBy,
                keyword,
                status: status === -2 ? null : status,
            },
        };
        return httpRequest.request(config);
    };

    getDiscountByID = (id) => {
        let config = {
            method: 'get',
            url: DISCOUNT_URL + `/${id}`,
            withCredentials: true,
        };
        return httpRequest.request(config);
    };

    createDiscount = (data) => {
        let config = {
            method: 'post',
            url: DISCOUNT_URL,
            withCredentials: true,
            data: data,
        };
        return httpRequest.request(config);
    };

    updateDiscount = (id, data) => {
        let config = {
            method: 'put',
            url: DISCOUNT_URL + `/${id}`,
            withCredentials: true,
            data: data,
        };
        return httpRequest.request(config);
    };

    remove = (id) => {
        let config = {
            method: 'delete',
            url: DISCOUNT_URL + `/${id}`,
            withCredentials: true,
        };
        return httpRequest.request(config);
    };
}
const DiscountService = new DiscountServiceClass();
export default DiscountService;
