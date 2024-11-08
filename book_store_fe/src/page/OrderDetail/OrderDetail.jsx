import React from 'react';
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
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReplayIcon from '@mui/icons-material/Replay';
import { useQuery } from '@tanstack/react-query';
import OrderService from '../../service/OrderService';
import { useNavigate, useParams } from 'react-router-dom';

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

function OrderDetail() {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const navigate = useNavigate();
    const { orderIdPath } = useParams();
    const {
        data: orderDataRes,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['orderDetail', orderIdPath],
        queryFn: () => OrderService.getOrderDetailByID(orderIdPath).then((res) => res.data),
        retry: 1,
        enabled: !!orderIdPath,
    });

    const convertStatusToVN = (status) => {
        switch (status) {
            case 'AWAITING_PAYMENT':
                return 'Chờ thanh toán';
            case 'PROCESSING':
                return 'Đang xử lý';
            case 'SHIPPING':
                return 'Đang vận chuyển';
            case 'COMPLETED':
                return 'Đã giao';
            case 'CANCELED':
                return 'Đã hủy';
            default:
                return '';
        }
    };

    function renderActionButtons(status) {
        switch (status) {
            case 'AWAITING_PAYMENT':
                return (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<PaymentIcon />}
                            className={cx('actionButton', 'payButton')}
                        >
                            Thanh toán lại
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<CancelIcon />}
                            className={cx('actionButton', 'cancelButton')}
                        >
                            Hủy đơn hàng
                        </Button>
                    </>
                );
            case 'COMPLETED':
                return (
                    <>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<RateReviewIcon />}
                            className={cx('actionButton', 'reviewButton')}
                        >
                            Đánh giá
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<ReplayIcon />}
                            className={cx('actionButton', 'reorderButton')}
                        >
                            Mua lại
                        </Button>
                    </>
                );
            case 'CANCELED':
                return (
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ReplayIcon />}
                        className={cx('actionButton', 'reorderButton')}
                    >
                        Mua lại
                    </Button>
                );
            default:
                return null;
        }
    }

    return (
        <Box className={cx('orderDetailContainer')}>
            <div className={cx('orderDetailHeader')}>
                <Typography variant="h4" className={cx('orderTitle')}>
                    Chi tiết đơn hàng {orderDataRes?.orderId} -{' '}
                    <span className={cx('orderStatus')}>{convertStatusToVN(orderDataRes?.status)}</span>
                </Typography>
                <Typography variant="body2" className={cx('orderDate')}>
                    Ngày đặt hàng:{' '}
                    {new Date(orderDataRes?.orderDate).toLocaleDateString('vi-VN').split('/').reverse().join('-')}
                </Typography>
            </div>

            <Grid container spacing={3} className={cx('infoSections')}>
                <Grid item xs={12} md={4}>
                    <SectionTitle className={cx('addressTitle')} variant="h6">
                        Địa chỉ người nhận
                    </SectionTitle>
                    <StyledPaper>
                        <Typography variant="body1" gutterBottom>
                            {orderDataRes?.fullname}
                        </Typography>
                        <Typography variant="body2" className={cx('address')}>
                            Địa chỉ:{' '}
                            {`${orderDataRes?.address.addressDetail}, ${orderDataRes?.address.commune.label}, ${orderDataRes?.address.district.label}, ${orderDataRes?.address.province.label}`}
                        </Typography>
                        <Typography variant="body2">Điện thoại: {orderDataRes?.phoneNum}</Typography>
                    </StyledPaper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <SectionTitle className={cx('paymentTitle')} variant="h6">
                        Hình thức thanh toán
                    </SectionTitle>
                    <StyledPaper>
                        <Typography variant="body1" gutterBottom>
                            {orderDataRes?.paymentType === 'bank_transfer'
                                ? 'Chuyển khoản ngân hàng'
                                : 'Tiền mặt khi nhận hàng'}
                        </Typography>
                        <Typography variant="body2" className={cx('paymentStatus')}>
                            Trạng thái thanh toán:{' '}
                            <span className={cx(orderDataRes?.paymentStatus === 'PAID' ? 'paid' : 'unpaid')}>
                                {orderDataRes?.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </span>
                        </Typography>
                    </StyledPaper>
                </Grid>

                {/* Thêm mục mới cho thông tin đơn hàng */}
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
                        <Typography variant="body2">Mã giảm giá: {orderDataRes?.discountCode || 'Không có'}</Typography>
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
                                Tạm tính
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orderDataRes?.items.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <Box display="flex" className={cx('productInfo')}>
                                        <Box className={cx('productImageContainer')}>
                                            <img
                                                src={product.thumbnailUrl}
                                                alt={product.id}
                                                className={cx('productImage')}
                                            />
                                        </Box>
                                        <Box className={cx('productDetails')}>
                                            <Typography variant="body1" className={cx('productName')}>
                                                {product.productName}
                                            </Typography>
                                            <Typography variant="body2">
                                                Cung cấp bởi <span className={cx('brand')}>{product.brand}</span>
                                            </Typography>
                                            {orderDataRes?.status === 'COMPLETED' && (
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    startIcon={<RateReviewIcon />}
                                                    className={cx('actionButtonCompleted')}
                                                    style={{ marginTop: '8px' }}
                                                >
                                                    Đánh giá
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="right" className={cx('priceCell')}>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Typography noWrap>{product.originalPrice.toLocaleString()}</Typography>
                                        <Typography>&nbsp;₫</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{product.quantity}</TableCell>
                                <TableCell align="right" className={cx('priceCell')}>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Typography noWrap>{product.discount}</Typography>
                                        <Typography>&nbsp;₫</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right" className={cx('priceCell')}>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Typography noWrap>
                                            {(
                                                product.originalPrice * product.quantity -
                                                product.discount
                                            ).toLocaleString()}
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
                        <Divider className={cx('summaryDivider')} />
                        <Box display="flex" justifyContent="space-between" className={cx('summaryTotal')}>
                            <Typography variant="h6">Tổng cộng</Typography>
                            <Typography style={{ color: '#FF0000' }} variant="h6" noWrap className={cx('priceCell')}>
                                {orderDataRes?.grandTotal.toLocaleString('vi-VN')} ₫
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <Box className={cx('orderActionButtons')}>{renderActionButtons(orderDataRes?.status)}</Box>

            <Button
                variant="text"
                startIcon={<ArrowBackIcon />}
                className={cx('backButton')}
                onClick={() => navigate('/order')}
            >
                Quay lại
            </Button>
        </Box>
    );
}

export default OrderDetail;
