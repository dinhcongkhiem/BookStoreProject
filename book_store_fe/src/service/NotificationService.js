import { NOTIFICATION_URL } from './config';
import httpRequest from '../utills/httpRequest';
class NotificationsServiceClass {
    getListNotification = ({ page, pageSize }) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: NOTIFICATION_URL,
            withCredentials: true,
            params: { page: page - 1, pageSize },
        };

        return httpRequest.request(config);
    };

    getQtyNotifications = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: NOTIFICATION_URL + '/qty',
            withCredentials: true,
        };

        return httpRequest.request(config);
    };

    markAsRead = () => {
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: NOTIFICATION_URL,
            withCredentials: true,
        };

        return httpRequest.request(config);
    };

    
}
const NotificationsService = new NotificationsServiceClass();
export default NotificationsService;
