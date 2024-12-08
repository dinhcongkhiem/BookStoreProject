import { VOUCHER_URL } from './config';
import httpRequest from '../utills/httpRequest';

class VoucherServiceClass {
    getAll = ({ page = 1, size = 20, keyword, status, sort }) => {
        let config = {
            method: 'get',
            url: VOUCHER_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                page: page - 1,
                size,
                keyword: keyword.length > 0 ? keyword : null,
                status: status === -2 ? null : status,
                sort: sort.length > 0 ? sort : 'newest',
            },
            withCredentials: true,
        };
        return httpRequest.request(config);
    };

    getByUser = ({ page = 1, size = 20, keyword}) => {
        let config = {
            method: 'get',
            url: VOUCHER_URL + '/by-user',
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                page: page - 1,
                size,
                keyword
            },
            withCredentials: true,
        };
        return httpRequest.request(config);
    };

    create = (data) => {
        let config = {
            method: 'post',
            url: VOUCHER_URL,
            withCredentials: true,
            data: data,
        };
        return httpRequest.request(config);
    };

    update = ({ id, data }) => {
        let config = {
            method: 'put',
            url: VOUCHER_URL + `/${id}`,
            withCredentials: true,
            data: data,
        };
        return httpRequest.request(config);
    };

    getById = (id) => {
        let config = {
            method: 'get',
            url: VOUCHER_URL + '/detail',
            withCredentials: true,
            params: {
                id,
            },
        };
        return httpRequest.request(config);
    };

    delete = (id) => {
        let config = {
            method: 'delete',
            url: VOUCHER_URL + `/${id}`,
            withCredentials: true,
        };
        return httpRequest.request(config);
    };
}

const VoucherService = new VoucherServiceClass();
export default VoucherService;
