import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import classNames from 'classnames/bind';
import style from './Order.module.scss';

const cx = classNames.bind(style);

function Order() {
    const [activeTab, setActiveTab] = useState('all');

    const tabs = [
        { id: 'all', label: 'Tất cả đơn' },
        { id: 'pending', label: 'Chờ thanh toán' },
        { id: 'processing', label: 'Đang xử lý' },
        { id: 'shipping', label: 'Đang vận chuyển' },
        { id: 'delivered', label: 'Đã giao' },
        { id: 'cancelled', label: 'Đã huỷ ' },
    ];

    const orders = [
        {
            id: 1,
            status: 'Đã hủy',
            products: [
                {
                    name: 'Set 20 khay bạc lót nồi chiên không dầu, khay giấy bạc nướng đa năng',
                    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzAD3fE4gimUcLKMThvONgIwrdzkTf9bwzWQ&s',
                    quantity: 1,
                    price: '39.000 ₫',
                    store: 'So Easy Homecare',
                },
            ],
            total: '72.000 ₫',
        },
        {
            id: 2,
            status: 'Đã hủy',
            products: [
                {
                    name: 'Ốp lưng cho iP mềm trong suốt dẻo có ngăn đựng thẻ',
                    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzAD3fE4gimUcLKMThvONgIwrdzkTf9bwzWQ&s',
                    quantity: 1,
                    price: '32.000 ₫',
                    store: 'Shalla',
                },
            ],
            total: '64.700 ₫',
        },
        {
            id: 3,
            status: 'Chờ thanh toán',
            products: [
                {
                    name: 'Bộ quần áo thể thao nam',
                    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzAD3fE4gimUcLKMThvONgIwrdzkTf9bwzWQ&s',
                    quantity: 2,
                    price: '150.000 ₫',
                    store: 'SportyStyle',
                },
            ],
            total: '300.000 ₫',
        },
        {
            id: 4,
            status: 'Đang xử lý',
            products: [
                {
                    name: 'Tai nghe Bluetooth không dây',
                    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzAD3fE4gimUcLKMThvONgIwrdzkTf9bwzWQ&s',
                    quantity: 1,
                    price: '500.000 ₫',
                    store: 'ElectroHub',
                },
            ],
            total: '500.000 ₫',
        },
        {
            id: 5,
            status: 'Đang vận chuyển',
            products: [
                {
                    name: 'Sách "Đắc Nhân Tâm"',
                    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzAD3fE4gimUcLKMThvONgIwrdzkTf9bwzWQ&s',
                    quantity: 1,
                    price: '80.000 ₫',
                    store: 'BookWorm',
                },
                {
                    name: 'Bút bi cao cấp',
                    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzAD3fE4gimUcLKMThvONgIwrdzkTf9bwzWQ&s',
                    quantity: 3,
                    price: '20.000 ₫',
                    store: 'BookWorm',
                },
            ],
            total: '140.000 ₫',
        },
        {
            id: 6,
            status: 'Đã giao',
            products: [
                {
                    name: 'Kem dưỡng da mặt',
                    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzAD3fE4gimUcLKMThvONgIwrdzkTf9bwzWQ&s',
                    quantity: 1,
                    price: '250.000 ₫',
                    store: 'BeautyZone',
                },
            ],
            total: '250.000 ₫',
        },
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Chờ thanh toán':
                return <AccessTimeIcon className={cx('statusIcon', 'statusIconPending')} />;
            case 'Đang xử lý':
                return <InventoryIcon className={cx('statusIcon', 'statusIconProcessing')} />;
            case 'Đang vận chuyển':
                return <LocalShippingIcon className={cx('statusIcon', 'statusIconShipping')} />;
            case 'Đã giao':
                return <CheckCircleIcon className={cx('statusIcon', 'statusIconDelivered')} />;
            case 'Đã hủy':
                return <CancelIcon className={cx('statusIcon', 'statusIconCancelled')} />;
            default:
                return null;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Chờ thanh toán':
                return 'statusPending';
            case 'Đang xử lý':
                return 'statusProcessing';
            case 'Đang vận chuyển':
                return 'statusShipping';
            case 'Đã giao':
                return 'statusDelivered';
            case 'Đã hủy':
                return 'statusCancelled';
            default:
                return '';
        }
    };

    const filteredOrders = orders.filter((order) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending' && order.status === 'Chờ thanh toán') return true;
        if (activeTab === 'processing' && order.status === 'Đang xử lý') return true;
        if (activeTab === 'shipping' && order.status === 'Đang vận chuyển') return true;
        if (activeTab === 'delivered' && order.status === 'Đã giao') return true;
        if (activeTab === 'cancelled' && order.status === 'Đã hủy') return true;
        return false;
    });

    return (
        <div className={cx('container')}>
            <h1 className={cx('heading')}>Đơn hàng của tôi</h1>

            <div className={cx('tabs')}>
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={cx('tab', { active: activeTab === tab.id })}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            <div className={cx('searchSection')}>
                <div className={cx('searchInputContainer')}>
                    <SearchIcon className={cx('searchIcon')} />
                    <input
                        name="search"
                        placeholder="Tìm đơn hàng theo Mã đơn hàng, Nhà bán hoặc Tên sản phẩm"
                        type="search"
                        className={cx('searchInput')}
                    />
                    <button className={cx('searchButton')}>Tìm đơn hàng</button>
                </div>
            </div>

            <div className={cx('orderList')}>
                {filteredOrders.map((order) => (
                    <div key={order.id} className={cx('orderCard')}>
                        <div className={cx('orderHeader')}>
                            {getStatusIcon(order.status)}
                            <span className={cx('orderStatus', getStatusClass(order.status))}>{order.status}</span>
                        </div>
                        <div className={cx('orderDetails')}>
                            {order.products.map((product, index) => (
                                <div key={index} className={cx('productRow')}>
                                    <div
                                        className={cx('productImage')}
                                        style={{ backgroundImage: `url(${product.image})` }}
                                    >
                                        <span className={cx('productQuantity')}>x{product.quantity}</span>
                                    </div>
                                    <div className={cx('productInfo')}>
                                        <p className={cx('productName')}>{product.name}</p>
                                        <p className={cx('productStore')}>Cửa hàng: {product.store}</p>
                                    </div>
                                    <div className={cx('productPrice')}>{product.price}</div>
                                </div>
                            ))}
                        </div>
                        <hr />
                        <div className={cx('orderFooter')}>
                            <div className={cx('total')}>
                                <span className={cx('totalLabel')}>Tổng tiền:</span>
                                <span className={cx('totalAmount')}>{order.total}</span>
                            </div>
                            <div className={cx('actions')}>
                                {order.status === 'Chờ thanh toán' && (
                                    <>
                                        <button className={cx('actionButton', 'payAgainButton')}>Thanh toán lại</button>
                                        <button className={cx('actionButton')}>Xem chi tiết</button>
                                    </>
                                )}
                                {order.status === 'Đang xử lý' && (
                                    <button className={cx('actionButton')}>Xem chi tiết</button>
                                )}
                                {order.status === 'Đang vận chuyển' && (
                                    <button className={cx('actionButton', 'receivedButton')}>Đã nhận được hàng</button>
                                )}
                                {order.status === 'Đã giao' && (
                                    <>
                                        <button className={cx('actionButton', 'reviewButton')}>Đánh giá</button>
                                        <button className={cx('actionButton')}>Xem chi tiết</button>
                                    </>
                                )}
                                {order.status === 'Đã hủy' && (
                                    <>
                                        <button className={cx('actionButton')}>Mua lại</button>
                                        <button className={cx('actionButton')}>Xem chi tiết hủy đơn</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Order;
