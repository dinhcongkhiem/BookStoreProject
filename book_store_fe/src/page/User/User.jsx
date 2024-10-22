import style from './User.module.scss';
import classNames from 'classnames/bind';
import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faKey } from '@fortawesome/free-solid-svg-icons';
import UserInfo from './Tab/UserInfo';
import OrderInfo from './Order/Order';
import OrderDetail from './OrderDetail/OrderDetail';
import ChangePassword from './Tab/ChangePassword';
import ModalLoading from '../../component/Modal/ModalLoading/ModalLoading';
const cx = classNames.bind(style);

function User() {
    const [activeTab, setActiveTab] = useState('accountInfo');
    const [isLoading, setIsLoading] = useState(false);
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div>
            <div className={cx('user-container')}>
                <div className={cx('sidebar')}>
                    <ul>
                        <li
                            className={cx({ active: activeTab === 'accountInfo' })}
                            onClick={() => handleTabChange('accountInfo')}
                        >
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
                            Thông tin tài khoản
                        </li>
                        <li
                            className={cx({ active: activeTab === 'orderInfo' })}
                            onClick={() => handleTabChange('orderInfo')}
                        >
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
                            Quản lý đơn hàng
                        </li>
                        <li
                            className={cx({ active: activeTab === 'orderDetail' })}
                            onClick={() => handleTabChange('orderDetail')}
                        >
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
                            Chi tiết đơn hàng
                        </li>
                        <li
                            className={cx({ active: activeTab === 'changePassword' })}
                            onClick={() => handleTabChange('changePassword')}
                        >
                            <FontAwesomeIcon icon={faKey} style={{ marginRight: '10px' }} />
                            Đổi mật khẩu
                        </li>
                    </ul>
                </div>

                <div className={cx('content')}>
                    {activeTab === 'accountInfo' && <UserInfo setIsLoading={setIsLoading} />}
                    {activeTab === 'orderInfo' && <OrderInfo setIsLoading={setIsLoading} />}
                    {activeTab === 'orderDetail' && <OrderDetail setIsLoading={setIsLoading} />}
                    {activeTab === 'changePassword' && <ChangePassword setIsLoading={setIsLoading} />}
                </div>
            </div>
            <ModalLoading isLoading={isLoading} />
        </div>
    );
}

export default User;
