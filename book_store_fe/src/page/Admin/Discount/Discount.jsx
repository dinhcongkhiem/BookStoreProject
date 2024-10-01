import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import style from './Discount.module.scss';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    IconButton,
    Typography,
    Box,
    TablePagination,
    TableSortLabel,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(style);

const initialDiscounts = [
    {
        id: 1,
        code: 'SUMMER10',
        discountValue: 10,
        startDate: '2023-06-01',
        expirationDate: '2023-08-31',
        condition: 'Đơn hàng từ 500.000đ',
        status: 'Đang hoạt động',
    },
    {
        id: 2,
        code: 'NEWCUSTOMER',
        discountValue: 15,
        startDate: '2023-07-01',
        expirationDate: '2023-12-31',
        condition: 'Khách hàng mới',
        status: 'Đang hoạt động',
    },
    {
        id: 3,
        code: 'FALL20',
        discountValue: 20,
        startDate: '2023-09-01',
        expirationDate: '2023-11-30',
        condition: 'Đơn hàng từ 1.000.000đ',
        status: 'Không hoạt động',
    },
    {
        id: 4,
        code: 'HOLIDAY25',
        discountValue: 25,
        startDate: '2023-12-01',
        expirationDate: '2023-12-31',
        condition: 'Tất cả đơn hàng',
        status: 'Đang hoạt động',
    },
];

