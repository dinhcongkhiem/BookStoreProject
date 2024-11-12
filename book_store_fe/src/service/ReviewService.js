import axios from 'axios';
import { REVIEW_URL } from './config';

class ReviewServiceClass {
    createReview = (request, productId) => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: REVIEW_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            params: { productId },
            data: request,
        };

        return axios.request(config);
    };

    getReviews = (productId) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: REVIEW_URL + `/detail/${productId}`,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };

        return axios.request(config);
    };
}

const ReviewService = new ReviewServiceClass();
export default ReviewService;
