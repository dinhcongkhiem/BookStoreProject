import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Grid,
    Pagination,
    Card,
    CardContent,
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    LocalShipping as LocalShippingIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { format, parse } from 'date-fns';
import viLocale from 'date-fns/locale/vi';
import classNames from 'classnames/bind';
import style from './OrderMng.module.scss';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(style);

const mockOrders = [
    { id: 1, customerName: 'Nguyễn Văn A', orderDate: '2023-10-25', total: 250000, status: 'Đang xử lý' },
    { id: 2, customerName: 'Trần Thị B', orderDate: '2023-10-24', total: 180000, status: 'Đã giao hàng' },
    { id: 3, customerName: 'Lê Văn C', orderDate: '2023-10-23', total: 320000, status: 'Đang giao hàng' },
    { id: 4, customerName: 'Phạm Thị D', orderDate: '2023-10-22', total: 150000, status: 'Đã hủy' },
    { id: 5, customerName: 'Hoàng Văn E', orderDate: '2023-10-21', total: 420000, status: 'Đã giao hàng' },
    { id: 6, customerName: 'Vũ Thị F', orderDate: '2023-10-20', total: 280000, status: 'Đang xử lý' },
    { id: 7, customerName: 'Đặng Văn G', orderDate: '2023-10-19', total: 350000, status: 'Đang giao hàng' },
    { id: 8, customerName: 'Bùi Thị H', orderDate: '2023-10-18', total: 190000, status: 'Đã hủy' },
    { id: 9, customerName: 'Ngô Văn I', orderDate: '2023-10-26', total: 550000, status: 'Chưa thanh toán' },
    { id: 10, customerName: 'Lý Thị K', orderDate: '2023-10-27', total: 680000, status: 'Chưa thanh toán' },
];

const mockOrderDetails = {
    id: 1,
    customerName: 'Nguyễn Văn A',
    orderDate: '2023-10-25',
    total: 250000,
    status: 'Đang xử lý',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    phone: '0123456789',
    items: [
        {
            id: 1,
            title: 'Sách A',
            quantity: 2,
            price: 75000,
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNnvakZp4EO7l5-fhdR3B2xVBYUErcorHdCw&s',
        },
        {
            id: 2,
            title: 'Sách B',
            quantity: 1,
            price: 100000,
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzAD3fE4gimUcLKMThvONgIwrdzkTf9bwzWQ&s',
        },
    ],
};