const Discount = () => {
    const [discounts, setDiscounts] = useState(initialDiscounts);
    const [filteredDiscounts, setFilteredDiscounts] = useState(initialDiscounts);
    const [searchTerm, setSearchTerm] = useState('');
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState('id');
    const [order, setOrder] = useState('asc');
    const [statistics, setStatistics] = useState({
        totalDiscounts: 0,
        activeDiscounts: 0,
        inactiveDiscounts: 0,
        averageDiscount: 0,
    });

    const navigate = useNavigate();

    const handleEdit = (discount) => {
        navigate('/admin/discount/edit', { state: { discount } });
    };

    const handleDelete = (id) => {
        setDiscounts(discounts.filter((d) => d.id !== id));
    };

    const handleView = (discount) => {
        setSelectedDiscount(discount);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedDiscount(null);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        let filtered = discounts.filter(
            (discount) =>
                discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                discount.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                discount.condition.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        filtered.sort((a, b) => {
            if (b[orderBy] < a[orderBy]) {
                return order === 'asc' ? 1 : -1;
            }
            if (b[orderBy] > a[orderBy]) {
                return order === 'asc' ? -1 : 1;
            }
            return 0;
        });

        setFilteredDiscounts(filtered);
        setPage(0);

        // Update statistics
        const stats = {
            totalDiscounts: discounts.length,
            activeDiscounts: discounts.filter((d) => d.status === 'Đang hoạt động').length,
            inactiveDiscounts: discounts.filter((d) => d.status === 'Không hoạt động').length,
            averageDiscount: discounts.reduce((sum, d) => sum + d.discountValue, 0) / discounts.length,
        };
        setStatistics(stats);
    }, [searchTerm, discounts, order, orderBy]);

    return (
        <div className={cx('discount-management')}>
            <Typography variant="h4" component="h1" className={cx('title')}>
                Quản lý khuyễn mãi
            </Typography>

            <Grid container spacing={3} className={cx('statistics')}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card className={cx('stat-card')}>
                        <CardContent>
                            <Typography className={cx('stat-title')} gutterBottom>
                                Tổng số mã giảm giá
                            </Typography>
                            <Typography className={cx('stat-value')} variant="h5" component="div">
                                {statistics.totalDiscounts}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card className={cx('stat-card')}>
                        <CardContent>
                            <Typography className={cx('stat-title')} gutterBottom>
                                Mã đang hoạt động
                            </Typography>
                            <Typography className={cx('stat-value')} variant="h5" component="div">
                                {statistics.activeDiscounts}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card className={cx('stat-card')}>
                        <CardContent>
                            <Typography className={cx('stat-title')} gutterBottom>
                                Mã không hoạt động
                            </Typography>
                            <Typography className={cx('stat-value')} variant="h5" component="div">
                                {statistics.inactiveDiscounts}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card className={cx('stat-card')}>
                        <CardContent>
                            <Typography className={cx('stat-title')} gutterBottom>
                                Trung bình % giảm giá
                            </Typography>
                            <Typography className={cx('stat-value')} variant="h5" component="div">
                                {statistics.averageDiscount.toFixed(2)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <TextField
                    className={cx('search-input')}
                    size="small"
                    variant="outlined"
                    placeholder="Tìm kiếm khuyến mãi..."
                    value={searchTerm}
                    onChange={handleSearch}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: '30rem' }}
                />
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/discount/add')}
                    className={cx('add-button')}
                >
                    Thêm khuyến mãi
                </Button>
            </Box>

            <TableContainer component={Paper} className={cx('discount-table')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'id'}
                                    direction={orderBy === 'id' ? order : 'asc'}
                                    onClick={() => handleRequestSort('id')}
                                >
                                    <b>ID</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'code'}
                                    direction={orderBy === 'code' ? order : 'asc'}
                                    onClick={() => handleRequestSort('code')}
                                >
                                    <b>Mã</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'discountValue'}
                                    direction={orderBy === 'discountValue' ? order : 'asc'}
                                    onClick={() => handleRequestSort('discountValue')}
                                >
                                    <b>Giá trị (%)</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'startDate'}
                                    direction={orderBy === 'startDate' ? order : 'asc'}
                                    onClick={() => handleRequestSort('startDate')}
                                >
                                    <b>Ngày bắt đầu</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'expirationDate'}
                                    direction={orderBy === 'expirationDate' ? order : 'asc'}
                                    onClick={() => handleRequestSort('expirationDate')}
                                >
                                    <b>Ngày hết hạn</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'condition'}
                                    direction={orderBy === 'condition' ? order : 'asc'}
                                    onClick={() => handleRequestSort('condition')}
                                >
                                    <b>Điều kiện</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className={cx('status-cell')}>
                                <TableSortLabel
                                    active={orderBy === 'status'}
                                    direction={orderBy === 'status' ? order : 'asc'}
                                    onClick={() => handleRequestSort('status')}
                                >
                                    <b>Trạng thái</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <b>Thao tác</b>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDiscounts
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((discount) => (
                                <TableRow key={discount.id}>
                                    <TableCell>{discount.id}</TableCell>
                                    <TableCell>{discount.code}</TableCell>
                                    <TableCell>{discount.discountValue}%</TableCell>
                                    <TableCell>{new Date(discount.startDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(discount.expirationDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{discount.condition}</TableCell>
                                    <TableCell className={cx('status-cell')}>
                                        <div className={cx('status-container')}>
                                            <span
                                                className={cx('status', {
                                                    active: discount.status === 'Đang hoạt động',
                                                    inactive: discount.status === 'Không hoạt động',
                                                })}
                                            >
                                                {discount.status}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => handleView(discount)}
                                            aria-label="view"
                                            sx={{ color: 'blue' }}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleEdit(discount)}
                                            aria-label="edit"
                                            sx={{ color: 'green' }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(discount.id)}
                                            aria-label="delete"
                                            sx={{ color: 'red' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredDiscounts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
                {selectedDiscount && (
                    <>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Chi tiết khuyến mãi</Typography>
                                <IconButton onClick={handleCloseDetail}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Typography variant="subtitle1">
                                        <b>Mã:</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body1">{selectedDiscount.code}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="subtitle1">
                                        <b>Giá trị giảm giá:</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body1">{selectedDiscount.discountValue}%</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="subtitle1">
                                        <b>Ngày bắt đầu:</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body1">
                                        {new Date(selectedDiscount.startDate).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="subtitle1">
                                        <b>Ngày hết hạn:</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body1">
                                        {new Date(selectedDiscount.expirationDate).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="subtitle1">
                                        <b>Điều kiện:</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body1">{selectedDiscount.condition}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="subtitle1">
                                        <b>Trạng thái:</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Box display="flex" alignItems="center">
                                        <span
                                            className={cx('status', {
                                                active: selectedDiscount.status === 'Đang hoạt động',
                                                inactive: selectedDiscount.status === 'Không hoạt động',
                                            })}
                                        >
                                            {selectedDiscount.status}
                                        </span>
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDetail} color="primary">
                                Đóng
                            </Button>
                            <Button onClick={() => handleEdit(selectedDiscount)} color="primary" variant="contained">
                                Chỉnh sửa
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </div>
    );
};

export default Discount;
