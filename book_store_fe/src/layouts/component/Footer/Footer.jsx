import classNames from 'classnames/bind';
import style from './Footer.module.scss';
import logoBook from '../../../assets/image/Logo-BookBazaar-nobg.png';
import { Fab } from '@mui/material';
import { AddIcCallOutlined } from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const cx = classNames.bind(style);

function Footer() {
    const [active, setActive] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;

            if (scrollPercent >= 10) {
                setActive(true);
            } else {
                setActive(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return (
        <footer className={cx('footerWrapper')}>
            <div className={cx('footerArea')}>
                <div className={cx('customContainer')}>
                    <div className={cx('customRow')}>
                        <div className={cx('colLarge', 'colMedium', 'colSmall')}>
                            <div className={cx('singleFooterCaption')}>
                                <div className={cx('footerLogo')}>
                                    <a href="#">
                                        <img src={logoBook} alt="Logo" />
                                    </a>
                                </div>
                                <div className={cx('footerTittle')}>
                                    <p>
                                        Hãy tận hưởng không gian riêng của bạn và chúng tôi sẽ giúp bạn kéo dài thời hạn
                                        ở cuối kỳ.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={cx('colMedium', 'colSmall')}>
                            <div className={cx('singleFooterCaption')}>
                                <div className={cx('footerTittle')}>
                                    <h4>Thể Loại Sách</h4>
                                    <ul>
                                        <li>
                                            <a href="#">Lịch Sử</a>
                                        </li>
                                        <li>
                                            <a href="#">Kinh Dị - Giật Gân</a>
                                        </li>
                                        <li>
                                            <a href="#">Chuyện Tình Yêu</a>
                                        </li>
                                        <li>
                                            <a href="#">Khoa Học Viễn Tưởng</a>
                                        </li>
                                        <li>
                                            <a href="#">Kinh Doanh</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={cx('colLarge', 'colMedium', 'colSmall')}>
                            <div className={cx('singleFooterCaption')}>
                                <div className={cx('footerTittle')}>
                                    <h4>Về chúng tôi</h4>
                                    <ul>
                                        <li>
                                            <a href="#">Số điện thoại: 0842888559</a>
                                        </li>
                                        <li>
                                            <a href="#">Email: bookbazaar@gmail.com</a>
                                        </li>
                                        <li>
                                            <a href="#">Địa chỉ: Cao Đẳng FPT Polytechnic Hà Nội</a>
                                        </li>
                                        <li>
                                            <a href="#">Ngày thành lập: 04/09/2024</a>
                                        </li>
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
                                    &copy; 2024 Bản quyền thuộc về | Được thực hiện với{' '}
                                    <i className="fa fa-heart" aria-hidden="true"></i> bởi{' '}
                                    <Link to="/">Book Bazaar</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={cx('floatBtn', { active: active })}
                onClick={() => {
                    window.scroll({
                        top: 0,
                    });
                }}
            >
                <Fab color="primary" size="medium">
                    <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: '2.5rem' }} />
                </Fab>
            </div>
        </footer>
    );
}

export default Footer;
