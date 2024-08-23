import classNames from 'classnames/bind';
import style from './Header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import logoBook from '../../../assets/image/Logo-BookBazaar-nobg.png';
import { Navbar, Container, Nav } from 'react-bootstrap';

const cx = classNames.bind(style);

function Header() {
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
                <div className={cx('cart')}>
                    <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                </div>
                <div className={cx('signin')}>
                    <Link to="/login">
                        <button type="button" className={cx('signinButton')}>Đăng nhập</button>
                    </Link>
                </div>
            </div>

            <Navbar bg="light" expand="lg" className={cx('menuBar')}>
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
                        <Nav>
                            <Nav.Link as={Link} to="/">Home</Nav.Link>
                            <Nav.Link as={Link} to="/categories">Categories</Nav.Link>
                            <Nav.Link as={Link} to="/about">About</Nav.Link>
                            <Nav.Link as={Link} to="/pages">Pages</Nav.Link>
                            <Nav.Link as={Link} to="/blog">Blog</Nav.Link>
                            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}

export default Header;
