export const orderTabs = [
    { id: 'all', label: 'Tất cả đơn' },
    { id: 'AWAITING_PAYMENT', label: 'Chờ thanh toán' },
    { id: 'PROCESSING', label: 'Đang xử lý' },
    { id: 'SHIPPING', label: 'Đang vận chuyển' },
    { id: 'COMPLETED', label: 'Đã giao' },
    { id: 'CANCELED', label: 'Đã huỷ ' },
];

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};


export const convertStatusOrderToVN = (status) => {
    switch (status) {
        case 'AWAITING_PAYMENT':
            return 'Chờ thanh toán';
        case 'PROCESSING':
            return 'Đang xử lý';
        case 'SHIPPING':
            return 'Đang vận chuyển';
        case 'COMPLETED':
            return 'Đã giao';
        case 'CANCELED':
            return 'Đã hủy';
        default:
            return '';
    }
};
export const getStatusOrderClass = (status) => {
    switch (status) {
        case 'AWAITING_PAYMENT':
            return 'statusPending';
        case 'PROCESSING':
            return 'statusProcessing';
        case 'SHIPPING':
            return 'statusShipping';
        case 'COMPLETED':
            return 'statusDelivered';
        case 'CANCELED':
            return 'statusCancelled';
        default:
            return '';
    }
};