import React, { useState, useEffect, useRef } from 'react';
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
    FormControl,
    Select,
    MenuItem,
    TableSortLabel,
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    LocalShipping as LocalShippingIcon,
    Cancel,
    CalendarToday,
    CheckCircle,
} from '@mui/icons-material';
import classNames from 'classnames/bind';
import style from './OrderMng.module.scss';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import OrderService from '../../../service/OrderService';
import {
    convertStatusOrderToVN,
    convertToISOString,
    convertTypeOrderToVN,
    formatDate,
    getStatusOrderClass,
    orderTabs,
} from '../../../utills/ConvertData';
import useDebounce from '../../../hooks/useDebounce';
import OrderDetail from '../../OrderDetail/OrderDetail';
import ConfirmModal from '../../../component/Modal/ConfirmModal/ConfirmModal';
import { useNavigate, useParams } from 'react-router-dom';
import style1 from '../Admin.module.scss';

const cx1 = classNames.bind(style1);
const cx = classNames.bind(style);

const types = [
    { value: 'all', label: 'Tất cả' },
    { value: 'ONLINE', label: 'Trực tuyến (Online)' },
    { value: 'IN_STORE', label: 'Tại cửa hàng' },
];
export default function OrderMng() {
    const navigate = useNavigate();
    const endDateRef = useRef(null);
    const startDateRef = useRef(null);
    const [orderBy, setOrderBy] = useState();

    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [startDateValue, setStartDateValue] = useState(null);
    const [endDateValue, setEndDateValue] = useState(null);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState('all');

    const [currentStatus, setCurrentStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [detailOpen, setDetailOpen] = useState(false);
    const [orderIdToUpdateStatus, setOrderIdToUpdateStatus] = useState(null);
    const [isOpenShippingConfirm, setIsOpenShippingConfirm] = useState(false);
    const [isOpenCancelConfirm, setIsOpenCancelConfirm] = useState(false);
    const [isOpenSuccessConfirm, setIsOpenSuccessConfirm] = useState(false);
    const debounceSearchTerm = useDebounce(searchTerm, 800);
    const { orderIdPath } = useParams();

    const {
        data: ordersRes,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['orderMng', currentStatus, debounceSearchTerm, startDate, endDate, page, type, orderBy],
        queryFn: () =>
            OrderService.getAllOrders({
                page,
                status: currentStatus,
                start: startDate.trim().length > 0 ? convertToISOString(startDate) : '',
                end: endDate.trim().length > 0 ? convertToISOString(endDate) : '',
                type,
                keyword: debounceSearchTerm,
                sort: orderBy,
            }).then((res) => res.data),
        retry: 1,
        enabled: !!page && !!currentStatus,
    });
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const handleDateChange = (event, type) => {
        const date = event.target.value;
        let formattedDate = formatDate(date);
        if (date.length === 0) {
            formattedDate = '';
        }
        if (type === 1) {
            setStartDateValue(date);
            setStartDate(formattedDate);
        } else {
            setEndDateValue(date);
            setEndDate(formattedDate);
        }
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
        navigate('/admin/orderMng');
    };
    useEffect(() => {
        if (!orderIdPath) {
            setDetailOpen(false);
        } else {
            setDetailOpen(true);
        }
    }, [orderIdPath]);

    const updateStatusOrderMutation = useMutation({
        mutationFn: ({ id, status }) => OrderService.updateStatusOrder(id, status),
        onError: (error) => console.log(error),
        onSuccess: (data) => {
            setIsOpenShippingConfirm(false);
            setIsOpenCancelConfirm(false);
            setIsOpenSuccessConfirm(false);
            toast.success('Đã cập nhật đơn hàng');
            queryClient.invalidateQueries(['orderMng']);
        },
    });

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
            <Paper className={cx('searchContainer')} elevation={2}>
                <div className="d-flex align-items-center mb-3">
                    <label htmlFor="search">Tìm kiếm: </label>
                    <TextField
                        size="small"
                        id="search"
                        sx={{ flexBasis: '50%' }}
                        placeholder="Id, tên khách hàng, số điện thoại..."
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
                </div>
                <div className="d-flex gap-5 align-items-center">
                    <div className={cx('filter-input')}>
                        <label htmlFor="search">Loại: </label>
                        <FormControl fullWidth size="small">
                            <Select
                                sx={{ borderRadius: '2rem' }}
                                defaultValue={'Hàng mới'}
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                {types.map((type, index) => {
                                    return (
                                        <MenuItem key={index} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </div>
                    <div className={cx('filter-input')}>
                        <label>Ngày đặt hàng: </label>
                        <div className={cx('input-date')}>
                            <TextField
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                                size="small"
                                fullWidth
                                label="Từ ngày..."
                                type="text"
                                autoComplete="off"
                                margin="normal"
                                placeholder="dd/MM/yyyy"
                                variant="outlined"
                                onClick={() => {
                                    startDateRef.current && startDateRef.current.showPicker();
                                }}
                                value={startDate}
                                sx={{ margin: 0 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <div className={cx('custom-datepicker')}>
                                                <CalendarToday />
                                            </div>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <input
                                type="date"
                                ref={startDateRef}
                                value={startDateValue}
                                onChange={(e) => handleDateChange(e, 1)}
                            />
                            <TextField
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                                size="small"
                                fullWidth
                                label="Đến ngày"
                                type="text"
                                autoComplete="off"
                                margin="normal"
                                placeholder="dd/MM/yyyy"
                                variant="outlined"
                                onClick={() => {
                                    endDateRef.current && endDateRef.current.showPicker();
                                }}
                                value={endDate}
                                sx={{ margin: 0 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <div className={cx('custom-datepicker')}>
                                                <CalendarToday />
                                            </div>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <input
                                type="date"
                                ref={endDateRef}
                                value={endDateValue}
                                onChange={(e) => handleDateChange(e, 2)}
                            />
                        </div>
                    </div>
                </div>
            </Paper>
            <TableContainer component={Paper} className={cx('orderTable')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 1}
                                    direction={orderBy === 1 ? 'asc' : 'desc'}
                                    onClick={() => setOrderBy((prev => prev === 1 ? 2 : 1))}
                                >
                                    ID
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Khách hàng</TableCell>
                            <TableCell>Ngày đặt hàng</TableCell>
                            <TableCell>Tổng tiền</TableCell>
                            <TableCell align="center" sx={{ width: '13rem' }}>
                                Loại
                            </TableCell>
                            <TableCell align="center" sx={{ width: '13rem' }}>
                                Trạng thái
                            </TableCell>
                            <TableCell align="center" sx={{ width: '145px' }}>
                                Hành động
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ordersRes?.orders.content.map((order) => (
                            <TableRow key={order.orderId}>
                                <TableCell>{order.orderId}</TableCell>
                                <TableCell>{order.buyerName}</TableCell>
                                <TableCell>{formatDate(order?.orderDate)}</TableCell>
                                <TableCell>{order.finalPrice.toLocaleString('vi-VN')} ₫</TableCell>
                                <TableCell align="center">
                                    <Chip label={convertTypeOrderToVN(order.type)} className={cx1('status')} />
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={convertStatusOrderToVN(order.status)}
                                        className={cx1('status', getStatusOrderClass(order.status))}
                                    />
                                </TableCell>

                                <TableCell align="center">
                                    <IconButton size="small" color="primary" onClick={() => handleViewDetails(order)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                    {order.status === 'PROCESSING' && (
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => {
                                                setIsOpenShippingConfirm(true);
                                                setOrderIdToUpdateStatus(order.orderId);
                                            }}
                                        >
                                            <LocalShippingIcon />
                                        </IconButton>
                                    )}
                                    {order.status === 'SHIPPING' && (
                                        <IconButton
                                            size="small"
                                            sx={{ color: '#2BC138' }}
                                            onClick={() => {
                                                setIsOpenSuccessConfirm(true);
                                                setOrderIdToUpdateStatus(order.orderId);
                                            }}
                                        >
                                            <CheckCircle />
                                        </IconButton>
                                    )}
                                    {(order.status === 'PROCESSING' || order.status === 'SHIPPING') && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                setIsOpenCancelConfirm(true);
                                                setOrderIdToUpdateStatus(order.orderId);
                                            }}
                                        >
                                            <Cancel />
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
                    <OrderDetail onClose={handleCloseDetail} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetail} color="primary">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
            {isOpenShippingConfirm && (
                <ConfirmModal
                    open={isOpenShippingConfirm}
                    onClose={() => setIsOpenShippingConfirm(false)}
                    onConfirm={() =>
                        updateStatusOrderMutation.mutate({ id: orderIdToUpdateStatus, status: 'SHIPPING' })
                    }
                    title={'Xác nhận'}
                    message={'Chuyển trạng thái đơn hàng qua đang giao'}
                />
            )}
            {isOpenCancelConfirm && (
                <ConfirmModal
                    open={isOpenCancelConfirm}
                    onClose={() => setIsOpenCancelConfirm(false)}
                    onConfirm={() =>
                        updateStatusOrderMutation.mutate({ id: orderIdToUpdateStatus, status: 'CANCELED' })
                    }
                    title={'Xác nhận'}
                    message={'Bạn đang muốn hủy đơn hàng này?'}
                />
            )}
            {isOpenSuccessConfirm && (
                <ConfirmModal
                    open={isOpenSuccessConfirm}
                    onClose={() => setIsOpenSuccessConfirm(false)}
                    onConfirm={() =>
                        updateStatusOrderMutation.mutate({ id: orderIdToUpdateStatus, status: 'COMPLETED' })
                    }
                    title={'Xác nhận'}
                    message={'Bạn đang muốn hoàn thành đơn hàng này?'}
                />
            )}
        </div>
    );
}
