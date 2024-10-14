import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { List, ListItemButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import style from './AdminLayout.module.scss';
import logoBook from '../../assets/image/Logo-BookBazaar-nobg.png';
import { useContext, useState } from 'react';
import { AuthenticationContext } from '../../context/AuthenticationProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { adminRoutes } from '../../routes/routes';
import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import { Logout, ManageAccounts } from '@mui/icons-material';
const cx = classNames.bind(style);
function AdminLayout({ children }) {
    const navigate = useNavigate();
    const { authentication, logout } = useContext(AuthenticationContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
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
                            <Link to="/user">Thông tin cá nhân</Link>
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
                        {adminRoutes.map((routes) => {
                            if (!routes.label) {
                                return;
                            }
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
