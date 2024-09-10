import style from './About.module.scss';
import classNames from 'classnames/bind';
import image1 from '../../assets/image/banner.png';
import React, { useRef, useState, useEffect } from 'react';

import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const cx = classNames.bind(style);

function About() {
    const [showButton, setShowButton] = useState(false);
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
        <>
            <div className={cx('container')}>
                <img src={image1} alt="Banner" className={cx('image')} />
                <div className={cx('text-overlay')}>
                    About
                </div>
            </div>
            <div className={cx('content')}>
                <div className={cx('detail')}>
                    <h1><b>Câu chuyện của chúng tôi</b></h1>
                    <p>Tại BookBazzar, chúng tôi tự hào giới thiệu những câu chuyện và hình ảnh từ nền văn hóa phong phú của Việt Nam. Chúng tôi tin rằng mỗi cuốn sách đều có thể trở thành cầu nối kết nối độc giả với những trải nghiệm đa dạng. Từ những tác phẩm văn học cổ điển đến các sáng tác hiện đại, chúng tôi mang đến cho bạn những lựa chọn sách phong phú để khám phá.

                        Chúng tôi bắt đầu hành trình này với niềm đam mê với sách và mong muốn mang đến cho cộng đồng yêu sách ở Việt Nam một trải nghiệm mua sắm trực tuyến tiện lợi và phong phú. BookBazzar không chỉ là nơi bạn có thể tìm thấy những cuốn sách yêu thích mà còn là điểm đến để khám phá các tác phẩm của các tác giả nổi tiếng và những tác phẩm mới nhất.

                        Chúng tôi cam kết cung cấp dịch vụ khách hàng tận tâm và những sản phẩm chất lượng, đồng thời luôn cập nhật những xu hướng sách mới nhất để phục vụ nhu cầu của bạn. Cùng chúng tôi, hãy mở rộng tầm hiểu biết và đắm chìm trong thế giới sách!
                    </p>
                </div>
                <div className={cx('detail')}>
                    <h1><b>Mục tiêu của chúng tôi</b></h1>
                    <p>Tại BookBazzar, mục tiêu của chúng tôi là trở thành điểm đến hàng đầu cho tất cả những ai yêu thích sách tại Việt Nam. Chúng tôi tập trung vào việc cung cấp một trải nghiệm mua sắm trực tuyến dễ dàng và thú vị, với các lựa chọn sách đa dạng từ văn học, khoa học, nghệ thuật cho đến sách thiếu nhi.

                        Chúng tôi không ngừng nỗ lực để mang đến cho bạn những cuốn sách chất lượng cao và dịch vụ khách hàng tốt nhất. Bằng cách kết hợp giữa công nghệ tiên tiến và đội ngũ nhân viên chuyên nghiệp, chúng tôi mong muốn mang đến cho bạn một trải nghiệm mua sắm không chỉ hiệu quả mà còn ấm áp và thân thiện.

                        Chúng tôi cũng luôn lắng nghe phản hồi từ khách hàng để không ngừng cải thiện dịch vụ và sản phẩm của mình. Hãy cùng BookBazzar khám phá những cuốn sách mới, mở rộng tầm hiểu biết và nuôi dưỡng niềm đam mê đọc sách của bạn!
                    </p>
                </div>
            </div>
            {showButton && (
                <button className={cx('back-to-top')} onClick={scrollToTop}>
                    <FontAwesomeIcon icon={faArrowUp} />
                </button>
            )}

        </>
    );
}

export default About;
