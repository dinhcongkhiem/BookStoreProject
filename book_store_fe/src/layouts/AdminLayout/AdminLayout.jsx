import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Collapse, List, ListItemButton } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import style from './AdminLayout.module.scss';
import logoBook from '../../assets/image/Logo-BookBazaar-nobg.png';
import { useContext, useState } from 'react';
import { AuthenticationContext } from '../../context/AuthenticationProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBarsStaggered,
    faBook,
    faChartLine,
    faChevronDown,
    faChevronUp,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { adminRoutes } from '../../routes/routes';
import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import { LibraryBooks, Logout, ManageAccounts } from '@mui/icons-material';
const cx = classNames.bind(style);
function AdminLayout({ children }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const { authentication, logout } = useContext(AuthenticationContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [isShowOpenMngProduct, setIsShowOpenMngProduct] = useState(false);
    const [isShowOpenDiscount, setIsShowOpenDiscount] = useState(false);
    return (
        <div className={cx('wrapper')}>
            <header className={cx('header')}>
                <div className={cx('logo')}>
                    <Link to="/">
                        <img src={logoBook} alt="BookStore Logo" className={cx('logoImage')} />
                    </Link>
                </div>
                <>
                    <div
                        className={cx('user')}
                        style={{ cursor: 'auto' }}
                        onClick={(event) => setAnchorEl(event.currentTarget)}
                    >
                        <FontAwesomeIcon icon={faUser} size="lg" />
                    </div>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => setAnchorEl(null)}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        sx={{ marginTop: '1rem' }}
                    >
                        <MenuItem onClick={() => setAnchorEl(null)}>
                            <ListItemIcon>
                                <ManageAccounts fontSize="small" />
                            </ListItemIcon>
                            <Link to="/admin/dashboard">Quản lý</Link>
                        </MenuItem>
                        <MenuItem onClick={() => setAnchorEl(null)}>
                            <Link to="/" onClick={() => logout()}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Đăng xuất
                            </Link>
                        </MenuItem>
                    </Menu>
                </>
            </header>

            <div className={cx('container')} style={{ minHeight: '70rem' }}>
                <div className={cx('nav-bar')}>
                    <List sx={{ paddingBottom: '0' }}>
                        <ListItemButton
                            selected={pathname === '/admin/dashboard'}
                            sx={{ padding: '0.6rem 1.5rem' }}
                            color={'secondary'}
                            onClick={() => navigate('/admin/dashboard')}
                        >
                            <FontAwesomeIcon icon={faChartLine} size="lg" />
                            <p className="ms-3 fw-bold fs-3">Thống kê</p>
                        </ListItemButton>
                        <ListItemButton
                            selected={pathname === '/admin/orderMng'}
                            sx={{ padding: '0.6rem 1.5rem' }}
                            color={'secondary'}
                            onClick={() => navigate('/admin/orderMng')}
                        >
                            <LibraryBooks fontSize="medium" sx={{ minWidth: 'none' }} />
                            <p className="ms-3 fw-bold fs-3">Đơn hàng</p>
                        </ListItemButton>
                        <ListItemButton
                            sx={{ padding: '0.6rem 1.5rem' }}
                            color={'secondary'}
                            onClick={() => setIsShowOpenMngProduct((prev) => !prev)}
                        >
                            <FontAwesomeIcon icon={faBook} size="lg" />
                            <p className="ms-3 fw-bold fs-3 me-4">Sản phẩm</p>
                            {isShowOpenMngProduct ? (
                                <FontAwesomeIcon icon={faChevronUp} />
                            ) : (
                                <FontAwesomeIcon icon={faChevronDown} />
                            )}
                        </ListItemButton>
                        <Collapse in={isShowOpenMngProduct} collapsedSize={0} className={cx('collapse-sub-item')}>
                            <ListItemButton
                                selected={pathname.startsWith('/admin/product')}
                                sx={{ padding: '0.6rem 1.5rem' }}
                                onClick={() => navigate('/admin/product')}
                            >
                                <FontAwesomeIcon icon={faChartLine} size="lg" />
                                <p className="ms-3 fw-bold fs-3">Quản lý sản phẩm</p>
                            </ListItemButton>
                            <ListItemButton
                                selected={pathname === '/admin/attributes'}
                                sx={{ padding: '0.6rem 1.5rem' }}
                                onClick={() => navigate('/admin/attributes')}
                            >
                                <FontAwesomeIcon icon={faBarsStaggered} size="lg" />
                                <p className="ms-3 fw-bold fs-3">Quản lý thuộc tính</p>
                            </ListItemButton>
                        </Collapse>
                        <ListItemButton
                            sx={{ padding: '0.6rem 1.5rem' }}
                            color={'secondary'}
                            onClick={() => setIsShowOpenDiscount((prev) => !prev)}
                        >
                            <FontAwesomeIcon icon={faBook} size="lg" />
                            <p className="ms-3 fw-bold fs-3 me-4">Giảm giá</p>
                            {isShowOpenDiscount ? (
                                <FontAwesomeIcon icon={faChevronUp} />
                            ) : (
                                <FontAwesomeIcon icon={faChevronDown} />
                            )}
                        </ListItemButton>
                        <Collapse in={isShowOpenDiscount} collapsedSize={0} className={cx('collapse-sub-item')}>
                            <ListItemButton
                                selected={pathname.startsWith('/admin/discount')}
                                sx={{ padding: '0.6rem 1.5rem' }}
                                onClick={() => navigate('/admin/discount')}
                            >
                                <FontAwesomeIcon icon={faChartLine} size="lg" />
                                <p className="ms-3 fw-bold fs-3">Đợt giảm giá</p>
                            </ListItemButton>
                            <ListItemButton
                                selected={pathname.startsWith('/admin/voucher')}
                                sx={{ padding: '0.6rem 1.5rem' }}
                                onClick={() => navigate('/admin/voucher')}
                            >
                                <FontAwesomeIcon icon={faBarsStaggered} size="lg" />
                                <p className="ms-3 fw-bold fs-3">Phiếu giảm giá</p>
                            </ListItemButton>
                        </Collapse>
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
