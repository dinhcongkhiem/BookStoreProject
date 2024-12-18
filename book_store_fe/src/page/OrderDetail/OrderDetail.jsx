import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Divider,
    Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import classNames from 'classnames/bind';
import style from './OrderDetail.module.scss';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import OrderService from '../../service/OrderService';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReviewProductModal from '../../component/Modal/ReviewProductModal/ReviewProductModal';
import { convertStatusOrderToVN, convertTypeOrderToVN } from '../../utills/ConvertData';
import ButtonInOrder from '../../component/ButtonInOrderComponent/ButtonInOrderComponent';

const cx = classNames.bind(style);

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(-1),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
}));

function OrderDetail({ onClose }) {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [reviewProduct, setReviewProduct] = useState(null);
    const [isShowModalReview, setIsShowModalReview] = useState(false);

    const handleReviewProduct = (product) => {
        setReviewProduct({
            productId: product.productId,
            thumbnailUrl: product.thumbnailUrl,
            name: product.productName,
        });
        setIsShowModalReview(true);
    };

    const { orderIdPath } = useParams();
    const { pathname } = useLocation();
    const {
        data: orderDataRes,
        error,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['orderDetail', orderIdPath],
        queryFn: () => OrderService.getOrderDetailByID(orderIdPath).then((res) => res.data),
        retry: 1,
        enabled: !!orderIdPath,
    });

    return (
        <Box className={cx('orderDetailContainer')}>
            {!pathname.startsWith('/admin') && (
                <div className={cx('orderDetailHeader')}>
                    <Typography variant="h4" className={cx('orderTitle')}>
                        Chi tiết đơn hàng {orderDataRes?.orderId} -{' '}
                        <span className={cx('orderStatus')}>{convertStatusOrderToVN(orderDataRes?.status)}</span>
                    </Typography>
                </div>
            )}
            <Grid container spacing={3} className={cx('infoSections')}>
                <Grid item xs={12} md={4}>
                    <SectionTitle className={cx('addressTitle')} variant="h6">
                        Thông tin khách hàng
                    </SectionTitle>
                    <StyledPaper>
                        <Typography variant="body1" gutterBottom>
                            {orderDataRes?.fullname}
                        </Typography>
                        {orderDataRes?.address !== null && (
                            <Typography variant="body2" className={cx('address')}>
                                Địa chỉ:
                                {`${orderDataRes?.address?.addressDetail}, ${orderDataRes?.address?.commune.label}, ${orderDataRes?.address?.district.label}, ${orderDataRes?.address?.province.label}`}
                            </Typography>
                        )}

                        {orderDataRes?.phoneNum !== null && (
                            <Typography variant="body2">Điện thoại: {orderDataRes?.phoneNum}</Typography>
                        )}
                    </StyledPaper>
                </Grid>

                {orderDataRes?.paymentType !== null && (
                    <Grid item xs={12} md={4}>
                        <SectionTitle className={cx('paymentTitle')} variant="h6">
                            Hình thức
                        </SectionTitle>
                        <StyledPaper>
                            <Typography variant="body1" gutterBottom>
                                <p className="m-0">Loại: {convertTypeOrderToVN(orderDataRes?.type)}</p>
                                <p className="m-0">
                                    Thanh toán:
                                    {orderDataRes?.paymentType === 'bank_transfer'
                                        ? ' Chuyển khoản ngân hàng'
                                        : orderDataRes?.paymentType === 'cash_on_delivery'
                                          ? ' Tiền mặt'
                                          : ' Tiền mặt và chuyển khoản'}
                                </p>
                            </Typography>
                        </StyledPaper>
                    </Grid>
                )}
                <Grid item xs={12} md={4}>
                    <SectionTitle className={cx('orderInfoTitle')} variant="h6">
                        Thông tin đơn hàng
                    </SectionTitle>
                    <StyledPaper>
                        <Typography variant="body1" gutterBottom>
                            Mã đơn hàng: {orderDataRes?.orderId}
                        </Typography>
                        <Typography variant="body2">
                            Ngày đặt hàng: {new Date(orderDataRes?.orderDate).toLocaleDateString('vi-VN')}
                        </Typography>
                        <Typography variant="body2">
                            Mã giảm giá: {orderDataRes?.voucher?.code || 'Không có'}
                        </Typography>
                    </StyledPaper>
                </Grid>
            </Grid>
            <TableContainer component={Paper} className={cx('productTable')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ whiteSpace: 'nowrap' }}>Sản phẩm</TableCell>
                            <TableCell align="right" style={{ whiteSpace: 'nowrap' }}>
                                Giá
                            </TableCell>
                            <TableCell align="right" style={{ whiteSpace: 'nowrap' }}>
                                Số lượng
                            </TableCell>
                            <TableCell align="right" style={{ whiteSpace: 'nowrap' }}>
                                Giảm giá
                            </TableCell>
                            <TableCell align="right" style={{ whiteSpace: 'nowrap' }}>
                                Thành tiền
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orderDataRes?.items.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <Box display="flex" className={cx('productInfo', 'LinkToProduct')}>
                                        <Box
                                            className={cx('productImageContainer')}
                                            onClick={() => {
                                                if (!pathname.startsWith('/admin')) {
                                                    navigate(`/product/detail?id=${product.productId}`);
                                                } else {
                                                    navigate(`/admin/product`);
                                                }
                                            }}
                                        >
                                            <img
                                                src={product.thumbnailUrl}
                                                alt={product.productId}
                                                className={cx('productImage')}
                                            />
                                        </Box>
                                        <Box className={cx('productDetails')}>
                                            <Typography
                                                variant="body1"
                                                className={cx('productName')}
                                                onClick={() => {
                                                    if (!pathname.startsWith('/admin')) {
                                                        navigate(`/product/detail?id=${product.productId}`);
                                                    } else {
                                                        navigate(`/admin/product`);
                                                    }
                                                }}
                                            >
                                                ID: {product.productId} <span className="mx-2 fw-bold">|</span>
                                                {product.productName}
                                            </Typography>
                                            {orderDataRes?.status === 'COMPLETED' && !pathname.startsWith('/admin') && (
                                                <Button
                                                    disabled={product.isReviewed}
                                                    color="primary"
                                                    startIcon={<RateReviewIcon />}
                                                    className={cx('actionButtonCompleted')}
                                                    onClick={() => handleReviewProduct(product)}
                                                    style={{ marginTop: '8px', textTransform: 'none' }}
                                                >
                                                    Đánh giá
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="right" className={cx('priceCell')}>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Typography noWrap>{product.originalPrice.toLocaleString('vi-VN')}</Typography>
                                        <Typography>&nbsp;₫</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{product.quantity}</TableCell>
                                <TableCell align="right" className={cx('priceCell')}>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Typography noWrap>{product.discount.toLocaleString('vi-VN')}</Typography>
                                        <Typography>&nbsp;₫</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right" className={cx('priceCell')}>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Typography noWrap>
                                            {(
                                                product.originalPrice * product.quantity -
                                                product.discount
                                            ).toLocaleString('vi-VN')}
                                        </Typography>
                                        <Typography>&nbsp;₫</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box className={cx('orderSummary')}>
                <Grid container justifyContent="flex-end">
                    <Grid item xs={12} md={6}>
                        <Box display="flex" justifyContent="space-between" className={cx('summaryRow')}>
                            <Typography>Tạm tính</Typography>
                            <Typography noWrap className={cx('priceCell')}>
                                {orderDataRes?.originalSubtotal.toLocaleString('vi-VN')} ₫
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" className={cx('summaryRow')}>
                            <Typography>Phí vận chuyển</Typography>
                            <Typography noWrap className={cx('priceCell')}>
                                {orderDataRes?.shippingFee.toLocaleString('vi-VN')} ₫
                            </Typography>
                        </Box>
                        {orderDataRes?.totalDiscount !== 0 && (
                            <Box display="flex" justifyContent="space-between" className={cx('summaryRow')}>
                                <Typography>Giảm giá từ Deal</Typography>
                                <Typography noWrap className={cx('priceCell')}>
                                    -{orderDataRes?.totalDiscount.toLocaleString('vi-VN')} ₫
                                </Typography>
                            </Box>
                        )}
                        {orderDataRes?.voucher !== null && orderDataRes?.voucher?.value !== 0 && (
                            <Box display="flex" justifyContent="space-between" className={cx('summaryRow')}>
                                <Typography>Giảm giá từ mã khuyến mãi</Typography>
                                <Typography noWrap className={cx('priceCell')}>
                                    -{orderDataRes?.voucher?.value.toLocaleString('vi-VN')} ₫
                                </Typography>
                            </Box>
                        )}

                        {orderDataRes?.amountPaid !== null && (
                            <>
                                <Box display="flex" justifyContent="space-between" className={cx('summaryRow')}>
                                    <Typography>Tiền khách đưa</Typography>
                                    <Typography noWrap className={cx('priceCell')}>
                                        {orderDataRes?.amountPaid.toLocaleString('vi-VN')} ₫
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" className={cx('summaryRow')}>
                                    <Typography>Tiền thừa</Typography>
                                    <Typography noWrap className={cx('priceCell')}>
                                        {(orderDataRes?.amountPaid - orderDataRes?.grandTotal).toLocaleString('vi-VN')}{' '}
                                        ₫
                                    </Typography>
                                </Box>
                            </>
                        )}

                        <Divider className={cx('summaryDivider')} />
                        <Box display="flex" justifyContent="space-between" className={cx('summaryTotal')}>
                            <Typography variant="h6">Tổng cộng</Typography>
                            <Typography
                                style={{ color: '#FF0000', fontWeight: 600 }}
                                variant="h6"
                                noWrap
                                className={cx('priceCell')}
                            >
                                {orderDataRes?.grandTotal.toLocaleString('vi-VN')} ₫
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <Box className={cx('orderActionButtons')}>
                <ButtonInOrder
                    status={orderDataRes?.status}
                    orderId={orderIdPath}
                    onClose={onClose}
                    refetch={refetch}
                    productIds={orderDataRes?.items.map((i) => i.productId).join(',')}
                />
            </Box>
            {!pathname.startsWith('/admin') && (
                <Button
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    className={cx('backButton')}
                    onClick={() => navigate('/order')}
                >
                    Quay lại
                </Button>
            )}
            {isShowModalReview && (
                <ReviewProductModal
                    open={isShowModalReview}
                    data={reviewProduct}
                    handleClose={() => {
                        setIsShowModalReview(false);
                        queryClient.invalidateQueries(['orderDetail', orderIdPath]);
                    }}
                />
            )}
        </Box>
    );
}

export default OrderDetail;
