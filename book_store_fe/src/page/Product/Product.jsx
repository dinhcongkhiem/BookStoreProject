import { useState } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import {
    Checkbox,
    Collapse,
    FormControl,
    FormControlLabel,
    List,
    ListItemButton,
    MenuItem,
    Pagination,
    Select,
} from '@mui/material';
import Slider from '@mui/material/Slider';

import ProductsComponent from '../../component/ProductsComponent/ProductsComponent';
import style from './Product.module.scss';
const cx = classNames.bind(style);

function Product() {
    return (
        <div className={cx('d-flex justify-content-center', 'wrapper')}>
            <div className={cx('col-left col-lg-3 col-md-3 col-sm-12 col-xs-12', 'sidebar')}>
                <SideBarComponent />
            </div>

            <div className={cx('col-main col-lg-9 col-md-9 col-sm-12 col-xs-12', 'main-body')}>
                <MainBodyComponent />
                <div className="d-flex justify-content-center mt-5 mb-3">
                    <Pagination color="primary" variant="outlined" count={10} />
                </div>
            </div>
        </div>
    );
}

export default Product;

function SideBarComponent() {
    const [isShowMoreCategory, setShowMoreCategory] = useState(false);
    const [isShowMoreBublisher, setShowMoreBublisher] = useState(false);

    const [priceRange, setPriceRange] = useState([0, 2000000]);
    const [selectedPublisher, setSeletedPublisher] = useState(0);
    const handleChangePriceRange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const [isSelectedCategory, setSelectedCategory] = useState(0);
    const listCategory = [
        'Thiếu nhi',
        'Văn học',
        'Tâm Lý - Kỹ Năng Sống',
        'Manga - Comic',
        'Kinh tế',
        'Chính Trị - Pháp Lý - Triết Học',
        'Lịch Sử - Địa Lý - Tôn Giáo',
        'Từ Điển',
        'Âm Nhạc - Mỹ Thuật - Thời Trang',
    ];
    const listPublisher = [
        'Nhà Xuất Bản Kim ĐỒng',
        'Nhà Xất Bản Trẻ',
        'Tân Việt',
        'Nhã Nam',
        'Alpha Books',
        'First News',
        'MCBooks',
        'Skybooks',
    ];
    return (
        <>
            <div className={cx('category')}>
                <h4>Nhóm sản phẩm</h4>
                <Collapse in={isShowMoreCategory} collapsedSize={190}>
                    <List sx={{ paddingBottom: '0' }}>
                        <ListItemButton
                            sx={{ padding: '0.6rem 1.5rem' }}
                            selected={isSelectedCategory === 0}
                            onClick={() => setSelectedCategory(0)}
                            color={'secondary'}
                        >
                            <p>Tất cả</p>
                        </ListItemButton>
                        {listCategory.map((categoryName, index) => {
                            return (
                                <ListItemButton
                                    sx={{ padding: '0.6rem 1.5rem' }}
                                    selected={isSelectedCategory === index + 1}
                                    onClick={() => setSelectedCategory(index + 1)}
                                >
                                    <p>{categoryName}</p>
                                </ListItemButton>
                            );
                        })}
                    </List>
                </Collapse>
                <button className={cx('show-more-btn')} onClick={() => setShowMoreCategory((prev) => !prev)}>
                    {isShowMoreCategory ? (
                        <span>
                            Ẩn bớt <FontAwesomeIcon icon={faChevronUp} />
                        </span>
                    ) : (
                        <span>
                            Xem thêm <FontAwesomeIcon icon={faChevronDown} />
                        </span>
                    )}
                </button>
            </div>
            <div className={cx('price')}>
                <h4>Giá</h4>
                <p className={cx('label-range')}>
                    {priceRange[0].toLocaleString('vi-VN')}
                    <span>₫</span>
                    <span className={cx('price-separator')}>-</span>
                    {priceRange[1].toLocaleString('vi-VN')}
                    <span>₫</span>
                </p>

                <div className={cx('slide-price-range')}>
                    <Slider
                        getAriaLabel={() => 'Price range'}
                        value={priceRange}
                        onChange={handleChangePriceRange}
                        max={2000000}
                    />
                </div>
            </div>

            <div className={cx('publisher')}>
                <h4>Nhà cung cấp</h4>
                <Collapse in={isShowMoreBublisher} collapsedSize={210}>
                    {listPublisher.map((pusher, index) => {
                        return (
                            <div>
                                <FormControlLabel
                                    onChange={() => setSeletedPublisher((prev) => (prev === index ? -1 : index))}
                                    control={<Checkbox checked={selectedPublisher === index} />}
                                    label={<p className="label-publisher">{pusher}</p>}
                                />
                            </div>
                        );
                    })}
                </Collapse>
                <button className={cx('show-more-btn')} onClick={() => setShowMoreBublisher((prev) => !prev)}>
                    {isShowMoreBublisher ? (
                        <span>
                            Ẩn bớt <FontAwesomeIcon icon={faChevronUp} />
                        </span>
                    ) : (
                        <span>
                            Xem thêm <FontAwesomeIcon icon={faChevronDown} />
                        </span>
                    )}
                </button>
            </div>
        </>
    );
}

function MainBodyComponent() {
    const listProduct = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const listOrderBy = [
        {
            code: 1,
            label: 'Hàng mới',
        },
        {
            code: 2,
            label: 'Bán chạy',
        },
        {
            code: 3,
            label: 'Giá thấp đến cao',
        },
        {
            code: 4,
            label: 'Giá cao đến thấp',
        },
    ];
    return (
        <>
            <div className={cx('toolbar')}>
                <p>Sắp xếp theo: </p>
                <div>
                    <FormControl fullWidth size="small">
                        <Select
                            sx={{ borderRadius: '2rem' }}
                            defaultValue={'Hàng mới'}
                            // value={age}
                            // label="Age"
                            // onChange={handleChange}
                        >
                            {listOrderBy.map((orderBy) => {
                                return <MenuItem value={orderBy.code}>{orderBy.label}</MenuItem>;
                            })}
                        </Select>
                    </FormControl>
                </div>
            </div>
            <div className={cx('products')}>
                {listProduct.map(() => {
                    return <ProductsComponent />;
                })}
            </div>
        </>
    );
}
