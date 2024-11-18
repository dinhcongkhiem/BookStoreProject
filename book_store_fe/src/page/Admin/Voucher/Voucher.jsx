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
    FormControl,
    MenuItem,
    Select,
    Pagination,
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import VoucherService from '../../../service/VoucherService';
import style1 from '../Admin.module.scss';
import useDebounce from '../../../hooks/useDebounce';
const cx1 = classNames.bind(style1);
const cx = classNames.bind(style);

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const Voucher = () => {
    const navigate = useNavigate();
    const [sort, setSort] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState(-2);
    const [searchTerm, setSearchTerm] = useState('');
    const searchDebounceVal = useDebounce(searchTerm, 500);
    const handleChangePage = (event, value) => {
        setPage(value);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('p', value);
        setSearchParams(Object.fromEntries(newSearchParams.entries()));
    };

    const handleChangeSort = (prop) => {
        if (sort.split('_')[0] !== prop) {
            setSort(`${prop}_asc`);
        } else {
            setSort(`${prop}_${sort.split('_')[1] !== 'desc' ? 'desc' : 'asc'}`);
        }
        setPage(1);
    };
    const convertStatus = (discount) => {
        const startDate = new Date(discount.startDate);
        const endDate = new Date(discount.endDate);
        const today = new Date();
        if (today < startDate) {
            return { label: 'Sắp diễn ra', class: 'upcoming' };
        } else if (today >= startDate && today <= endDate) {
            return { label: 'Đang hoạt động', class: 'active' };
        } else {
            return { label: 'Đã kết thúc', class: 'inactive' };
        }
    };
    const {
        data: vouchers,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['vouchersMng', searchDebounceVal, status, sort, page],
        queryFn: () =>
            VoucherService.getAll({ page, keyword: searchDebounceVal, status, sort }).then((res) => res.data),
        retry: 1,
    });

    return (
        <div className={cx('voucher-management')}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" className={cx('title')}>
                    Quản lý phiếu giảm giá
                </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <div className="d-flex flex-grow-1 gap-5">
                    <div className="d-flex gap-3 align-items-center">
                        <label htmlFor="searchDiscount" className="fw-semibold">
                            Tìm kiếm:
                        </label>
                        <TextField
                            id="searchDiscount"
                            className={cx('search-input')}
                            size="small"
                            variant="outlined"
                            placeholder="Mã hoặc tên phiếu giảm giá"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ width: '30rem', backgroundColor: '#fff' }}
                        />
                    </div>
                    <div className="d-flex gap-3 align-items-center">
                        <label htmlFor="searchDiscount" className="fw-semibold">
                            Trạng thái:
                        </label>
                        <FormControl fullWidth sx={{ width: '17rem', backgroundColor: '#fff' }}>
                            <Select
                                size="small"
                                fullWidth
                                id="select-status-discount"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <MenuItem value={-2}>Tất cả</MenuItem>
                                <MenuItem value={0}>Sắp diễn ra</MenuItem>
                                <MenuItem value={1}>Đang hoạt động</MenuItem>
                                <MenuItem value={-1}>Đã kết thúc</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>

                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/voucher/add')}
                    className={cx('add-button')}
                >
                    Thêm phiếu giảm giá
                </Button>
            </Box>

            <TableContainer component={Paper} className={cx('discount-table')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <b>ID</b>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sort.split('_')[0] === 'code'}
                                    direction={sort.split('_')[1]}
                                    onClick={() => handleChangeSort('code')}
                                >
                                    <b>Mã</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sort.split('_')[0] === 'name'}
                                    direction={sort.split('_')[1]}
                                    onClick={() => handleChangeSort('name')}
                                >
                                    <b>Tên</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <b>Giá trị (%/₫)</b>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sort.split('_')[0] === 'start'}
                                    direction={sort.split('_')[1]}
                                    onClick={() => handleChangeSort('start')}
                                >
                                    <b>Ngày bắt đầu</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sort.split('_')[0] === 'end'}
                                    direction={sort.split('_')[1]}
                                    onClick={() => handleChangeSort('end')}
                                >
                                    <b>Ngày hết hạn</b>
                                </TableSortLabel>
                            </TableCell>

                            <TableCell align="center">
                                <b>Trạng thái</b>
                            </TableCell>
                            <TableCell align="center">
                                <b>Thao tác</b>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vouchers?.content?.map((voucher) => (
                            <TableRow key={voucher.id}>
                                <TableCell>{voucher.id}</TableCell>
                                <TableCell>{voucher.code}</TableCell>
                                <TableCell>{voucher.name}</TableCell>
                                <TableCell>
                                    {voucher.discountType === 'PERCENT' ? (
                                        <span>{voucher.discountValue}%</span>
                                    ) : (
                                        <span>{voucher.discountValue.toLocaleString('vi-VN')} ₫</span>
                                    )}
                                </TableCell>
                                <TableCell>{new Date(voucher.startDate).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(voucher.endDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={convertStatus(voucher).label}
                                        className={cx1('status', convertStatus(voucher).class)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => navigate(`/admin/voucher/update/${voucher.id}`)}
                                        aria-label="edit"
                                        sx={{ color: 'green' }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        aria-label="delete"
                                        sx={{ color: 'red' }}
                                        onClick={() => {
                                            // setIdToRemove(voucher.id);
                                            // setIsOpen(true);
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <div className="d-flex justify-content-center mt-5 mb-3">
                <Pagination
                    color="primary"
                    onChange={handleChangePage}
                    variant="outlined"
                    page={parseInt(page)}
                    // count={discounts?.totalPages < 1 ? 1 : discounts?.totalPages}
                />
            </div>
        </div>
    );
};

export default Voucher;
