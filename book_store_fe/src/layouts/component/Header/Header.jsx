import { Fragment, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faComment, faSearch, faShoppingCart, faTicketSimple, faUser } from '@fortawesome/free-solid-svg-icons';
import { Navbar, Container, Nav } from 'react-bootstrap';

import classNames from 'classnames/bind';

import logoBook from '../../../assets/image/Logo-BookBazaar-nobg.png';
import { AuthenticationContext } from '../../../context/AuthenticationProvider';
import style from './Header.module.scss';
import {
    Autocomplete,
    Badge,
    CircularProgress,
    ListItemIcon,
    Menu,
    MenuItem,
    Popper,
    styled,
    TextField,
    Tooltip,
} from '@mui/material';
import { Logout, ManageAccounts, Cancel, LibraryBooks } from '@mui/icons-material';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import ProductService from '../../../service/ProductService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useDebounce from '../../../hooks/useDebounce';
import NotificationsService from '../../../service/NotificationService';
import UserService from '../../../service/UserService';
const cx = classNames.bind(style);

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
function Header() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const { authentication, logout } = useContext(AuthenticationContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElNotify, setAnchorElNotify] = useState(null);
    const open = Boolean(anchorEl);
    const openNotify = Boolean(anchorElNotify);
    const [newNotification, setNewNotification] = useState();
    const [notificationList, setNotificationList] = useState([]);

    const [page, setPage] = useState(1);
    const searchInputRef = useRef(null);
    const btnSearchRef = useRef(null);

    const [user, setUser] = useState(null);
    const [isNotifying, setIsNotifying] = useState(false);
    const [isFocusSearch, setIsFocusSearch] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [openOptions, setOpenOptions] = useState(false);
    const debouncedKeyword = useDebounce(keyword.trim(), 800);

    const {
        data: options,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['searchResult', debouncedKeyword],
        queryFn: () =>
            ProductService.getListProduct({ page: 1, pageSize: 5, keyword: debouncedKeyword }).then(
                (response) => response.data.content,
            ),
        retry: 1,
        enabled: !!debouncedKeyword,
    });

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

    const handleNavigateSearch = () => {
        if (keyword.trim().length > 0) {
            navigate(`/product?q=${encodeURIComponent(keyword.trim())}`);
        }
    };

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
        setKeyword('');
    }, [searchParams]);

    useEffect(() => {
        let client = null;
        const connect = async () => {
            const sockJSFactory = () => new SockJS('http://localhost:8080/ws-notifications');
            client = Stomp.over(sockJSFactory);
            client.debug = () => { };
            client.connect({}, () => onConnected(client), onError);
        };
        connect();

        return () => {
            if (client) {
                client.disconnect();
            }
        };
    }, [user]);

    const onConnected = async (client) => {
        user?.role === 'USER'
            ? client.subscribe(`/user/${user?.email}/notifications`, onMessageReceived)
            : client.subscribe(`/admin/notifications`, onMessageReceived);
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

    useEffect(() => {
        if (isNotifying) {
            setTimeout(() => {
                setIsNotifying(false);
            }, 4000);
        }
    }, [setIsNotifying, isNotifying]);

    const onError = (err) => {
        console.error('Socket connection error:', err);
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
        <header className={cx('headerWrapper')}>
            <div className={cx('container')}>
                <div className={cx('logo')}>
                    <Link to="/">
                        <img src={logoBook} alt="BookStore Logo" className={cx('logoImage')} />
                    </Link>
                </div>
                <div className={cx('search', { 'search-focus': isFocusSearch })}>
                    <Autocomplete
                        freeSolo
                        disableClearable
                        open={openOptions}
                        onOpen={() => setOpenOptions(true)}
                        onClose={() => setOpenOptions(false)}
                        options={keyword.length > 0 && options?.length > 0 ? options : []}
                        className={cx('textInputSearch')}
                        getOptionLabel={(option) => option?.name || ''}
                        ListboxComponent={(props) => <ul {...props} className={cx('custom-listbox')} />}
                        PopperComponent={(props) => <Popper {...props} className={cx('customPoper')} />}
                        inputValue={keyword}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                inputRef={searchInputRef}
                                placeholder="Tìm kiếm sách..."
                                onFocus={() => setIsFocusSearch(true)}
                                onBlur={() => {
                                    setIsFocusSearch(false);
                                }}
                                onChange={(e) => setKeyword(e.target.value)}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <Fragment>
                                            {keyword.length > 0 ? (
                                                isLoading ? (
                                                    <CircularProgress color="inherit" size={14} sx={{ opacity: 0.7 }} />
                                                ) : (
                                                    <button className={cx('clear-btn')} onClick={() => setKeyword('')}>
                                                        <Cancel />
                                                    </button>
                                                )
                                            ) : null}
                                        </Fragment>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li
                                {...props}
                                key={option.id}
                                className={cx('search-result')}
                                onClick={() => {
                                    navigate(`/product/detail?id=${option.id}`);
                                    setOpenOptions(false);
                                }}
                            >
                                <img src={option.thumbnail_url} alt={option.name} />
                                <div>
                                    <strong>{option.name}</strong>
                                    <p>
                                        {option.price.toLocaleString('vi-VN')}
                                        <span>₫</span>
                                    </p>
                                </div>
                            </li>
                        )}
                        filterOptions={(x) => x}
                    />
                    <button className={cx('search-btn')} onClick={handleNavigateSearch} ref={btnSearchRef}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>
                <div className={cx('action')}>
                    {authentication.isAuthen ? (
                        <>
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
                                        <FontAwesomeIcon icon={faBell} size="lg" />
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
                                        <div
                                            onClick={() => {
                                                navigate(noti.targetLink);
                                                setAnchorElNotify(null);
                                            }}
                                            className="d-flex align-items-center gap-2"
                                        >
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
                                        </div>
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
                                    <Link to="/user/info" className="d-flex align-items-center">
                                        <ListItemIcon>
                                            <ManageAccounts fontSize="small" />
                                        </ListItemIcon>
                                        Thông tin cá nhân
                                    </Link>
                                </MenuItem>
                                <MenuItem onClick={() => setAnchorEl(null)}>
                                    <Link to="/cart" className="d-flex align-items-center">
                                        <ListItemIcon>
                                            <FontAwesomeIcon icon={faShoppingCart} size="md" />
                                        </ListItemIcon>
                                        Giỏ hàng
                                    </Link>
                                </MenuItem>
                                <MenuItem onClick={() => setAnchorEl(null)}>
                                    <Link to="/order" className="d-flex align-items-center">
                                        <ListItemIcon>
                                            <LibraryBooks fontSize="small" />
                                        </ListItemIcon>
                                        Đơn hàng của tôi
                                    </Link>
                                </MenuItem>
                                <MenuItem onClick={() => setAnchorEl(null)} sx={{ alignItems: 'center' }}>
                                    <Link to="/" onClick={() => logout()} className="d-flex align-items-center">
                                        <ListItemIcon>
                                            <Logout fontSize="small" />
                                        </ListItemIcon>
                                        Đăng xuất
                                    </Link>
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <div className={cx('signin')}>
                            <Link to="/login">
                                <button type="button" className={cx('signinButton')}>
                                    Đăng nhập
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Navbar bg="light" expand="lg" className={cx('menuBar')}>
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
                        <Nav>
                            <Nav.Link as={Link} to="/">
                                Trang Chủ
                            </Nav.Link>
                            <Nav.Link as={Link} to="/product">
                                Sản Phẩm
                            </Nav.Link>
                            <Nav.Link as={Link} to="/about">
                                Giới Thiệu
                            </Nav.Link>
                            <Nav.Link as={Link} to="/contact">
                                Liên Hệ
                            </Nav.Link>

                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}

export default memo(Header);
