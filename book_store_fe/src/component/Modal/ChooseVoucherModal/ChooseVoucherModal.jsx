import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    InputAdornment,
    IconButton,
    Box,
    Button,
    Tooltip,
    DialogActions,
    styled,
    tooltipClasses,
} from '@mui/material';
import { LocalOffer as LocalOfferIcon, Cancel as CancelIcon, Info as InfoIcon } from '@mui/icons-material';
import classNames from 'classnames/bind';
import styles from './ChooseVoucherModal.module.scss';
import { useQuery } from '@tanstack/react-query';
import VoucherService from '../../../service/VoucherService';
import { formatDate } from '../../../utills/ConvertData';

const cx = classNames.bind(styles);

const CustomTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(
    ({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#f5f5f9',
            color: 'rgba(0, 0, 0, 0.87)',
            maxWidth: 550,
            fontSize: theme.typography.pxToRem(12),
            border: '1px solid #dadde9',
        },
    }),
);

function ChooseVoucherModal({ open, setOpen, setVoucher, voucher, grandTotal }) {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayedPromos, setDisplayedPromos] = useState([]);
    const [filteredPromos, setFilteredPromos] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const observer = useRef();

    const {
        data: vouchers,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['vouchers', page],
        queryFn: () => VoucherService.getByUser({page: page}).then((res) => res.data),
        retry: 1,
    });

    const lastPromoElementRef = useCallback(
        (node) => {
            if (isLoading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {                
                if (entries[0].isIntersecting && page < vouchers.totalPages) {
                    setPage((prevPage) => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [isLoading, vouchers]
    );


    useEffect(() => {
        if (vouchers) {
            setDisplayedPromos((prev) => [...prev, ...vouchers.content]);
        }
    }, [vouchers]);

    const handleApplyPromo = (promo) => {
        if (promo.id === voucher?.id) {
            setVoucher(null);
            return;
        } else {
            setVoucher(promo);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Chọn mã giảm giá</DialogTitle>
            <DialogContent>
                <div className={cx('search-container')}>
                    <TextField
                        placeholder="Tìm kiếm mã giảm giá..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LocalOfferIcon />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    {searchTerm ? (
                                        <IconButton onClick={() => setSearchTerm('')} className={cx('close-icon')}>
                                            <CancelIcon />
                                        </IconButton>
                                    ) : (
                                        <Box sx={{ width: '1.5rem' }} />
                                    )}
                                </InputAdornment>
                            ),
                            classes: {
                                input: cx('custom-textfield'),
                            },
                            style: { width: '42.5rem' },
                        }}
                    />
                    <Button className={cx('search-button')} variant="outlined" disabled={searchTerm === ''}>
                        Xác nhận
                    </Button>
                </div>
                {displayedPromos.length > 0 ? (
                    <>
                        {displayedPromos.map((promo, index) => (
                            <div
                                key={index}
                                ref={index === displayedPromos.length - 1 ? lastPromoElementRef : null}
                                className={cx('promo-item', {
                                    'selected-item': promo.id === voucher?.id,
                                    disable: promo.condition > grandTotal,
                                })}
                            >
                                <div className={cx('promo-content')}>
                                    <div className={cx('promo-info-icon')}>
                                        <CustomTooltip
                                            arrow={false}
                                            title={
                                                <div className={cx('tool-tip')}>
                                                    <div>
                                                        <span>Mã</span> {promo.code} <br />
                                                    </div>
                                                    <hr />
                                                    <div>
                                                        <span>Hạn sử dụng</span> {formatDate(promo.endDate)} <br />
                                                    </div>
                                                    <hr />
                                                    <div>
                                                        <span>Điều kiện</span>
                                                        {`
                                                        Giảm  ${
                                                            promo.type === 'PERCENT'
                                                                ? ' ' + promo.value + '% '
                                                                : ' ' + promo.value.toLocaleString('vi-VN') + '₫ '
                                                        }
                                                        Cho đơn hàng từ ${promo.condition.toLocaleString('vi-VN')} ₫
                                                        `}
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <IconButton className={cx('info-icon')}>
                                                <InfoIcon />
                                            </IconButton>
                                        </CustomTooltip>
                                    </div>
                                    <p className={cx('promo-title')}>
                                        {promo.name} - Giảm
                                        {promo.type === 'PERCENT'
                                            ? ' ' + promo.value + '%'
                                            : ' ' + promo.value.toLocaleString('vi-VN') + '₫'}{' '}
                                    </p>
                                    <p className={cx('promo-condition')}>
                                        Cho đơn hàng từ {promo.condition.toLocaleString('vi-VN')} ₫
                                    </p>
                                </div>
                                <div className={cx('promo-actions')}>
                                    <p className={cx('promo-expire')}>HSD: {formatDate(promo.endDate)}</p>
                                    {promo.condition > grandTotal ? (
                                        <img
                                            src="https://bookbazaar-project.s3.ap-southeast-1.amazonaws.com/unconditional.svg"
                                            alt="unconditional"
                                        />
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleApplyPromo(promo)}
                                            className={cx('apply-button')}
                                        >
                                            {promo.id === voucher?.id ? 'Bỏ chọn' : 'Áp dụng'}
                                        </Button>
                                     )} 
                                </div>
                            </div>
                        ))}
                        {filteredPromos.length > 3 && (
                            <Button onClick={() => setShowAll(!showAll)} className={cx('show-more-button')}>
                                {showAll ? 'Thu gọn' : 'Xem thêm'}
                            </Button>
                        )}
                    </>
                ) : (
                    <p>Không có mã giảm giá nào.</p>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="primary" onClick={() => setOpen(false)}>
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ChooseVoucherModal;