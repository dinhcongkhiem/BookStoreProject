import axios from 'axios';
import { PUBLISHER_URL } from './config';

class PublisherServiceClass {
    // Lấy tất cả nhà xuất bản
    getAll = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: PUBLISHER_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };

        return axios.request(config);
    };

    // Thêm nhà xuất bản mới
    create = (data) => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: PUBLISHER_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data),
            withCredentials: true,
        };

        return axios.request(config);
    };
    // Sửa thông tin nhà xuất bản
    update = (id, data) => {
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: `${PUBLISHER_URL}/${id}`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data),
            withCredentials: true,
        };

        return axios.request(config);
    };

    // Xóa nhà xuất bản
    delete = (id) => {
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: `${PUBLISHER_URL}/${id}`,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };

        return axios.request(config);
    };
}

const PublisherService = new PublisherServiceClass();
export default PublisherService;
