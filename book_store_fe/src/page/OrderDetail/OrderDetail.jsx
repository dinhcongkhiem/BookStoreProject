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
import { useQuery } from '@tanstack/react-query';
import OrderService from '../../service/OrderService';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

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
                    <SectionTitle className={cx('addressTitle')} variant="h6">
                        Hình thức thanh toán
                    </SectionTitle>
                    <StyledPaper>
                        <Typography variant="body1" gutterBottom>
                            {orderDataRes?.paymentType === 'bank_transfer'
                                ? 'Chuyển khoản ngân hàng'
                                : 'Tiền mặt khi nhận hàng'}
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
                                            {/* <Box mt={1} className={cx('actionButtons')}>
                                                <Button variant="outlined" size="small" className={cx('actionButton')}>
                                                    Mua lại
                                                </Button>
                                            </Box> */}
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
                        {/* <Box display="flex" justifyContent="space-between" className={cx('summaryRow')}>
                            <Typography>Khuyến mãi vận chuyển</Typography>
                            <Typography noWrap className={cx('priceCell')}>
                                {orderDataRes.shippingDiscount.toLocaleString('vi-VN')} ₫
                            </Typography>
                        </Box> */}
                        <Divider className={cx('summaryDivider')} />
                        <Box display="flex" justifyContent="space-between" className={cx('summaryTotal')}>
                            <Typography variant="h6">Tổng cổng</Typography>
                            <Typography style={{ color: '#FF0000' }} variant="h6" noWrap className={cx('priceCell')}>
                                {orderDataRes?.grandTotal.toLocaleString('vi-VN')} ₫
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <Button
                variant="text"
                startIcon={<ArrowBackIcon />}
                className={cx('backButton')}
                onClick={() => navigate("/order")}
            >
                Quay lại
            </Button>
        </Box>
    );
}

export default OrderDetail;
