import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { List, ListItemButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import style from './AdminLayout.module.scss';
import logoBook from '../../assets/image/Logo-BookBazaar-nobg.png';
import Tippy from '@tippyjs/react';
import { useContext } from 'react';
import { AuthenticationContext } from '../../context/AuthenticationProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { adminRoutes } from '../../routes/routes';

const cx = classNames.bind(style);
function AdminLayout({ children }) {
    const navigate = useNavigate();
    const { authentication, logout } = useContext(AuthenticationContext);

    return (
        <div className={cx('wrapper')}>
            <header className={cx('header')}>
                <div className={cx('logo')}>
                    <Link to="/">
                        <img src={logoBook} alt="BookStore Logo" className={cx('logoImage')} />
                    </Link>
                </div>
                <Tippy
                    interactive
                    placement="bottom-end"
                    render={(attrs) => (
                        <>
                            <ul className={cx('user-menu')} {...attrs}>
                                <li>
                                    <Link to="/user">Thông tin cá nhân</Link>
                                </li>
                                <li>
                                    <Link to="/" onClick={() => logout()}>
                                        Đăng xuất
                                    </Link>
                                </li>
                            </ul>
                        </>
                    )}
                >
                    <div className={cx('user')} style={{ cursor: 'auto' }}>
                        <FontAwesomeIcon icon={faUser} size="lg" style={{ color: '#6c757d' }} />
                    </div>
                </Tippy>
            </header>

            <div className={cx('container')} style={{ minHeight: '70rem' }}>
                <div className={cx('nav-bar')}>
                    <List sx={{ paddingBottom: '0' }}>
                        {adminRoutes.map((routes) => {
                            return (
                                <ListItemButton
                                    sx={{ padding: '0.6rem 1.5rem' }}
                                    color={'secondary'}
                                    onClick={() => navigate(routes.path)}
                                >
                                    <p>{routes.label}</p>
                                </ListItemButton>
                            );
                        })}
                    </List>
                </div>
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

AdminLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
export default AdminLayout;
