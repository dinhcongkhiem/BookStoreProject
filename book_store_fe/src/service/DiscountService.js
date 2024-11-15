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

    createDiscount = (data) => {
        let config = {
            method: 'post',
            url: DISCOUNT_URL,
            withCredentials: true,
            data: data,
        };
        return httpRequest.request(config);
    };
}
const DiscountService = new DiscountServiceClass();
export default DiscountService;
