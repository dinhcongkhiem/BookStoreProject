import axios from 'axios';
import { CATEGORY_URL } from './config';
class CategoryServiceClass {
    getAll = ({keyword}) => {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: CATEGORY_URL,
            withCredentials: true,
            params: { keyword: keyword.length > 0 ? keyword : null },
        };
        return axios.request(config);
    };

    create = (data) => {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://localhost:8080/api/v1/admin/category',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data),
            withCredentials: true,
        };
        return axios.request(config);
    };
    update = (id, data) => {
        const config = {
            method: 'put', // Use PUT for updates
            maxBodyLength: Infinity,
            url: `http://localhost:8080/api/v1/admin/category/${id}`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data),
            withCredentials: true,
        };
        return axios.request(config);
    };

    delete = (id) => {
        const config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: `http://localhost:8080/api/v1/admin/category/${id}`,
            withCredentials: true,
        };
        return axios.request(config);
    };
}

const CategoryService = new CategoryServiceClass();
export default CategoryService;
