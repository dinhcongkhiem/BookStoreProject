import Button from '@mui/material/Button';
import Carousel from 'react-bootstrap/Carousel';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import style from './Home.module.scss';
import image1 from '../../assets/image/BannerHome.png';
import image2 from '../../assets/image/2.png';
import image3 from '../../assets/image/3.png';
import classNames from 'classnames/bind';
import NextArrow from '../../component/ReactSlickComponent/NextArrow';
import PrevArrow from '../../component/ReactSlickComponent/PrevArrow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import ProductsComponent from '../../component/ProductsComponent/ProductsComponent';
import { useQuery } from '@tanstack/react-query';
import ProductService from '../../service/ProductService';

import ModalLoading from '../../component/Modal/ModalLoading/ModalLoading';
const cx = classNames.bind(style);
function Home() {
    const listImgSlide = [
        { url: image1, alt: 'First slide' },
        { url: image2, alt: 'First slide' },
        { url: image3, alt: 'First slide' },
    ];
    const settingsHotDeal = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        swipe: false,
        centerPadding: '100px',
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
    };

    const {
        data: productsNewest,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['products'],
        queryFn: () =>
            ProductService.getListProduct({ sort: 'newest', pageSize: 10, page: 1 }).then(
                (response) => response.data.content,
            ),
        retry: 1,
    });

    const { data: productsHotDeal, isLoading: isProductsHotDealLoading } = useQuery({
        queryKey: ['productsHotDeal'],
        queryFn: () =>
            ProductService.getListProduct({ sort: 'top_seller', pageSize: 10, page: 1 }).then(
                (response) => response.data.content,
            ),
        retry: 1,
    });
    if (error) {
        console.log(error);
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('carouselContainer')}>
                <Carousel interval={3000} fade controls={false}>
                    {listImgSlide.map((imgSlide, index) => {
                        return (
                            <Carousel.Item key={index}>
                                <img
                                    className={cx('d-block w-100', 'carouselImage')}
                                    src={imgSlide.url}
                                    alt={imgSlide.alt}
                                />
                            </Carousel.Item>
                        );
                    })}
                </Carousel>
            </div>
            <div className={cx('bestSelling')}>
                <div className={cx('headerSection')}>
                    <h3>Sách nổi bật</h3>
                    <Link to="/product?sort=top_seller">
                        Xem thêm
                        <span>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </span>
                    </Link>
                </div>
                <div className={cx('productContainer')}>
                    <Slider {...settingsHotDeal}>
                        {productsHotDeal?.map((product, key) => {
                            return (
                                <ProductsComponent
                                    product={product}
                                    to={`/product/detail?id=${product.id}`}
                                    key={key}
                                    className={cx('productBestSelling')}
                                />
                            );
                        })}
                    </Slider>
                </div>
            </div>
            <div className={cx('lastPushlishSection')}>
                <div className={cx('headerSection')}>
                    <h3>Sách mới nhất</h3>
                    <Link to="/product">
                        Xem thêm
                        <FontAwesomeIcon icon={faChevronRight} />
                    </Link>
                </div>
                <div className={cx('productContainer')}>
                    {Array.isArray(productsNewest) &&
                        productsNewest.map((product, key) => {
                            return (
                                <ProductsComponent
                                    product={product}
                                    to={`/product/detail?id=${product.id}`}
                                    key={key}
                                />
                            );
                        })}
                </div>
            </div>
            <ModalLoading isLoading={isLoading || isProductsHotDealLoading} />
        </div>
    );
}

export default Home;
