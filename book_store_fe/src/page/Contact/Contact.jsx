import React, { useRef, useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import classNames from 'classnames/bind';
import style from './Contact.module.scss';
import image1 from '../../assets/image/banner.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPhone, faMessage, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(style);

function Contact() {
    const form = useRef();
    const [showButton, setShowButton] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();

        emailjs.sendForm(
            'service_zoywzs5',
            'template_4amr11n',
            form.current,
            'NF6Zjilc07oxMSyM5'
        ).then(
            (result) => {
                console.log(result.text);
                toast.success('Gửi thành công!', {
                    position: 'top-center',
                });
            },
            (error) => {
                console.log(error.text);
                toast.error('Gửi thất bại!', {
                    position: 'top-center',
                });
            }
        );
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.pageYOffset > 300) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <div className={cx('page-container')}>
            <div className={cx('container')}>
                <img src={image1} alt="Banner" className={cx('image')} />
                <div className={cx('text-overlay')}>Contact</div>
            </div>
            <div className={cx('map')}>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.68925483665!2d105.74366821036193!3d21.045116180527433!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313455b3f6710da1%3A0x240105831b77a1a2!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1svi!2s!4v1725422444454!5m2!1svi!2s"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
            <div className={cx('title')}>
                <h1>Liên hệ</h1>
            </div>
            <div className={cx('content')}>
                <form ref={form} onSubmit={sendEmail} className={cx('input-contact')}>
                    <textarea name="message" placeholder='Nhập nội dung phản hồi' required />
                    <div className={cx('name-email-row')}>
                        <input type="text" name="name" placeholder='Nhập tên của bạn' required />
                        <input type="email" name="email" placeholder='Nhập địa chỉ email' required />
                    </div>
                    <input type="text" name="subject" placeholder='Nhập tiêu đề phản hồi' required />
                    <button type="submit" className={cx('submit-button')}>
                        Gửi
                    </button>
                </form>

                <div className={cx('contact-info')}>
                    <div className={cx('info-item')}>
                        <FontAwesomeIcon icon={faHouse} className={cx('icon')} />
                        <p>
                            <strong>Địa chỉ:</strong> Cao Đẳng FPT Polytechnic Hà Nội
                        </p>
                    </div>
                    <div className={cx('info-item')}>
                        <FontAwesomeIcon icon={faPhone} className={cx('icon')} />
                        <p>
                            <strong>Điện thoại:</strong> +84 123 456 789
                        </p>
                    </div>
                    <div className={cx('info-item')}>
                        <FontAwesomeIcon icon={faMessage} className={cx('icon')} />
                        <p>
                            <strong>Email:</strong> bookbazzar@gmail.com
                        </p>
                    </div>
                </div>
            </div>
            
            {showButton && (
                <button className={cx('back-to-top')} onClick={scrollToTop}>
                    <FontAwesomeIcon icon={faArrowUp} />
                </button>
            )}

            <ToastContainer />
        </div>
    );
}

export default Contact;
