import { ORDERS_URL, PAYMENT_URL } from './config';
import httpRequest from '../utills/httpRequest';
class OrderServiceClass {
    getOrderByUser = ({ page, status, keyword }) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: ORDERS_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                page: page - 1,
                status: status === 'all' ? null : status,
                keyword: keyword.trim().length > 0 ? keyword.trim() : null,
            },
            withCredentials: true,
        };

        return httpRequest.request(config);
    };
    createOrder = (data) => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: ORDERS_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            data: data,
        };

        return httpRequest.request(config);
    };

    getOrderDetailByID = (id) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: ORDERS_URL + `/${id}`,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };

        return httpRequest.request(config);
    }

    checkStatusOrder = (orderCode) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: ORDERS_URL + '/status',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            params: { orderCode },
        };

        return httpRequest.request(config);
    };

    cancelPayment = (orderId) => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: PAYMENT_URL + `/cancel?orderCode=${orderId}`,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };

        return httpRequest.request(config);
    };
}
const OrderService = new OrderServiceClass();
export default OrderService;
