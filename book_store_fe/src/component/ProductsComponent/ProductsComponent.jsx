import { Rating, Stack } from '@mui/material';

import classNames from 'classnames/bind';
import style from './ProductsComponent.module.scss';
const cx = classNames.bind(style);
function ProductsComponent({ className }) {
    return (
        <div className={cx('product', className)}>
            <div className={cx('thumbnail')}>
                <img
                    src="https://salt.tikicdn.com/cache/750x750/ts/product/e0/15/3d/37a4ab0ab9169654f9b8ea56ca72f013.jpg.webp"
                    alt="img-product"
                />
            </div>

            <div className={cx('product-properties')}>
                <h4>Không Diệt Không Sinh Đừng Sợ Hãi (TB5)</h4>
                <p>THÍCH NHẤT HẠNH</p>
                <div className={cx('ratingList')}>
                    <Stack spacing={1}>
                        <Rating name="half-rating-read" defaultValue={2.5} precision={0.5} readOnly size="small" />
                    </Stack>
                    <p className={cx('quantitySold')}>
                        Đã bán <span>2157</span>
                    </p>
                </div>
                <div className={cx('price')}>
                    <span>
                        99.235
                        <sup>₫</sup>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ProductsComponent;
