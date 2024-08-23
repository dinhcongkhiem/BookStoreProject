import classNames from 'classnames/bind';
import style from './Footer.module.scss';
import logoBook from '../../../assets/image/Logo-BookBazaar-nobg.png';

const cx = classNames.bind(style);

function Footer() {
    return (
        <footer className={cx('footerWrapper')}>
            <div className={cx('footerArea')}>
                <div className={cx('customContainer')}>
                    <div className={cx('customRow')}>
                        <div className={cx('colLarge', 'colMedium', 'colSmall')}>
                            <div className={cx('singleFooterCaption')}>
                                <div className={cx('footerLogo')}>
                                    <a href="/">
                                        <img src={logoBook} alt="Logo" style={{ width: '40px', height: 'auto' }} />
                                    </a>
                                </div>
                                <div className={cx('footerTittle')}>
                                    <p>
                                        Get the breathing space now, and we’ll extend your term at the other end year for go.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={cx('colMedium', 'colSmall')}>
                            <div className={cx('singleFooterCaption')}>
                                <div className={cx('footerTittle')}>
                                    <h4>Book Category</h4>
                                    <ul>
                                        <li><a href="#">History</a></li>
                                        <li><a href="#">Horror - Thriller</a></li>
                                        <li><a href="#">Love Stories</a></li>
                                        <li><a href="#">Science Fiction</a></li>
                                        <li><a href="#">Business</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={cx('colMedium', 'colSmall')}>
                            <div className={cx('singleFooterCaption')}>
                                <div className={cx('footerTittle')}>
                                    <h4>Other Categories</h4>
                                    <ul>
                                        <li><a href="#">Biography</a></li>
                                        <li><a href="#">Astrology</a></li>
                                        <li><a href="#">Digital Marketing</a></li>
                                        <li><a href="#">Software Development</a></li>
                                        <li><a href="#">Ecommerce</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={cx('colLarge', 'colMedium', 'colSmall')}>
                            <div className={cx('singleFooterCaption')}>
                                <div className={cx('footerTittle')}>
                                    <h4>Site Map</h4>
                                    <ul>
                                        <li><a href="#">Home</a></li>
                                        <li><a href="#">About Us</a></li>
                                        <li><a href="#">FAQs</a></li>
                                        <li><a href="#">Blog</a></li>
                                        <li><a href="#">Contact</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={cx('footerBottomArea')}>
                <div className={cx('customContainer')}>
                    <div className={cx('footerBorder')}>
                        <div className={cx('customRow')}>
                            <div className={cx('colFull')}>
                                <div className={cx('footerCopyRight')}>
                                    &copy; 2024 All rights reserved | This template is made with <i className="fa fa-heart" aria-hidden="true"></i> by <a href="#" target="_blank" rel="nofollow noopener">Book Bazaar</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
