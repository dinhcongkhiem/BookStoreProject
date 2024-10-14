import httpRequest from '../utills/httpRequest';
import { CART_URL } from './config';
class CartServiceClass {
    addProductToCart = (data) => {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: CART_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            data: data,
        };

        return httpRequest.request(config);
    };

    getProductInCart = ({ page = 1 }) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: CART_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            params: { size: 20, page: page - 1 },
        };

        return httpRequest.request(config);
    };

    updateCartItem = ({ qty, cartId }) => {
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: CART_URL + `/${cartId}`,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            params: { qty },
        };

        return httpRequest.request(config);
    };

    removeCartItem = (id) => {
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: CART_URL + `/${id}`,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };

        return httpRequest.request(config);
    };
}
const CartService = new CartServiceClass();
export default CartService;
