import { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';
import { Navbar, Container, Nav } from 'react-bootstrap';

import classNames from 'classnames/bind';

import logoBook from '../../../assets/image/Logo-BookBazaar-nobg.png';
import { AuthenticationContext } from '../../../context/AuthenticationProvider';
import style from './Header.module.scss';
import { Autocomplete, CircularProgress, ListItemIcon, Menu, MenuItem, Popper, TextField } from '@mui/material';
import { Logout, ManageAccounts, Clear, Cancel } from '@mui/icons-material';

import ProductService from '../../../service/ProductService';
import { useQuery } from '@tanstack/react-query';
import useDebounce from '../../../hooks/useDebounce';
const cx = classNames.bind(style);

function Header() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { authentication, logout } = useContext(AuthenticationContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const searchInputRef = useRef(null);
    const btnSearchRef = useRef(null);

    const [isFocusSearch, setIsFocusSearch] = useState(false);
    const open = Boolean(anchorEl);
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
    const handleNavigateSearch = () => {
        if( keyword.trim().length > 0) {
            navigate(`/product?q=${encodeURIComponent(keyword)}`);
        }
    };
    useEffect(() => {
        const handleKeyPress = (e) => {            
            console.table({key: e.key, acttive: document.activeElement === searchInputRef.current, keyword: keyword.trim().length > 0});
            
            if (e.key === 'Enter' && document.activeElement === searchInputRef.current && keyword.trim().length > 0) {                
                btnSearchRef.current.click();
            }
        };
        window.addEventListener('keypress', handleKeyPress);
        return () => {
            window.removeEventListener('keypress', handleKeyPress);
        };
    }, []);

    useEffect(() => {
        setKeyword("")
    }, [searchParams]);

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

                    <span></span>
                    <button className={cx('search-btn')} onClick={handleNavigateSearch} ref={btnSearchRef}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>
                <div className={cx('action')}>
                    <Link to="/cart">
                        <div className={cx('cart')}>
                            <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                        </div>
                    </Link>
                    {authentication.isAuthen ? (
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
                                    <Link to="/user" className="d-flex align-items-center">
                                        <ListItemIcon>
                                            <ManageAccounts fontSize="small" />
                                        </ListItemIcon>
                                        Thông tin cá nhân
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
                                Home
                            </Nav.Link>
                            <Nav.Link as={Link} to="/product">
                                Products
                            </Nav.Link>
                            <Nav.Link as={Link} to="/pages">
                                Pages
                            </Nav.Link>
                            <Nav.Link as={Link} to="/blog">
                                Blog
                            </Nav.Link>
                            <Nav.Link as={Link} to="/about">
                                About
                            </Nav.Link>
                            <Nav.Link as={Link} to="/contact">
                                Contact
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}

export default Header;
