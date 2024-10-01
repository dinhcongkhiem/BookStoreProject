import { useRef, useState } from 'react';
import classNames from 'classnames/bind';
import Slider from 'react-slick';
import { useQuery } from '@tanstack/react-query';
import { Button, Rating } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import ProductsComponent from '../../component/ProductsComponent/ProductsComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';

import NextArrow from '../../component/ReactSlickComponent/NextArrow';
import PrevArrow from '../../component/ReactSlickComponent/PrevArrow';

import style from './ProductDetail.module.scss';
import ProductService from '../../service/ProductService';
import DetailInfoProductComponent from '../../component/DetailInfoProductComponent/DetailInfoProductComponent';
import ConfirmModal from '../../component/Modal/ConfirmModal/ConfirmModal';
import ModalLoading from '../../component/Modal/ModalLoading/ModalLoading';
import UpdateAddressModal from '../../component/Modal/UpdateAddressModal/UpdateAddressModal';
import { Gallery, Item } from 'react-photoswipe-gallery';

const cx = classNames.bind(style);
function ProductDetail() {
    const [activeIndex, setActiveIndex] = useState(1);
    const [quantityProduct, setQuantityProduct] = useState(1);
    const {
        data: product,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['products'],
        queryFn: () => ProductService.getProductDetail().then((response) => response.data),
        retry: 1,
    });

    const testListHotDeal = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const settingsHotDeal = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        swipe: false,
        centerPadding: '100px',
        nextArrow: <NextArrow classNames={cx('next-arrow')} />,
        prevArrow: <PrevArrow classNames={cx('prev-arrow')} />,
    };
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleConfirm = () => {
        // Xử lý hành động xác nhận ở đây
        console.log('Action Confirmed!');
        setOpen(false);
    };
    const openGalleryRef = useRef(null);
    // if (error) return <h1 style={{ textAlign: 'center', margin: '10rem 0' }}>VUI LÒNG THỬ LẠI</h1>;
    // if (isLoading) return <ModalLoading isLoading={true} />;
    return (
        <>
            <div className="row my-5">
                <div className={cx('col-5', 'left')}>
                    <div className={cx('stiky-element', 'block')}>
                        <div className={cx('wrapper-img')}>
                            <div className={cx('current-img')}>
                                <img
                                    src={product?.images[activeIndex]?.urlImage}
                                    alt="Img1"
                                    onClick={() => openGalleryRef.current && openGalleryRef.current()}
                                />
                            </div>
                            <div className={cx('list-img')}>
                                <Slider {...settingsHotDeal}>
                                    {product?.images?.map((image, index) => {
                                        console.log(image);

                                        return (
                                            <div
                                                className={cx('img-item', { active: index === activeIndex })}
                                                onClick={() => setActiveIndex(index)}
                                            >
                                                <img src={image?.urlImage} alt={image?.nameImage} />
                                            </div>
                                        );
                                    })}
                                </Slider>
                            </div>
                            <div className={cx('ImageGallery')}>
                                <Gallery>
                                    {product?.images?.map((img, index) => (
                                        <Item
                                            key={index}
                                            original={img.urlImage}
                                            thumbnail={img.urlImage}
                                            width="1600"
                                            height="1600"
                                        >
                                            {({ ref, open }) => {
                                                if (index === activeIndex) {
                                                    openGalleryRef.current = open;
                                                }
                                                return (
                                                    <img
                                                        className={cx('img-item-gallery')}
                                                        ref={ref}
                                                        onClick={open}
                                                        src={img.urlImage}
                                                        alt={img.nameImage}
                                                    />
                                                );
                                            }}
                                        </Item>
                                    ))}
                                </Gallery>
                            </div>
                        </div>

                        <div className={cx('action')}>
                            <Button
                                variant="outlined"
                                fullWidth
                                size="large"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Thêm vào giỏ hàng
                            </Button>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Mua ngay
                            </Button>
                        </div>
                    </div>
                </div>
                <div className={cx('col-7', 'right')}>
                    <div className={cx('info', 'block')}>
                        <h4>{product?.name}</h4>
                        <div className="row mb-2">
                            <div className="col-6">
                                <span>Tác giả:</span>
                                {product?.authors.map((author, index) => (
                                    <span key={index}>
                                        <Link to={`/product/authors=${author.name}`}>{author.name}</Link>
                                        {index < product?.authors.length - 1 && ', '}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="d-flex">
                            <div className="d-flex align-items-center">
                                <Rating
                                    name="half-rating-read"
                                    defaultValue={product?.rating_average}
                                    precision={0.5}
                                    readOnly
                                    size="small"
                                    sx={{ marginRight: '0.3rem' }}
                                />
                                <span style={{ color: '#F6A500' }}>({product?.review_count} Đánh giá)</span>
                            </div>
                            <span className={cx('space-line')}>|</span>
                            <div className={cx('quantity-sold')}>
                                Đã bán <span>{product?.quantity_sold || 0}</span>
                            </div>
                        </div>
                        <div className={cx('price')}>
                            <p className={cx('current-price')}>{product?.price.toLocaleString('vi-VN')}₫</p>
                            <p>
                                {product?.original_price !== product?.price && (
                                    <span className={cx('original-price')}>
                                        {product?.original_price?.toLocaleString('vi-VN')} ₫
                                    </span>
                                )}
                                {product?.discount_rate !== 0 && <span className={cx('discount-percent')}>{}%</span>}
                            </p>
                        </div>
                    </div>
                    <div className={cx('shipping-info', 'block')}>
                        <h5 className={cx('title')}>Thông tin vận chuyển</h5>
                        <div className="d-flex align-items-center px-4">
                            <p>
                                Giao hàng tới: <span>Số ACBCD, Phường Cầu Diễn, Quận Một Mình, Hà Nội</span>
                            </p>
                            <Button sx={{ textTransform: 'none', marginLeft: '1rem' }} onClick={handleOpen}>
                                Thay đổi
                            </Button>
                        </div>
                        <div className="d-flex align-items-center mt-5">
                            <label htmlFor="qty" style={{ fontWeight: '600' }}>
                                Số lượng:
                            </label>
                            <div className={cx('quantity-container')}>
                                <button
                                    className={cx('quantity-btn')}
                                    onClick={() => setQuantityProduct((prev) => prev - 1)}
                                    disabled={quantityProduct <= 1}
                                >
                                    <RemoveIcon />
                                </button>

                                <input
                                    name="qty"
                                    type="number"
                                    className={cx('quantity-input')}
                                    value={quantityProduct}
                                    min="1"
                                    max={product?.quantity}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                    }}
                                    onChange={(e) =>
                                        setQuantityProduct(
                                            e.target.value <= product?.quantity ? e.target.value : product?.quantity,
                                        )
                                    }
                                    onBlur={(e) => {
                                        e.target.value <= 0 && setQuantityProduct(1);
                                    }}
                                />
                                <button
                                    className={cx('quantity-btn')}
                                    onClick={() => setQuantityProduct((prev) => parseInt(prev) + 1)}
                                    disabled={quantityProduct >= product?.quantity}
                                >
                                    <AddIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={cx('detail-info', 'block')}>
                        <h5 className={cx('title', 'mb-3')}>Thông tin chi tiết</h5>
                        <DetailInfoProductComponent
                            isLink={true}
                            label={'Tác giả'}
                            value={product?.authors?.map((item) => item.name)}
                        />
                        <DetailInfoProductComponent
                            isLink={true}
                            label={'Nhà phát hành'}
                            value={product?.publisher?.name}
                        />
                        <DetailInfoProductComponent isLink={false} label={'NXB'} value={product?.manufacturer} />
                        <DetailInfoProductComponent
                            isLink={false}
                            label={'Năm XB'}
                            value={product?.year_of_publication}
                        />
                        <DetailInfoProductComponent isLink={false} label={'Kích thước'} value={product?.size} />
                        <DetailInfoProductComponent
                            isLink={false}
                            label={'Số trang'}
                            value={product?.number_of_pages}
                        />
                        <DetailInfoProductComponent
                            isLink={false}
                            label={'Loại bìa'}
                            value={product?.coverType === 'SOFTCOVER' ? 'Bìa mềm' : 'Bìa cứng'}
                        />
                    </div>
                    <div className={cx('description', 'block', 'm-0')}>
                        <h5 className={cx('title', 'mb-4')}>Mô tả sản phẩm</h5>

                        <p
                            className="mx-4"
                            dangerouslySetInnerHTML={{
                                __html: product?.description?.replace(/\\u003c/g, '<').replace(/\\u003e/g, '>'),
                            }}
                        ></p>
                    </div>
                </div>
            </div>
            <div className={cx('related-products', 'block')}>
                <h5 className={cx('title', 'mb-4', 'text-uppercase')}>Sản phẩm liên quan</h5>
                <div className="px-5">
                    <Slider {...settingsHotDeal}>
                        {testListHotDeal.map(() => {
                            return <ProductsComponent className={cx('product')} />;
                        })}
                    </Slider>
                </div>
            </div>
            <div className={cx('rating-products', 'block')}>
                <h5 className={cx('title', 'mb-4')}>Đánh giá sản phẩm</h5>
                <div className="d-flex gap-5">
                    <div className="col-4 d-flex gap-3">
                        <div className="d-flex flex-column align-items-center gap-1">
                            <div className={cx('rating-average')}>
                                4.5<span>/5</span>
                            </div>
                            <Rating
                                defaultValue={4.5}
                                precision={0.5}
                                readOnly
                                size="medium"
                                sx={{ marginRight: '0.3rem' }}
                            />
                            <span style={{ color: '#7a7e7f' }}>(6 đánh giá)</span>
                        </div>
                        <div className="flex-grow-1">
                            <div className={'d-flex align-items-center'}>
                                <span className={cx('rating-label')}>5 sao</span>
                                <div className={cx('review-rating')}>
                                    <div style={{ width: '80%' }}></div>
                                </div>
                                <span>4</span>
                            </div>
                            <div className={'d-flex align-items-center'}>
                                <span className={cx('rating-label')}>4 sao</span>
                                <div className={cx('review-rating')}>
                                    <div></div>
                                </div>
                                <span>0</span>
                            </div>
                            <div className={'d-flex align-items-center'}>
                                <span className={cx('rating-label')}>3 sao</span>
                                <div className={cx('review-rating')}>
                                    <div style={{ width: '20%' }}></div>
                                </div>
                                <span>2</span>
                            </div>
                            <div className={'d-flex align-items-center'}>
                                <span className={cx('rating-label')}>2 sao</span>
                                <div className={cx('review-rating')}>
                                    <div></div>
                                </div>
                                <span>0</span>
                            </div>
                            <div className={'d-flex align-items-center'}>
                                <span className={cx('rating-label')}>1 sao</span>
                                <div className={cx('review-rating')}>
                                    <div></div>
                                </div>
                                <span>0</span>
                            </div>
                        </div>
                    </div>
                    <div className={cx('flex-grow-1', 'comment')}>
                        <div className={cx('comment-item')}>
                            <div className={cx('comment-info')}>
                                <p className={cx('user-name')}>Dinh Cong Khiem</p>
                                <p className={cx('comment-date')}>03/08/2024</p>
                            </div>
                            <p className={cx('comment-value')}>
                                Sách hay lắm mn ơi,đọc sẽ hiểu được thêm về tuổi thơ của Bác Hồ và những nguyên nhân gì
                                tác động khiến Bác ra đi tìm đường cứu nước,tuyệt vời nhe????❤️tiểu thuyết của Sơn Tùng
                                cuốn mà hay lắm.
                            </p>

                            <Button
                                size="small"
                                sx={{ textTransform: 'none', marginTop: '1rem', marginLeft: '1.5rem' }}
                            >
                                <FontAwesomeIcon icon={faThumbsUp} /> <span className="ms-3">Thích (0)</span>
                            </Button>
                        </div>
                        <div className={cx('comment-item')}>
                            <div className={cx('comment-info')}>
                                <p className={cx('user-name')}>Dinh Cong Khiem</p>
                                <p className={cx('comment-date')}>03/08/2024</p>
                            </div>
                            <p className={cx('comment-value')}>
                                Sách hay lắm mn ơi,đọc sẽ hiểu được thêm về tuổi thơ của Bác Hồ và những nguyên nhân gì
                                tác động khiến Bác ra đi tìm đường cứu nước,tuyệt vời nhe????❤️tiểu thuyết của Sơn Tùng
                                cuốn mà hay lắm.
                            </p>

                            <Button
                                size="small"
                                sx={{ textTransform: 'none', marginTop: '1rem', marginLeft: '1.5rem' }}
                            >
                                <FontAwesomeIcon icon={faThumbsUp} /> <span className="ms-3">Thích (0)</span>
                            </Button>
                        </div>
                        <div className={cx('comment-item')}>
                            <div className={cx('comment-info')}>
                                <p className={cx('user-name')}>Dinh Cong Khiem</p>
                                <p className={cx('comment-date')}>03/08/2024</p>
                            </div>
                            <p className={cx('comment-value')}>
                                Sách hay lắm mn ơi,đọc sẽ hiểu được thêm về tuổi thơ của Bác Hồ và những nguyên nhân gì
                                tác động khiến Bác ra đi tìm đường cứu nước,tuyệt vời nhe????❤️tiểu thuyết của Sơn Tùng
                                cuốn mà hay lắm.
                            </p>

                            <Button
                                size="small"
                                sx={{ textTransform: 'none', marginTop: '1rem', marginLeft: '1.5rem' }}
                            >
                                <FontAwesomeIcon icon={faThumbsUp} /> <span className="ms-3">Thích (0)</span>
                            </Button>
                        </div>
                        <div className={cx('comment-item')}>
                            <div className={cx('comment-info')}>
                                <p className={cx('user-name')}>Dinh Cong Khiem</p>
                                <p className={cx('comment-date')}>03/08/2024</p>
                            </div>
                            <p className={cx('comment-value')}>
                                Sách hay lắm mn ơi,đọc sẽ hiểu được thêm về tuổi thơ của Bác Hồ và những nguyên nhân gì
                                tác động khiến Bác ra đi tìm đường cứu nước,tuyệt vời nhe????❤️tiểu thuyết của Sơn Tùng
                                cuốn mà hay lắm.
                            </p>

                            <Button
                                size="small"
                                sx={{ textTransform: 'none', marginTop: '1rem', marginLeft: '1.5rem' }}
                            >
                                <FontAwesomeIcon icon={faThumbsUp} /> <span className="ms-3">Thích (0)</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <UpdateAddressModal
                open={open}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa mục này không?"
            />
        </>
    );
}

export default ProductDetail;
