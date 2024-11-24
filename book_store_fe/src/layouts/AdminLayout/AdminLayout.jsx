import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { CircularProgress, Collapse, List, ListItemButton, styled, Tooltip } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import style from './AdminLayout.module.scss';
import logoBook from '../../assets/image/Logo-BookBazaar-nobg.png';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AuthenticationContext } from '../../context/AuthenticationProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBarsStaggered,
    faBell,
    faBook,
    faChartLine,
    faChevronDown,
    faChevronUp,
    faComment,
    faGifts,
    faPercent,
    faTicket,
    faTicketSimple,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import { LibraryBooks, Logout } from '@mui/icons-material';
import { Badge } from 'react-bootstrap';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import NotificationsService from '../../service/NotificationService';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import UserService from '../../service/UserService';
const CustomTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(
    ({ theme }) => ({
        [`& .MuiTooltip-tooltip`]: {
            backgroundColor: '#fff',
            color: '#000',
            fontSize: '1rem',
            borderRadius: '0.5rem',
            padding: '1rem',
            border: '1px solid #d2d2d2',
            boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
            borderRadius: '0.5rem',
        },
    }),
);
const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: -4,
        border: `2px solid ${theme.palette.background.paper}`,
        padding: '0 4px',
        fontSize: '1.1rem',
    },
}));
const cx = classNames.bind(style);
function AdminLayout({ children }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const { authentication, logout } = useContext(AuthenticationContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElNotify, setAnchorElNotify] = useState(null);
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const open = Boolean(anchorEl);
    const openNotify = Boolean(anchorElNotify);
    const [newNotification, setNewNotification] = useState();
    const [notificationList, setNotificationList] = useState([]);
    const [isNotifying, setIsNotifying] = useState(false);
    const [user, setUser] = useState(null);

    const [isShowOpenMngProduct, setIsShowOpenMngProduct] = useState(false);
    const [isShowOpenDiscount, setIsShowOpenDiscount] = useState(false);

    const {
        data: notifications,
        error: notificationsErr,
        isLoading: notificationsLoading,
    } = useQuery({
        queryKey: ['notification', page],
        queryFn: () =>
            NotificationsService.getListNotification({ page: page, pageSize: 20 }).then((response) => response.data),
        retry: 1,
        enabled: !!openNotify,
    });

    const { data: qtyNotify } = useQuery({
        queryKey: ['qtyNotify'],
        queryFn: () => NotificationsService.getQtyNotifications().then((response) => response.data),
        retry: 1,
    });

    const markAsReadMutation = useMutation({
        mutationFn: () => NotificationsService.markAsRead(),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: () => queryClient.setQueryData(['qtyNotify'], 0),
    });
    useEffect(() => {
        if (notifications && page === 1) {
            setNotificationList(notifications.content);
        } else if (notifications && page > 1) {
            setNotificationList((prevnotifications) => [...prevnotifications, ...notifications.content]);
        }
        if (notifications) {
            markAsReadMutation.mutate();
        }
    }, [notifications]);

    useEffect(() => {
        let user =
            authentication?.user ||
            JSON.parse(localStorage.getItem('user')) ||
            JSON.parse(sessionStorage.getItem('user'));
        if (user === null) {
            UserService.getUserInfo()
                .then((res) => {
                    sessionStorage.setItem('user', JSON.stringify(res.data));
                    setUser(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            setUser(user);
        }
    }, []);

    useEffect(() => {
        let client = null;
        const connect = async () => {
            const sockJSFactory = () => new SockJS('http://localhost:8080/ws-notifications');
            client = Stomp.over(sockJSFactory);
            client.debug = () => {};
            client.connect(
                {},
                () => onConnected(client),
                (err) => console.error('Socket connection error:', err),
            );
        };
        connect();

        return () => {
            if (client) {
                client.disconnect();
            }
        };
    }, [user]);
    useEffect(() => {
        if (isNotifying) {
            setTimeout(() => {
                setIsNotifying(false);
            }, 4000);
        }
    }, [setIsNotifying, isNotifying]);
    const onConnected = async (client) => {
        client.subscribe(`/admin/notifications`, onMessageReceived);
    };

    const onMessageReceived = async (payload) => {
        const jsonPayload = JSON.parse(payload.body);
        setNewNotification(jsonPayload);
        queryClient.setQueryData(['notification'], (oldData) => {
            return [jsonPayload, ...(oldData || [])];
        });
        queryClient.setQueryData(['qtyNotify'], (oldData) => {
            return { qty: (oldData?.qty || 0) + 1 };
        });
        setIsNotifying(true);
    };

    const observer = useRef();
    const lastItemRef = useCallback(
        (node) => {
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && page < notifications?.totalPages) {
                    setPage((prevPage) => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [notifications],
    );
    return (
        <div className={cx('wrapper')}>
            <header className={cx('header')}>
                <div className={cx('logo')}>
                    <Link to="/admin/dashboard">
                        <img src={logoBook} alt="BookStore Logo" className={cx('logoImage')} />
                    </Link>
                </div>
                <div className='d-flex align-items-center gap-3'>
                    <CustomTooltip
                        placement="bottom-start"
                        open={isNotifying}
                        onClose={() => setIsNotifying(false)}
                        onOpen={() => setIsNotifying(true)}
                        title={
                            <>
                                <p className="fs-3 fw-semibold">{newNotification?.title}</p>
                                <p className="fs-5">{newNotification?.message}</p>
                            </>
                        }
                        disableHoverListener
                    >
                        <div className={cx('cart')} onClick={(event) => setAnchorElNotify(event.currentTarget)}>
                            <StyledBadge badgeContent={qtyNotify?.qty} color="primary">
                                <FontAwesomeIcon icon={faBell} size="xl" />
                            </StyledBadge>
                        </div>
                    </CustomTooltip>

                    <Menu
                        id="notify-menu"
                        anchorEl={anchorElNotify}
                        open={openNotify}
                        onClose={() => setAnchorElNotify(null)}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                            style: { width: '40rem' },
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
                        {notificationList?.map((noti, index) => (
                            <MenuItem
                                key={index}
                                onClick={() => setAnchorEl(null)}
                                className={cx('notifications-items')}
                                ref={index === notificationList?.length - 1 ? lastItemRef : null}
                            >
                                <Link to={noti.targetLink} className="d-flex align-items-center gap-2">
                                    <ListItemIcon
                                        className={cx('icon', {
                                            'notification-order-icon': noti.type === 'ORDER',
                                            'notification-voucher-icon': noti.type === 'PROMOTION',
                                            'notification-comment-icon': noti.type === 'REVIEW',
                                        })}
                                    >
                                        {noti.type === 'ORDER' ? (
                                            <LibraryBooks fontSize="small" />
                                        ) : noti.type === 'PROMOTION' ? (
                                            <FontAwesomeIcon icon={faTicketSimple} />
                                        ) : (
                                            <FontAwesomeIcon icon={faComment} />
                                        )}
                                    </ListItemIcon>
                                    <div className={cx('notification-content')}>
                                        <p className={cx('notification-title')}>{noti.title}</p>
                                        <p className={cx('notification-message')}>{noti.message}</p>
                                    </div>
                                </Link>
                            </MenuItem>
                        ))}
                        {notificationsLoading && (
                            <MenuItem>
                                <CircularProgress size={20} />
                                <span className="ms-4"> Đang tải... </span>
                            </MenuItem>
                        )}
                    </Menu>
                    <div
                        className={cx('cart')}
                        style={{ cursor: 'auto' }}
                        onClick={(event) => setAnchorEl(event.currentTarget)}
                    >
                        <FontAwesomeIcon icon={faUser} size="lg" color='#6c757d' />
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
                            <Link onClick={() => logout()}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Đăng xuất
                            </Link>
                        </MenuItem>
                    </Menu>
                </div>
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
                            selected={pathname === '/admin/sell'}
                            sx={{ padding: '0.6rem 1.5rem' }}
                            color={'secondary'}
                            onClick={() => navigate('/admin/sell')}
                        >
                            <img
                                src="https://bookbazaar-project.s3.ap-southeast-1.amazonaws.com/sell.svg"
                                alt="icon"
                                width={22}
                            />
                            <p className="ms-3 fw-bold fs-3">Bán hàng tại quầy</p>
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
                            <FontAwesomeIcon icon={faGifts} size="lg" />
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
                                <FontAwesomeIcon icon={faPercent} size="lg" />
                                <p className="ms-3 fw-bold fs-3">Đợt giảm giá</p>
                            </ListItemButton>
                            <ListItemButton
                                selected={pathname.startsWith('/admin/voucher')}
                                sx={{ padding: '0.6rem 1.5rem' }}
                                onClick={() => navigate('/admin/voucher')}
                            >
                                <FontAwesomeIcon icon={faTicket} size="lg" />
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
