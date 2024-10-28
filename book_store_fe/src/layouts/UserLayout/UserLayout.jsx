import style from './UserLayout.module.scss';
import classNames from 'classnames/bind';
import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faKey } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import DefaultLayout from '../DefaultLayout/DefaultLayout';
const cx = classNames.bind(style);

function UserLayout({ children }) {
    const navigate = useNavigate();
    const {pathname} = useLocation();

    return (
        <DefaultLayout>
            <div className={cx('user-container')}>
                <div className={cx('sidebar')}>
                    <ul>
                        <li
                            className={cx({ active: pathname === '/user/info' })}
                            onClick={() => navigate('/user/info')}
                        >
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
                            Thông tin tài khoản
                        </li>
                        <li className={cx({ active: pathname === '/order' })} onClick={() => navigate('/order')}>
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
                            Quản lý đơn hàng
                        </li>
                        <li className={cx({ active: pathname === 'orderDetail' })}>
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
                            Chi tiết đơn hàng
                        </li>
                        <li
                            className={cx({ active: pathname === '/user/change-pass' })}
                            onClick={() => navigate('/user/change-pass')}
                        >
                            <FontAwesomeIcon icon={faKey} style={{ marginRight: '10px' }} />
                            Đổi mật khẩu
                        </li>
                    </ul>
                </div>

                <div className={cx('content')}>{children}</div>
            </div>
        </DefaultLayout>
    );
}

export default UserLayout;
