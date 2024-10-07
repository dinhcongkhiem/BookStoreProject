import { Rating, Stack } from '@mui/material';

import classNames from 'classnames/bind';
import style from './ProductsComponent.module.scss';
import defaultProductImg from '../../assets/image/default-product-img.jpg';
const cx = classNames.bind(style);
function ProductsComponent({ product, className, onClick }) {
    return (
        <div className={cx('product', className)} onClick={onClick}>
            <div className={cx('thumbnail')}>
                {product?.thumbnail_url ? (
                    <img src={product?.thumbnail_url} alt={`product-thumbnail-${product?.id}`} />
                ) : (
                    <img src={defaultProductImg} alt={`product-thumbnail-${product?.id}`} />
                )}
            </div>

            <div className={cx('product-properties')}>
                <div>
                    <h4>{product?.name}</h4>
                    <p style={{ overflow: 'hidden', textWrap: 'nowrap' }}>{product?.authors?.map((a) => a.name)}</p>
                </div>
                <div>
                    <div className={cx('ratingList')}>
                        <Stack spacing={1}>
                            <Rating
                                name="half-rating-read"
                                defaultValue={product?.rating_avarage}
                                precision={0.5}
                                readOnly
                                size="small"
                            />
                        </Stack>
                        <p className={cx('quantitySold')}>
                            Đã bán <span>2157</span>
                        </p>
                    </div>
                    <div className={cx('price')}>
                        <span className={cx({discountPrice: product?.discount_rate !== 0})}>
                            {product?.price.toLocaleString('vi-VN')}
                            <sup>₫</sup>
                        </span>
                        {product?.discount_rate !== 0 && (
                            <span className={cx('discount-percent')}>-{product?.discount_rate}%</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductsComponent;
