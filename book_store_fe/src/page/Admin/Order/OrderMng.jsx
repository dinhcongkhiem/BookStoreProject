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
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import OrderService from '../../../service/OrderService';
import { convertStatusOrderToVN, formatDate, getStatusOrderClass, orderTabs } from '../../../utills/ConvertData';
import useDebounce from '../../../hooks/useDebounce';
import OrderDetail from '../../OrderDetail/OrderDetail';
import { useNavigate } from 'react-router-dom';
const cx = classNames.bind(style);

export default function OrderMng() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [currentStatus, setCurrentStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [shippingConfirmOpen, setShippingConfirmOpen] = useState(false);
    const debounceSearchTerm = useDebounce(searchTerm, 800);
    const {
        data: ordersRes,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['orderMng', currentStatus, debounceSearchTerm, page],
        queryFn: () =>
            OrderService.getAllOrders({ page, status: currentStatus, keyword: debounceSearchTerm }).then(
                (res) => res.data,
            ),
        retry: 1,
        enabled: !!page && !!currentStatus,
    });
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
        navigate(`/admin/orderMng/${order.orderId}`);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedOrder(null);
    };

    const handleChangeToShipping = (orderId) => {
        setShippingConfirmOpen(true);
    };

    const confirmChangeToShipping = () => {
        // const updatedOrders = orders.map((order) =>
        //     order.id === orderToModify ? { ...order, status: 'Đang giao hàng' } : order,
        // );
        // // setOrders(updatedOrders);
        // if (selectedOrder && selectedOrder.id === orderToModify) {
        //     setSelectedOrder({ ...selectedOrder, status: 'Đang giao hàng' });
        // }
        // setShippingConfirmOpen(false);
        toast.success('Đơn hàng đã được chuyển sang trạng thái Đang giao hàng');
    };

    const handleDeleteOrder = (orderId) => {
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteOrder = () => {
        // const updatedOrders = orders.map((order) =>
        //     order.id === orderToModify ? { ...order, status: 'Đã hủy' } : order,
        // );
        // // setOrders(updatedOrders);
        // if (selectedOrder && selectedOrder.id === orderToModify) {
        //     setSelectedOrder({ ...selectedOrder, status: 'Đã hủy' });
        // }
        // setDeleteConfirmOpen(false);
        toast.success('Đơn hàng đã được hủy thành công');
    };

    const cancelModification = () => {
        setDeleteConfirmOpen(false);
        setShippingConfirmOpen(false);
    };
    useEffect(() => {
        if (ordersRes) {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [ordersRes]);
    return (
        <div className={cx('orderManagement')}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" className={cx('title')}>
                    Quản lý đơn hàng
                </Typography>
            </Box>
            <Grid container spacing={3} className={cx('statusTabs')}>
                {orderTabs.map((status, index) => (
                    <Grid item xs={6} sm={4} md={2} key={index}>
                        <Card
                            className={cx('statusCard', { active: currentStatus === status.id })}
                            onClick={() => handleStatusChange(status.id)}
                        >
                            <CardContent>
                                <Typography variant="h6" className={cx('statusTitle')}>
                                    {status.label}
                                </Typography>
                                <Typography variant="h4" className={cx('statusCount')}>
                                    {ordersRes?.count[status.id.toLowerCase()]}
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
                            <TableCell align="center" sx={{ width: '13rem' }}>
                                Trạng thái
                            </TableCell>
                            <TableCell align="center">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ordersRes?.orders.content.map((order) => (
                            <TableRow key={order.orderId}>
                                <TableCell>{order.orderId}</TableCell>
                                <TableCell>{order.buyerName}</TableCell>
                                <TableCell>{formatDate(order?.orderDate)}</TableCell>
                                <TableCell>{order.finalPrice.toLocaleString('vi-VN')} đ</TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={convertStatusOrderToVN(order.status)}
                                        className={cx('statusChip', getStatusOrderClass(order.status))}
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
                <Box display="flex" justifyContent="center" my={2}>
                    <Pagination
                        count={ordersRes?.orders?.totalPages < 1 ? 1 : ordersRes?.orders?.totalPages}
                        variant="outlined"
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            </TableContainer>
            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="lg" fullWidth>
                <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                <DialogContent>
                    <OrderDetail />
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
        </div>
    );
}
