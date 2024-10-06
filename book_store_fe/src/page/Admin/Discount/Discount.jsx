import React, { useState } from 'react';
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
    const navigate = useNavigate();
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);

    const handleView = (discount) => {
        setSelectedDiscount(discount);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedDiscount(null);
    };

    const handleEdit = (discount) => {
        navigate('/admin/discount/edit', { state: { discount } });
    };

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
                                {initialDiscounts.length}
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
                                {initialDiscounts.filter((d) => d.status === 'Đang hoạt động').length}
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
                                {initialDiscounts.filter((d) => d.status === 'Không hoạt động').length}
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
                                {(
                                    initialDiscounts.reduce((sum, d) => sum + d.discountValue, 0) /
                                    initialDiscounts.length
                                ).toFixed(2)}
                                %
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
                                <TableSortLabel>
                                    <b>ID</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel>
                                    <b>Mã</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel>
                                    <b>Giá trị (%)</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel>
                                    <b>Ngày bắt đầu</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel>
                                    <b>Ngày hết hạn</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel>
                                    <b>Điều kiện</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className={cx('status-cell')}>
                                <TableSortLabel>
                                    <b>Trạng thái</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <b>Thao tác</b>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {initialDiscounts.map((discount) => (
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
                                    <IconButton aria-label="delete" sx={{ color: 'red' }}>
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
                count={initialDiscounts.length}
                rowsPerPage={5}
                page={0}
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
