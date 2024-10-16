import React, { useState } from 'react';
import classNames from 'classnames/bind';
import style from './Voucher.module.scss';
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

const initialVouchers = [
    {
        id: 1,
        code: 'SUMMER10',
        discountValue: 10,
        startDate: '2023-06-01',
        expirationDate: '2023-08-31',
        status: 'Đang hoạt động',
    },
    {
        id: 2,
        code: 'NEWBOOK5',
        discountValue: 5,
        startDate: '2023-07-01',
        expirationDate: '2023-12-31',
        status: 'Đang hoạt động',
    },
    {
        id: 3,
        code: 'FALL20',
        discountValue: 20,
        startDate: '2023-09-01',
        expirationDate: '2023-11-30',
        status: 'Không hoạt động',
    },
    {
        id: 4,
        code: 'WINTER15',
        discountValue: 15,
        startDate: '2023-12-01',
        expirationDate: '2023-12-31',
        status: 'Đang hoạt động',
    },
];

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const Voucher = () => {
    const navigate = useNavigate();
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    const handleView = (voucher) => {
        setSelectedVoucher(voucher);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedVoucher(null);
    };

    const handleEdit = (voucher) => {
        navigate('/admin/voucher/edit', { state: { voucher } });
    };

    return (
        <div className={cx('voucher-management')}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" className={cx('title')}>
                    Quản lý mã giảm giá
                </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <TextField
                    className={cx('search-input')}
                    size="small"
                    variant="outlined"
                    placeholder="Tìm kiếm mã giảm giá..."
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
                    onClick={() => navigate('/admin/voucher/add')}
                >
                    Thêm mã giảm giá
                </Button>
            </Box>

            <TableContainer component={Paper} className={cx('voucher-table')}>
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
                                    <b>Giá trị</b>
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
                                    <b>Trạng thái</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <b>Thao tác</b>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {initialVouchers.map((voucher) => (
                            <TableRow key={voucher.id}>
                                <TableCell>{voucher.id}</TableCell>
                                <TableCell>{voucher.code}</TableCell>
                                <TableCell>{`${voucher.discountValue}%`}</TableCell>
                                <TableCell>{formatDate(voucher.startDate)}</TableCell>
                                <TableCell>{formatDate(voucher.expirationDate)}</TableCell>
                                <TableCell>
                                    <div className={cx('status-container')}>
                                        <span
                                            className={cx('status', {
                                                active: voucher.status === 'Đang hoạt động',
                                                inactive: voucher.status === 'Không hoạt động',
                                            })}
                                        >
                                            {voucher.status}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleView(voucher)}
                                        aria-label="view"
                                        sx={{ color: 'blue' }}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleEdit(voucher)}
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
                count={initialVouchers.length}
                rowsPerPage={5}
                page={0}
            />

            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
                {selectedVoucher && (
                    <>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Chi tiết mã giảm giá</Typography>
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
                                    <Typography variant="body1">{selectedVoucher.code}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="subtitle1">
                                        <b>Giá trị giảm giá:</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body1">{`${selectedVoucher.discountValue}%`}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="subtitle1">
                                        <b>Ngày bắt đầu:</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body1">{formatDate(selectedVoucher.startDate)}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="subtitle1">
                                        <b>Ngày hết hạn:</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body1">
                                        {formatDate(selectedVoucher.expirationDate)}
                                    </Typography>
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
                                                active: selectedVoucher.status === 'Đang hoạt động',
                                                inactive: selectedVoucher.status === 'Không hoạt động',
                                            })}
                                        >
                                            {selectedVoucher.status}
                                        </span>
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDetail} color="primary">
                                Đóng
                            </Button>
                            <Button onClick={() => handleEdit(selectedVoucher)} color="primary" variant="contained">
                                Chỉnh sửa
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </div>
    );
};

export default Voucher;
