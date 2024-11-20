import { CHECKOUT_URL } from './config';
import httpRequest from '../utills/httpRequest';
class CheckoutServiceClass {
    getCheckoutData = ({ cartIds, productId, qty, address }) => {
        let province = null;
        let district = null;
        let commune = null;
        let detail = null;
        if (address) {
            province = address.address.province.label;
            district = address.address.district.label;
            commune = address.address.commune.label;
            detail = address.address.addressDetail;
        }

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: CHECKOUT_URL,
            withCredentials: true,
            params: { cartIds: cartIds?.join(','), productId, qty, province, district, commune, detail },
        };

        return httpRequest.request(config);
    };

    getReCheckoutData = (orderId) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: CHECKOUT_URL + "/re-checkout",
            withCredentials: true,
            params: { orderId},
        };

        return httpRequest.request(config);
    };
}
const CheckoutService = new CheckoutServiceClass();
export default CheckoutService;
