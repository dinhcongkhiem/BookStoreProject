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

    getAllOrders = ({ page, status, keyword }) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: ORDERS_URL + '/all',
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

    createCounterSellOrder = () => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: ORDERS_URL + '/counter-sell',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };

        return httpRequest.request(config);
    };

    createOrderDetail = ({ items, orderId }) => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: ORDERS_URL + '/order-detail',
            headers: {
                'Content-Type': 'application/json',
            },
            params: { orderId: orderId },
            data: items,
            withCredentials: true,
        };

        return httpRequest.request(config);
    };

    rePaymentOrder = ({ orderId, paymentType }) => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: ORDERS_URL + '/re-payment',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            params: { orderId: orderId, paymentType: paymentType },
        };

        return httpRequest.request(config);
    };

    getOrderDetailByID = (id) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: ORDERS_URL + `/detail`,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            params: { id },
        };

        return httpRequest.request(config);
    };

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

    updateQuantiyOrder = ({ quantity, id }) => {
        let config = {
            method: 'patch',
            maxBodyLength: Infinity,
            url: ORDERS_URL + `/detail-qty/${id}`,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            data: quantity,
        };

        return httpRequest.request(config);
    };

    deleteOrderDetail = (id) => {
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: ORDERS_URL + `/detail/${id}`,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };

        return httpRequest.request(config);
    };

    updateStatusOrder = (id, status) => {
        let config = {
            method: 'patch',
            maxBodyLength: Infinity,
            url: ORDERS_URL + `/${id}`,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            data: status,
        };

        return httpRequest.request(config);
    };
}
const OrderService = new OrderServiceClass();
export default OrderService;
