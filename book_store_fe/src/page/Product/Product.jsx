import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FormControl, MenuItem, Pagination, Select } from '@mui/material';

import ProductsComponent from '../../component/ProductsComponent/ProductsComponent';
import style from './Product.module.scss';
import ProductService from '../../service/ProductService';
import { useQuery } from '@tanstack/react-query';
import ModalLoading from '../../component/Modal/ModalLoading/ModalLoading';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SideBarComponent from '../../component/SideBarComponent/SideBarComponent';
const cx = classNames.bind(style);

function Product() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [page, setPage] = useState(searchParams.get('p') || 1);
    const [orderBy, setOrderBy] = useState('newest');
    const navigate = useNavigate();

    const listOrderBy = [
        {
            code: 'newest',
            label: 'Hàng mới',
        },
        {
            code: 'top_seller',
            label: 'Bán chạy',
        },
        {
            code: 'price_asc',
            label: 'Giá thấp đến cao',
        },
        {
            code: 'price_desc',
            label: 'Giá cao đến thấp',
        },
    ];
    const {
        data: products,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['products', page, orderBy, searchParams.toString()],
        queryFn: () =>
            ProductService.getListProduct({
                sort: orderBy,
                pageSize: 20,
                page: page,
                categoryId: searchParams.get('c') || null,
                price: `${searchParams.get('min') || null},${searchParams.get('max') || null}`,
                publisher: searchParams.get('pub') ? decodeURIComponent(searchParams.get('pub')) : null,
                keyword: searchParams.get('q') ? decodeURIComponent(searchParams.get('q')) : null,
            }).then((response) => response.data),
        retry: 1,
    });
    if (error) {
        console.log(error);
    }

    const handleChangeOrderBy = (e) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('p');
        setSearchParams(Object.fromEntries(newSearchParams.entries()));
        setOrderBy(e.target.value);
    };
    const handleChangePage = (event, value) => {
        setPage(value);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('p', value);
        setSearchParams(Object.fromEntries(newSearchParams.entries()));
    };
    useEffect(() => {
        if (products) {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [products]);

    useEffect(() => {
        if (!searchParams.get('p')) {
            setPage(1);
        }
    }, [searchParams]);

    return (
        <div className={cx('d-flex justify-content-center', 'wrapper')}>
            <div className={cx('col-left col-lg-3 col-md-3 col-sm-12 col-xs-12')}>
                <SideBarComponent />
            </div>

            <div className={cx('col-main col-lg-9 col-md-9 col-sm-12 col-xs-12', 'main-body')}>
                <div className={cx('toolbar')}>
                    <p>Sắp xếp theo: </p>
                    <div>
                        <FormControl fullWidth size="small">
                            <Select
                                sx={{ borderRadius: '2rem' }}
                                defaultValue={'Hàng mới'}
                                value={orderBy}
                                onChange={handleChangeOrderBy}
                            >
                                {listOrderBy.map((orderBy, index) => {
                                    return (
                                        <MenuItem key={index} value={orderBy.code}>
                                            {orderBy.label}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </div>
                </div>
                <div className={cx('products')}>
                    {(() => {
                        const datas = products?.content;
                        if (datas && datas.length > 0) {
                            return datas.map((p) => (
                                    <ProductsComponent product={p} key={p.id} to={`/product/detail?id=${p.id}`} />
                            ));
                        } else {
                            return (
                                <h1 style={{ width: '100%', textAlign: 'center' }}>Không có sản phẩm nào phù hợp</h1>
                            );
                        }
                    })()}
                </div>
                <div className="d-flex justify-content-center mt-5 mb-3">
                    <Pagination
                        color="primary"
                        onChange={handleChangePage}
                        variant="outlined"
                        page={parseInt(page)}
                        count={products?.totalPages < 1 ? 1 : products?.totalPages}
                    />
                </div>
            </div>
            <ModalLoading isLoading={isLoading} />
        </div>
    );
}

export default Product;
