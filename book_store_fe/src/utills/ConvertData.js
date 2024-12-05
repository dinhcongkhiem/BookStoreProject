export const orderTabs = [
    { id: 'all', label: 'Tất cả đơn' },
    { id: 'AWAITING_PAYMENT', label: 'Chờ thanh toán' },
    { id: 'PROCESSING', label: 'Đang xử lý' },
    { id: 'SHIPPING', label: 'Đang vận chuyển' },
    { id: 'COMPLETED', label: 'Đã hoàn thành' },
    { id: 'CANCELED', label: 'Đã huỷ ' },
];

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};
export const convertToISOString = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}T00:00:00`;
};

export const convertStatusOrderToVN = (status) => {
    switch (status) {
        case 'PENDING':
            return 'Chờ';
        case 'AWAITING_PAYMENT':
            return 'Chờ thanh toán';
        case 'PROCESSING':
            return 'Đang xử lý';
        case 'SHIPPING':
            return 'Đang vận chuyển';
        case 'COMPLETED':
            return 'Đã hoàn thành';
        case 'CANCELED':
            return 'Đã hủy';
        default:
            return '';
    }
};

export const convertTypeOrderToVN = (type) => {
    switch (type) {
        case 'ONLINE':
            return 'Trực tuyến (Online)';
        case 'IN_STORE':
            return 'Tại của hàng';
        default:
            return '';
    }
}


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