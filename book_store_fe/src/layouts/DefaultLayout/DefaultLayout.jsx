import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import style from './DefaultLayout.module.scss';
import Header from '../component/Header/Header';
import Footer from '../component/Footer/Footer';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthenticationContext } from '../../context/AuthenticationProvider';
const cx = classNames.bind(style);
function DefaultLayout({ children }) {
    const { authentication, loading } = useContext(AuthenticationContext);
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading) {
            if (authentication.user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            }
        }
    }, [authentication, loading, navigate]);
    return (
        <div className={cx('wrapper')}>
            <Header />
            <div className={cx('container')}>
                <div className={cx('content')}>{children}</div>
            </div>
            <Footer />
        </div>
    );
}

DefaultLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
export default DefaultLayout;
