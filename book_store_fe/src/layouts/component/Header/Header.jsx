import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';
import { Navbar, Container, Nav } from 'react-bootstrap';
import Tippy from '@tippyjs/react/headless';

import classNames from 'classnames/bind';

import logoBook from '../../../assets/image/Logo-BookBazaar-nobg.png';
import { AuthenticationContext } from '../../../context/AuthenticationProvider';
import style from './Header.module.scss';
const cx = classNames.bind(style);

function Header() {
    const { authentication, logout } = useContext(AuthenticationContext);

    useEffect(() => {
        console.log('hihi');
    }, []);
    return (
        <header className={cx('headerWrapper')}>
            <div className={cx('container')}>
                <div className={cx('logo')}>
                    <Link to="/">
                        <img src={logoBook} alt="BookStore Logo" className={cx('logoImage')} />
                    </Link>
                </div>
                <div className={cx('search')}>
                    <input type="text" placeholder="Tìm kiếm sách..." className={cx('searchInput')} />
                    <FontAwesomeIcon icon={faSearch} className={cx('searchIcon')} />
                </div>
                <div className={cx('action')}>
                    <div className={cx('cart')}>
                        <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                    </div>
                    {authentication.isAuthen ? (
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
                                <FontAwesomeIcon icon={faUser} size="lg" />
                            </div>
                        </Tippy>
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
