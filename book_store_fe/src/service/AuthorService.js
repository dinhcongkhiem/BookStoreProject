import httpRequest from '../utills/httpRequest';
import { AUTHOR_URL } from './config';

class AuthorServiceClass {
    getAll = ({ keyword }) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: AUTHOR_URL,
            withCredentials: true,
            params: { keyword: keyword.length > 0 ? keyword : null },
    };
return httpRequest.request(config);
};
create = (authorData) => {
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: AUTHOR_URL,
        data: authorData,
        withCredentials: true,
    };

    return httpRequest.request(config);
};

update = (id, authorData) => {
    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${AUTHOR_URL}/${id}`,
        data: authorData,
        withCredentials: true,
    };

    return httpRequest.request(config);
};

delete = (id) => {
    let config = {
        method: 'delete',
        url: `${AUTHOR_URL}/${id}`,
        withCredentials: true,
    };

    return httpRequest.request(config);
};
}

const authorService = new AuthorServiceClass();
export default authorService;
