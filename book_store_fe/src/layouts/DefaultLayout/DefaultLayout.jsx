import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import style from './DefaultLayout.module.scss';
import Header from '../component/Header/Header';
import Footer from '../component/Footer/Footer';
const cx = classNames.bind(style);
function DefaultLayout({ children }) {
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