const statusTabs = ['Tất cả', 'Chưa thanh toán', 'Đang xử lý', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy'];

export default function OrderMng() {
    const [orders, setOrders] = useState(mockOrders);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [currentStatus, setCurrentStatus] = useState('Tất cả');
    const [page, setPage] = useState(1);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [shippingConfirmOpen, setShippingConfirmOpen] = useState(false);
    const [orderToModify, setOrderToModify] = useState(null);
    const ordersPerPage = 5;

    useEffect(() => {}, []);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const handleDateChange = (event) => {
        setSearchDate(event.target.value);
        setPage(1);
    };

    const handleStatusChange = (status) => {
        setCurrentStatus(status);
        setPage(1);
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedOrder(null);
    };

    const handleChangeToShipping = (orderId) => {
        setOrderToModify(orderId);
        setShippingConfirmOpen(true);
    };

    const confirmChangeToShipping = () => {
        const updatedOrders = orders.map((order) =>
            order.id === orderToModify ? { ...order, status: 'Đang giao hàng' } : order,
        );
        setOrders(updatedOrders);
        if (selectedOrder && selectedOrder.id === orderToModify) {
            setSelectedOrder({ ...selectedOrder, status: 'Đang giao hàng' });
        }
        setShippingConfirmOpen(false);
        toast.success('Đơn hàng đã được chuyển sang trạng thái Đang giao hàng');
    };

    const handleDeleteOrder = (orderId) => {
        setOrderToModify(orderId);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteOrder = () => {
        const updatedOrders = orders.map((order) =>
            order.id === orderToModify ? { ...order, status: 'Đã hủy' } : order,
        );
        setOrders(updatedOrders);
        if (selectedOrder && selectedOrder.id === orderToModify) {
            setSelectedOrder({ ...selectedOrder, status: 'Đã hủy' });
        }
        setDeleteConfirmOpen(false);
        toast.success('Đơn hàng đã được hủy thành công');
    };

    const cancelModification = () => {
        setDeleteConfirmOpen(false);
        setShippingConfirmOpen(false);
        setOrderToModify(null);
    };

    const filteredOrders = orders.filter((order) => {
        const matchesName = order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = currentStatus === 'Tất cả' || order.status === currentStatus;
        const matchesDate = !searchDate || order.orderDate === searchDate;
        return matchesName && matchesStatus && matchesDate;
    });

    const pageCount = Math.ceil(filteredOrders.length / ordersPerPage);
    const displayedOrders = filteredOrders.slice((page - 1) * ordersPerPage, page * ordersPerPage);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Chưa thanh toán':
                return 'statusUnpaid';
            case 'Đang xử lý':
                return 'statusProcessing';
            case 'Đang giao hàng':
                return 'statusShipping';
            case 'Đã giao hàng':
                return 'statusDelivered';
            case 'Đã hủy':
                return 'statusCancelled';
            default:
                return '';
        }
    };

    const formatDate = (dateString) => {
        const date = parse(dateString, 'yyyy-MM-dd', new Date());
        return format(date, 'dd/MM/yyyy', { locale: viLocale });
    };

    const getStatusCount = (status) => {
        return orders.filter((order) => status === 'Tất cả' || order.status === status).length;
    };

    return (
        <div className={cx('orderManagement')}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" className={cx('title')}>
                    Quản lý đơn hàng
                </Typography>
            </Box>
            <Grid container spacing={3} className={cx('statusTabs')}>
                {statusTabs.map((status) => (
                    <Grid item xs={6} sm={4} md={2} key={status}>
                        <Card
                            className={cx('statusCard', { active: currentStatus === status })}
                            onClick={() => handleStatusChange(status)}
                        >
                            <CardContent>
                                <Typography variant="h6" className={cx('statusTitle')}>
                                    {status}
                                </Typography>
                                <Typography variant="h4" className={cx('statusCount')}>
                                    {getStatusCount(status)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Paper className={cx('searchContainer')} elevation={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Tìm kiếm"
                            variant="outlined"
                            value={searchTerm}
                            onChange={handleSearch}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Tìm kiếm theo ngày đặt hàng"
                            type="date"
                            variant="outlined"
                            value={searchDate}
                            onChange={handleDateChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>
            <TableContainer component={Paper} className={cx('tableContainer')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Tên khách hàng</TableCell>
                            <TableCell>Ngày đặt hàng</TableCell>
                            <TableCell>Tổng tiền</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedOrders.map((order) => (
                            <TableRow key={order.id} className={cx('tableRow')}>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell>{formatDate(order.orderDate)}</TableCell>
                                <TableCell>{order.total.toLocaleString('vi-VN')} đ</TableCell>
                                <TableCell>
                                    <Chip
                                        label={order.status}
                                        className={cx('statusChip', getStatusColor(order.status))}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleViewDetails(order)}
                                        color="primary"
                                        className={cx('actionButton')}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                    {!['Đã hủy', 'Đã giao hàng', 'Đang giao hàng'].includes(order.status) && (
                                        <IconButton
                                            onClick={() => handleChangeToShipping(order.id)}
                                            color="primary"
                                            className={cx('actionButton')}
                                        >
                                            <LocalShippingIcon />
                                        </IconButton>
                                    )}
                                    {['Đang xử lý', 'Chưa thanh toán'].includes(order.status) && (
                                        <IconButton
                                            onClick={() => handleDeleteOrder(order.id)}
                                            color="error"
                                            className={cx('actionButton')}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {displayedOrders.length === 0 && (
                <Typography variant="body1" className={cx('noOrders')}>
                    Không tìm thấy đơn hàng nào.
                </Typography>
            )}
            <Box className={cx('pagination')}>
                <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(event, value) => setPage(value)}
                    color="primary"
                    size="large"
                />
            </Box>
            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth className={cx('dialog')}>
                {selectedOrder && (
                    <>
                        <DialogTitle className={cx('dialogTitle')}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h5">Chi tiết đơn hàng #{selectedOrder.id}</Typography>
                                <Chip
                                    label={selectedOrder.status}
                                    className={cx('statusChip', getStatusColor(selectedOrder.status))}
                                />
                            </Box>
                        </DialogTitle>
                        <DialogContent className={cx('dialogContent')}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Paper className={cx('infoSection')}>
                                        <Typography variant="h6" className={cx('sectionTitle')}>
                                            Thông tin khách hàng
                                        </Typography>
                                        <Typography>
                                            <strong>Tên:</strong> {mockOrderDetails.customerName}
                                        </Typography>
                                        <Typography>
                                            <strong>Địa chỉ:</strong> {mockOrderDetails.address}
                                        </Typography>
                                        <Typography>
                                            <strong>Số điện thoại:</strong> {mockOrderDetails.phone}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper className={cx('infoSection')}>
                                        <Typography variant="h6" className={cx('sectionTitle')}>
                                            Thông tin đơn hàng
                                        </Typography>
                                        <Typography>
                                            <strong>Ngày đặt hàng:</strong> {formatDate(mockOrderDetails.orderDate)}
                                        </Typography>
                                        <Typography>
                                            <strong>Trạng thái:</strong> {mockOrderDetails.status}
                                        </Typography>
                                        <Typography>
                                            <strong>Tổng tiền:</strong> {mockOrderDetails.total.toLocaleString('vi-VN')}{' '}
                                            đ
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                            <Paper className={cx('productSection')}>
                                <Typography variant="h6" className={cx('sectionTitle')}>
                                    Sản phẩm
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Hình ảnh</TableCell>
                                                <TableCell>Tên sách</TableCell>
                                                <TableCell align="right">Số lượng</TableCell>
                                                <TableCell align="right">Đơn giá</TableCell>
                                                <TableCell align="right">Thành tiền</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {mockOrderDetails.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell sx={{ display: 'flex' }}>
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            style={{ width: '65px', marginRight: '10px' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{item.title}</TableCell>
                                                    <TableCell align="right">{item.quantity}</TableCell>
                                                    <TableCell align="right">
                                                        {item.price.toLocaleString('vi-VN')} đ
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {(item.quantity * item.price).toLocaleString('vi-VN')} đ
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={4} align="right">
                                                    <strong>Tổng cộng:</strong>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <strong>{mockOrderDetails.total.toLocaleString('vi-VN')} đ</strong>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </DialogContent>
                        <DialogActions className={cx('dialogActions')}>
                            <Button variant="outlined" onClick={handleCloseDetail} color="primary">
                                Đóng
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Confirmation Dialog for Shipping */}
            <Dialog open={shippingConfirmOpen} onClose={cancelModification}>
                <DialogTitle>Xác nhận chuyển trạng thái</DialogTitle>
                <DialogContent>
                    Bạn có chắc chắn muốn chuyển đơn hàng này sang trạng thái "Đang giao hàng" không?
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelModification} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={confirmChangeToShipping} color="primary">
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog for Deletion */}
            <Dialog open={deleteConfirmOpen} onClose={cancelModification}>
                <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
                <DialogContent>Bạn có chắc chắn muốn hủy đơn hàng này không?</DialogContent>
                <DialogActions>
                    <Button onClick={cancelModification} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={confirmDeleteOrder} color="error">
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}
