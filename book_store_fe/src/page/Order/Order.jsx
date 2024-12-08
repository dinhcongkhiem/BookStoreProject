import React, { useCallback, useEffect, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import classNames from 'classnames/bind';
import style from './Order.module.scss';
import { useMutation, useQuery } from '@tanstack/react-query';
import OrderService from '../../service/OrderService';
import CartService from '../../service/CartService';
import ModalLoading from '../../component/Modal/ModalLoading/ModalLoading';
import { useNavigate } from 'react-router-dom';
import { convertStatusOrderToVN, getStatusOrderClass, orderTabs } from '../../utills/ConvertData';
import { toast } from 'react-toastify';
import ConfirmModal from '../../component/Modal/ConfirmModal/ConfirmModal';
const cx = classNames.bind(style);

function Order() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const [ordersList, setOrdersList] = useState([]);
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [orderIdToUpdateStatus, setOrderIdToUpdateStatus] = useState(null);
    const [isOpenCancelConfirm, setIsOpenCancelConfirm] = useState(false);
    const observer = useRef();
    const navigate = useNavigate();
    const {
        data: orders,
        error,
        isLoading,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ['orderByUser', page, activeTab],
        queryFn: () =>
            OrderService.getOrderByUser({ page, status: activeTab, keyword: searchTerm }).then((res) => res.data),
        retry: 1,
        enabled: !!page && !!activeTab,
    });
    const handleSearchOrder = () => {
        setPage(1);
        refetch();
    };

    const reBuyProductsMutation = useMutation({
        mutationFn: (orderCode) => CartService.rebuyProduct(orderCode),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: () => {
            navigate('/cart');
        },
    });

    const lastItemRef = useCallback(
        (node) => {
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && page < orders?.totalPages) {
                    setPage((prevPage) => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [orders],
    );

    const getStatusIcon = (status) => {
        switch (status) {
            case 'AWAITING_PAYMENT':
                return <AccessTimeIcon className={cx('statusIcon', 'statusIconPending')} />;
            case 'PROCESSING':
                return <InventoryIcon className={cx('statusIcon', 'statusIconProcessing')} />;
            case 'SHIPPING':
                return <LocalShippingIcon className={cx('statusIcon', 'statusIconShipping')} />;
            case 'COMPLETED':
                return <CheckCircleIcon className={cx('statusIcon', 'statusIconDelivered')} />;
            case 'CANCELED':
                return <CancelIcon className={cx('statusIcon', 'statusIconCancelled')} />;
            default:
                return null;
        }
    };
    const updateStatusOrderMutation = useMutation({
        mutationFn: ({ id, status }) => OrderService.updateStatusOrder(id, status),
        onError: (error) => console.error(error),
        onSuccess: () => {
            setIsOpenCancelConfirm(false);
            refetch();
            toast.success('Đã cập nhật đơn hàng');
        },
    });

    useEffect(() => {
        if (orders && page === 1) {
            setOrdersList(orders.content);
        } else if (orders && page > 1) {
            setOrdersList((prevOrders) => [...prevOrders, ...orders.content]);
        }
    }, [orders]);

    return (
        <div className={cx('container')}>
            <h1 className={cx('heading')}>Đơn hàng của tôi</h1>

            <div className={cx('tabs')}>
                {orderTabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={cx('tab', { active: activeTab === tab.id })}
                        onClick={() => {
                            setOrdersList(undefined);
                            setActiveTab(tab.id);
                            setPage(1);
                        }}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            <div className={cx('searchSection')}>
                <div className={cx('searchInputContainer')}>
                    <SearchIcon className={cx('searchIcon')} />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        name="search"
                        placeholder="Tìm đơn hàng theo Mã đơn hàng hoặc Tên sản phẩm"
                        type="search"
                        className={cx('searchInput')}
                    />
                    <button className={cx('searchButton')} onClick={handleSearchOrder}>
                        Tìm đơn hàng
                    </button>
                </div>
            </div>

            <div className={cx('orderList')}>
                {ordersList?.map((order, index) => (
                    <div
                        key={index}
                        className={cx('orderCard')}
                        ref={index === ordersList.length - 1 ? lastItemRef : null}
                    >
                        <div className={cx('orderHeader')}>
                            {getStatusIcon(order.status)}
                            <span className={cx('orderStatus', getStatusOrderClass(order.status))}>
                                {convertStatusOrderToVN(order.status)}
                            </span>
                        </div>
                        <div className={cx('orderDetails')}>
                            {order.items.map((product, index) => (
                                <div key={index} className={cx('productRow')}>
                                    <div
                                        className={cx('productImage')}
                                        style={{ backgroundImage: `url(${product.thumbnail_url})` }}
                                    >
                                        <span className={cx('productQuantity')}>x{product.quantity}</span>
                                    </div>
                                    <div className={cx('productInfo')}>
                                        <p className={cx('productName')}>{product.productName}</p>
                                    </div>
                                    <div className={cx('productPrice')}>
                                        {product.originalPrice.toLocaleString('vi-VN')}₫
                                    </div>
                                </div>
                            ))}
                        </div>
                        <hr />
                        <div className={cx('orderFooter')}>
                            <div className={cx('total')}>
                                <span className={cx('totalLabel')}>Tổng tiền:</span>
                                <span className={cx('totalAmount')}>{order.finalPrice.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className={cx('actions')}>
                                {order.status === 'AWAITING_PAYMENT' && (
                                    <>
                                        <button
                                            className={cx('actionButton', 'payAgainButton')}
                                            onClick={() => navigate(`/payment/repayment/${order.orderId}`)}
                                        >
                                            Thanh toán lại
                                        </button>
                                        <button
                                            className={cx('actionButton')}
                                            onClick={() => navigate(`/order/detail/${order.orderId}`)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </>
                                )}
                                {order.status === 'PROCESSING' && (
                                    <>
                                        <button
                                            className={cx('actionButton')}
                                            onClick={() => {
                                                setIsOpenCancelConfirm(true);
                                                setOrderIdToUpdateStatus(order.orderId);
                                            }}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            className={cx('actionButton')}
                                            onClick={() => navigate(`/order/detail/${order.orderId}`)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </>
                                )}
                                {order.status === 'SHIPPING' && (
                                    <button
                                        className={cx('actionButton')}
                                        onClick={() => navigate(`/order/detail/${order.orderId}`)}
                                    >
                                        Xem chi tiết
                                    </button>
                                )}
                                {order.status === 'COMPLETED' && (
                                    <>
                                        <button
                                            className={cx('actionButton')}
                                            onClick={() => navigate(`/order/detail/${order.orderId}`)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </>
                                )}
                                {order.status === 'CANCELED' && (
                                    <>
                                        <button
                                            className={cx('actionButton')}
                                            onClick={() =>
                                                reBuyProductsMutation.mutate(
                                                    order.items.map((i) => i.productId).join(','),
                                                )
                                            }
                                        >
                                            Mua lại
                                        </button>
                                        <button
                                            className={cx('actionButton')}
                                            onClick={() => navigate(`/order/detail/${order.orderId}`)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {isOpenCancelConfirm && (
                <ConfirmModal
                    open={isOpenCancelConfirm}
                    onClose={() => setIsOpenCancelConfirm(false)}
                    onConfirm={() =>
                        updateStatusOrderMutation.mutate({ id: orderIdToUpdateStatus, status: 'CANCELED' })
                    }
                    title={'Xác nhận'}
                    message={'Bạn đang muốn hủy đơn hàng này?'}
                />
            )}
            <ModalLoading isLoading={isLoading || isFetching} />
        </div>
    );
}

export default Order;
