
import Button from '@mui/material/Button';
import Carousel from 'react-bootstrap/Carousel';
import image1 from '../../assets/image/1.png';
import image2 from '../../assets/image/2.png';
import image3 from '../../assets/image/3.png';
import classNames from 'classnames/bind';
import style from './Home.module.scss';
const cx = classNames.bind(style);




import style from './Home.module.scss'
const cx = classNames.bind(style);
function Home() {
    return (
        <div className={cx('carouselContainer')}>
            <Carousel interval={3000} fade controls={false}>
                <Carousel.Item>
                    <img
                        className={cx('d-block w-100', 'carouselImage')}
                        src={image1}
                        alt="Third slide"
                    />
                    <Carousel.Caption className={cx('carouselCaptionCustom')}>
                        <Button variant="contained" color="primary">Browse Store</Button>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className={cx('d-block w-100', 'carouselImage')}
                        src={image2}
                        alt="Third slide"
                    />
                    <Carousel.Caption className={cx('carouselCaptionCustom')}>
                        <Button variant="contained" color="secondary">Browse Store</Button>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className={cx('d-block w-100', 'carouselImage')}
                        src={image3}
                        alt="Third slide"
                    />
                    <Carousel.Caption className={cx('carouselCaptionCustom')}>
                        <Button variant="contained" color="success">Browse Store</Button>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>
        </div>
    );
}

export default Home;
