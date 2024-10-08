import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import style from './SideBarComponent.module.scss';
import { Checkbox, Collapse, FormControlLabel, List, ListItemButton, Slider } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@tanstack/react-query';
import CatogoryService from '../../service/CategoryService';
import { useSearchParams } from 'react-router-dom';
import ProductService from '../../service/ProductService';
import useDebounce from '../../hooks/useDebounce';
import PublisherService from '../../service/Publisher';
const cx = classNames.bind(style);

function SideBarComponent() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSelectedCategory, setSelectedCategory] = useState(0);

    const [isShowMoreCategory, setShowMoreCategory] = useState(false);
    const [isShowMoreBublisher, setShowMoreBublisher] = useState(false);

    const [priceRange, setPriceRange] = useState([]);
    const [selectedPublisher, setSelectedPublisher] = useState([]);
    const debounceValue = useDebounce(priceRange, 600);

    const handleChangePriceRange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const handleCheckboxChange = (id) => {
        setSelectedPublisher((prev) => {
            if (prev.includes(id)) {
                return prev.filter((publisherId) => publisherId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleChangeCategory = (categoryId) => {
        if (categoryId === 0) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('c');
            setSearchParams(newSearchParams);
        } else {
            setSearchParams((prevParams) => {
                const newParams = new URLSearchParams(prevParams);
                newParams.set('c', categoryId);
                newParams.delete('p');
                return newParams;
            });
        }
        setSelectedCategory(categoryId);
    };

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => CatogoryService.getAll().then((response) => response.data),
        retry: 1,
    });
    const { data: priceRangeRes } = useQuery({
        queryKey: ['priceRange'],
        queryFn: () => ProductService.getPriceRange().then((response) => response.data),
        retry: 1,
    });
    const { data: publishers } = useQuery({
        queryKey: ['publishers'],
        queryFn: () => PublisherService.getAll().then((res) => res.data),
        retry: 1,
    });

    useEffect(() => {
        if (selectedPublisher.length > 0) {
            setSearchParams((prevParams) => {
                const newParams = new URLSearchParams(prevParams);
                newParams.set('pub', selectedPublisher);
                newParams.delete('p');
                return newParams;
            });
        } else {
            setSearchParams((prevParams) => {
                const newParams = new URLSearchParams(prevParams);
                newParams.delete('pub');
                newParams.delete('p');
                return newParams;
            });
        }
    }, [selectedPublisher]);

    useEffect(() => {
        const minPrice = searchParams.get('min');
        const maxPrice = searchParams.get('max');

        if (minPrice !== null && maxPrice !== null) {
            setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
        } else if (priceRangeRes) {
            setPriceRange([priceRangeRes?.min, priceRangeRes?.max]);
        }
    }, [searchParams, priceRangeRes]);

    useEffect(() => {
        if (
            (debounceValue[0] !== priceRangeRes?.min || debounceValue[1] !== priceRangeRes?.max) &&
            debounceValue[0] &&
            debounceValue[1]
        ) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('max', debounceValue[1]);
            newSearchParams.set('min', debounceValue[0]);

            setSearchParams(Object.fromEntries(newSearchParams.entries()));
        } else {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('max');
            newSearchParams.delete('min');
            setSearchParams(Object.fromEntries(newSearchParams.entries()));
        }
    }, [debounceValue]);
    return (
        <div className={cx('sidebar')}>
            <div className={cx('category')}>
                <h4>Nhóm sản phẩm</h4>
                <Collapse in={isShowMoreCategory} collapsedSize={190}>
                    <List sx={{ paddingBottom: '0' }}>
                        <ListItemButton
                            sx={{ padding: '0.6rem 1.5rem' }}
                            selected={isSelectedCategory === 0}
                            onClick={() => handleChangeCategory(0)}
                            color={'secondary'}
                        >
                            <p>Tất cả</p>
                        </ListItemButton>
                        {categories?.map((category, index) => {
                            return (
                                <ListItemButton
                                    key={index}
                                    sx={{ padding: '0.6rem 1.5rem' }}
                                    selected={isSelectedCategory === category?.id}
                                    onClick={() => handleChangeCategory(category?.id)}
                                >
                                    <p>{category?.name}</p>
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
                    {priceRange ? priceRange[0]?.toLocaleString('vi-VN') : priceRangeRes?.min?.toLocaleString('vi-VN')}
                    <span>₫</span>
                    <span className={cx('price-separator')}>-</span>
                    {priceRange ? priceRange[1]?.toLocaleString('vi-VN') : priceRangeRes?.max?.toLocaleString('vi-VN')}
                    <span>₫</span>
                </p>

                <div className={cx('slide-price-range')}>
                    <Slider
                        getAriaLabel={() => 'Price range'}
                        value={priceRange}
                        onChange={handleChangePriceRange}
                        min={priceRangeRes?.min}
                        max={priceRangeRes?.max}
                    />
                </div>
            </div>

            <div className={cx('publisher')}>
                <h4>Nhà cung cấp</h4>
                <Collapse in={isShowMoreBublisher} collapsedSize={225}>
                    {publishers?.map((pusher, index) => {
                        return (
                            <div key={index}>
                                <FormControlLabel
                                    sx={{ marginLeft: '.2rem' }}
                                    onChange={() => handleCheckboxChange(pusher.id)}
                                    control={<Checkbox checked={selectedPublisher.includes(pusher.id)} size="small" />}
                                    label={<p className="label-publisher">{pusher.name}</p>}
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
        </div>
    );
}

export default SideBarComponent;
