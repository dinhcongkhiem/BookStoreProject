import React, { useState } from 'react';
import classNames from 'classnames/bind';
import style from './Discount.module.scss';
import style1 from '../Admin.module.scss';
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
    TableSortLabel,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    Pagination,
    Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DiscountService from '../../../service/DiscountService';
import useDebounce from '../../../hooks/useDebounce';
import ModalLoading from '../../../component/Modal/ModalLoading/ModalLoading';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../component/Modal/ConfirmModal/ConfirmModal';

const cx = classNames.bind(style);
const cx1 = classNames.bind(style1);

const Discount = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [sort, setSort] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState(-2);
    const [searchTerm, setSearchTerm] = useState('');
    const searchTermDebouce = useDebounce(searchTerm.trim(), 800);
    const [idToRemove, setIdToRemove] = useState();
    const [isOpen, setIsOpen] = useState(false);
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

    const {
        data: discounts,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['discountMng', page, status, sort, searchTermDebouce],
        queryFn: () =>
            DiscountService.getDiscounts({ page, size: 20, orderBy: sort, keyword: searchTermDebouce, status }).then(
                (res) => res.data,
            ),
        retry: 1,
    });

    const deleteDiscountMutation = useMutation({
        mutationFn: () => DiscountService.remove(idToRemove),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['discountMng']);
            toast.success('Đã xóa đợt giảm giá thành công');
        },
    });
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

    return (
        <div className={cx('discount-management')}>
            <Typography variant="h4" component="h1" className={cx('title')}>
                Quản lý đợt giảm giá
            </Typography>

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
                            placeholder="Tìm kiếm khuyến mãi..."
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
                            <TableCell sx={{ width: '57px' }}>
                                <b>ID</b>
                            </TableCell>
                            <TableCell sx={{ width: '450px' }}>
                                <TableSortLabel
                                    active={sort.split('_')[0] === 'name'}
                                    direction={sort.split('_')[1]}
                                    onClick={() => handleChangeSort('name')}
                                >
                                    <b>Tên</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ width: '120px' }}>
                                <TableSortLabel
                                    active={sort.split('_')[0] === 'value'}
                                    direction={sort.split('_')[1]}
                                    onClick={() => handleChangeSort('value')}
                                >
                                    <b>Giá trị (%)</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ width: '150px' }}>
                                <TableSortLabel
                                    active={sort.split('_')[0] === 'start'}
                                    direction={sort.split('_')[1]}
                                    onClick={() => handleChangeSort('start')}
                                >
                                    <b>Ngày bắt đầu</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ width: '150px' }}>
                                <TableSortLabel
                                    active={sort.split('_')[0] === 'end'}
                                    direction={sort.split('_')[1]}
                                    onClick={() => handleChangeSort('end')}
                                >
                                    <b>Ngày hết hạn</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center" sx={{ width: '150px' }}>
                                <b>Trạng thái</b>
                            </TableCell>
                            <TableCell align="center" sx={{ width: '115px' }}>
                                <b>Thao tác</b>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {discounts?.content?.map((discount) => (
                            <TableRow key={discount.id}>
                                <TableCell>{discount.id}</TableCell>
                                <TableCell>{discount.name}</TableCell>
                                <TableCell>{discount.discountRate}%</TableCell>
                                <TableCell>{new Date(discount.startDate).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(discount.endDate).toLocaleDateString()}</TableCell>
                                <TableCell align='center'>
                                    <Chip
                                        label={convertStatus(discount).label}
                                        className={cx1('status', convertStatus(discount).class)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => navigate(`/admin/discount/update/${discount.id}`)}
                                        aria-label="edit"
                                        sx={{ color: 'green' }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        aria-label="delete"
                                        sx={{ color: 'red' }}
                                        onClick={() => {
                                            setIdToRemove(discount.id);
                                            setIsOpen(true);
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
                    count={discounts?.totalPages < 1 ? 1 : discounts?.totalPages}
                />
            </div>
            <ModalLoading isLoading={isLoading} />
            {isOpen && (
                <ConfirmModal
                    open={isOpen}
                    onClose={() => setIsOpen(false)}
                    onConfirm={() => {
                        setIsOpen(false);
                        deleteDiscountMutation.mutate();
                    }}
                    title={'Xác nhận'}
                    message={'Bạn có chắn muốn xóa đợt giảm giá này?'}
                    type="warn"
                />
            )}
        </div>
    );
};

export default Discount;
