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
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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
                            size="small"
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
                            size="small"
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
            <TableContainer component={Paper} className={cx('orderTable')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Khách hàng</TableCell>
                            <TableCell>Ngày đặt hàng</TableCell>
                            <TableCell>Tổng tiền</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell align="center">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedOrders.map((order) => (
                            <TableRow key={order.id}>
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
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleViewDetails(order)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                    {order.status === 'Đang xử lý' && (
                                        <IconButton color="primary" onClick={() => handleChangeToShipping(order.id)}>
                                            <LocalShippingIcon />
                                        </IconButton>
                                    )}
                                    {(order.status === 'Đang xử lý' || order.status === 'Chưa thanh toán') && (
                                        <IconButton color="error" onClick={() => handleDeleteOrder(order.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Box display="flex" justifyContent="center" mt={2}>
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        color="primary"
                        siblingCount={1}
                        boundaryCount={1}
                        showFirstButton
                        showLastButton
                    />
                </Box>
            </TableContainer>
            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
                <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                <DialogContent>
                    {selectedOrder && (
                        <Box>
                            <Typography variant="subtitle1">Tên khách hàng: {selectedOrder.customerName}</Typography>
                            <Typography variant="subtitle1">
                                Ngày đặt hàng: {formatDate(selectedOrder.orderDate)}
                            </Typography>
                            <Typography variant="subtitle1">
                                Tổng tiền: {selectedOrder.total.toLocaleString('vi-VN')} đ
                            </Typography>
                            <Typography variant="subtitle1">Trạng thái: {selectedOrder.status}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetail} color="primary">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={shippingConfirmOpen} onClose={cancelModification}>
                <DialogTitle>Xác nhận chuyển sang Đang giao hàng</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái Đang giao hàng không?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelModification} color="secondary">
                        Hủy
                    </Button>
                    <Button onClick={confirmChangeToShipping} color="primary">
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={deleteConfirmOpen} onClose={cancelModification}>
                <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn hủy đơn hàng này không?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelModification} color="secondary">
                        Hủy
                    </Button>
                    <Button onClick={confirmDeleteOrder} color="error">
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
        </div>
    );
}
