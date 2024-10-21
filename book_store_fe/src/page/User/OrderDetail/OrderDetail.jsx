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

const orderData = {
    orderId: '#229091853',
    orderStatus: 'Huỷ',
    orderDate: '20:36 15/10/2024',
    shippingAddress: {
        name: 'Bùi Văn Đức',
        address:
            'Xóm gần bờ sông gần Trường Tiểu Học Đồng Quang Thôn Yên Nội Xã Đồng Quang, Huyện Quốc Oai, Hà Nội, Việt Nam',
        phone: '0974580241',
    },
    shippingInfo: {
        deliveryTime: 'Giao thứ 3, trước 19h, 22/10',
        deliveryBy: 'So Easy Homecare',
        shippingFee: 33000,
    },
    paymentInfo: {
        method: 'Thanh toán bằng ví MoMo',
        status: 'Thanh toán thất bại. Vui lòng thanh toán lại hoặc chọn phương thức thanh toán khác',
    },
    products: [
        {
            id: 1,
            name: 'Sách "Đắc Nhân Tâm" - Dale Carnegie',
            price: 88000,
            quantity: 1,
            discount: 0,
            imageUrl: 'https://salt.tikicdn.com/cache/200x200/media/catalog/product/d/a/dac-nhan-tam.jpg',
            brand: 'First News',
        },
        {
            id: 2,
            name: 'Sách "Nhà Giả Kim" - Paulo Coelho',
            price: 79000,
            quantity: 1,
            discount: 10000,
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzAD3fE4gimUcLKMThvONgIwrdzkTf9bwzWQ&s',
            brand: 'Nhã Nam',
        },
        {
            id: 3,
            name: 'Sách "Nhà Giả Kim" - Paulo Coelho',
            price: 79000,
            quantity: 1,
            discount: 10000,
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzAD3fE4gimUcLKMThvONgIwrdzkTf9bwzWQ&s',
            brand: 'Nhã Nam',
        },
    ],
    orderSummary: {
        subtotal: 39000,
        shippingFee: 38000,
        shippingDiscount: -5000,
        total: 72000,
    },
};

function OrderDetail() {
    const { orderId, orderStatus, orderDate, shippingAddress, shippingInfo, paymentInfo, products, orderSummary } =
        orderData;
    const calculatedSubtotal = products.reduce((total, product) => {
        return total + (product.price * product.quantity - product.discount);
    }, 0);

    return (
        <Box className={cx('orderDetailContainer')}>
            <div className={cx('orderDetailHeader')}>
                <Typography variant="h4" className={cx('orderTitle')}>
                    Chi tiết đơn hàng {orderId} - <span className={cx('orderStatus')}>{orderStatus}</span>
                </Typography>
                <Typography variant="body2" className={cx('orderDate')}>
                    Ngày đặt hàng: {orderDate}
                </Typography>
            </div>

            <Grid container spacing={3} className={cx('infoSections')}>
                <Grid item xs={12} md={4}>
                    <SectionTitle className={cx('addressTitle')} variant="h6">
                        Địa chỉ người nhận
                    </SectionTitle>
                    <StyledPaper>
                        <Typography variant="body1" gutterBottom>
                            {shippingAddress.name}
                        </Typography>
                        <Typography variant="body2" className={cx('address')}>
                            Địa chỉ: {shippingAddress.address}
                        </Typography>
                        <Typography variant="body2">Điện thoại: {shippingAddress.phone}</Typography>
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <SectionTitle className={cx('addressTitle')} variant="h6">
                        Giao hàng
                    </SectionTitle>
                    <StyledPaper>
                        <Typography variant="body2" gutterBottom>
                            {shippingInfo.deliveryTime}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            Được giao bởi {shippingInfo.deliveryBy}
                        </Typography>
                        <Typography variant="body2">
                            Phí vận chuyển: {shippingInfo.shippingFee.toLocaleString()}₫
                        </Typography>
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <SectionTitle className={cx('addressTitle')} variant="h6">
                        Hình thức thanh toán
                    </SectionTitle>
                    <StyledPaper>
                        <Typography variant="body1" gutterBottom>
                            {paymentInfo.method}
                        </Typography>
                        <Typography variant="body2" className={cx('paymentFailed')}>
                            {paymentInfo.status}
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
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <Box display="flex" className={cx('productInfo')}>
                                        <Box className={cx('productImageContainer')}>
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className={cx('productImage')}
                                            />
                                        </Box>
                                        <Box className={cx('productDetails')}>
                                            <Typography variant="body1" className={cx('productName')}>
                                                {product.name}
                                            </Typography>
                                            <Typography variant="body2">
                                                Cung cấp bởi <span className={cx('brand')}>{product.brand}</span>
                                            </Typography>
                                            <Box mt={1} className={cx('actionButtons')}>
                                                <Button variant="outlined" size="small" className={cx('actionButton')}>
                                                    Chat với nhà bán
                                                </Button>
                                                <Button variant="outlined" size="small" className={cx('actionButton')}>
                                                    Mua lại
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="right" className={cx('priceCell')}>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Typography noWrap>{product.price.toLocaleString()}</Typography>
                                        <Typography>&nbsp;₫</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{product.quantity}</TableCell>
                                <TableCell align="right" className={cx('priceCell')}>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Typography noWrap>{product.discount.toLocaleString()}</Typography>
                                        <Typography>&nbsp;₫</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right" className={cx('priceCell')}>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Typography noWrap>
                                            {(product.price * product.quantity - product.discount).toLocaleString()}
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
                                {calculatedSubtotal.toLocaleString()} ₫
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" className={cx('summaryRow')}>
                            <Typography>Phí vận chuyển</Typography>
                            <Typography noWrap className={cx('priceCell')}>
                                {orderSummary.shippingFee.toLocaleString()} ₫
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" className={cx('summaryRow')}>
                            <Typography>Khuyến mãi vận chuyển</Typography>
                            <Typography noWrap className={cx('priceCell')}>
                                {orderSummary.shippingDiscount.toLocaleString()} ₫
                            </Typography>
                        </Box>
                        <Divider className={cx('summaryDivider')} />
                        <Box display="flex" justifyContent="space-between" className={cx('summaryTotal')}>
                            <Typography variant="h6">Tổng cổng</Typography>
                            <Typography style={{ color: '#FF0000' }} variant="h6" noWrap className={cx('priceCell')}>
                                {(
                                    calculatedSubtotal +
                                    orderSummary.shippingFee +
                                    orderSummary.shippingDiscount
                                ).toLocaleString()}{' '}
                                ₫
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <Button
                variant="text"
                startIcon={<ArrowBackIcon />}
                className={cx('backButton')}
                onClick={() => console.log('Go back')}
            >
                Quay lại đơn hàng
            </Button>
        </Box>
    );
}

export default OrderDetail;
