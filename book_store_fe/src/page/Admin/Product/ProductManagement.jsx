import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import style from './ProductManagement.module.scss';
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
    Avatar,
    TableSortLabel,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Chip,
    Pagination,
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
import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';
import { useQuery } from '@tanstack/react-query';
import ProductService from '../../../service/ProductService';

const cx = classNames.bind(style);

const Product = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState('id');
    const [order, setOrder] = useState('asc');

    const handleEdit = (product) => {
        navigate('/admin/product/edit', { state: { product } });
    };

    const handleView = (product) => {
        setSelectedProduct(product);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedProduct(null);
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const { data: productRes, error, isLoading,} = useQuery({
        queryKey: ['products'],
        queryFn: () => ProductService.getListProduct().then((response) => response.data),
        retry: 1,
    });

    useEffect(() => {
        if(productRes) {
            console.log(productRes);  
        }
    }, [productRes]);

    return (
        <div className={cx('product-management')}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" className={cx('title')}>
                    Quản lý sản phẩm
                </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <TextField
                    className={cx('search-input')}
                    size="small"
                    variant="outlined"
                    placeholder="Tìm kiếm sách..."
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
                    onClick={() => navigate('/admin/product/add')}
                >
                    Thêm sách
                </Button>
            </Box>
            <TableContainer component={Paper} className={cx('product-table')}>
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
                                    active={orderBy === 'name'}
                                    direction={orderBy === 'name' ? order : 'asc'}
                                    onClick={() => handleRequestSort('name')}
                                >
                                    <b>Tên sách</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'importPrice'}
                                    direction={orderBy === 'importPrice' ? order : 'asc'}
                                    onClick={() => handleRequestSort('importPrice')}
                                >
                                    <b>Giá nhập</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'sellingPrice'}
                                    direction={orderBy === 'sellingPrice' ? order : 'asc'}
                                    onClick={() => handleRequestSort('sellingPrice')}
                                >
                                    <b>Giá bán</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'quantity'}
                                    direction={orderBy === 'quantity' ? order : 'asc'}
                                    onClick={() => handleRequestSort('quantity')}
                                >
                                    <b>Số lượng</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'status'}
                                    direction={orderBy === 'status' ? order : 'asc'}
                                    onClick={() => handleRequestSort('status')}
                                >
                                    <b>Trạng thái</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'category'}
                                    direction={orderBy === 'category' ? order : 'asc'}
                                    onClick={() => handleRequestSort('category')}
                                >
                                    <b>Danh mục</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'creationDate'}
                                    direction={orderBy === 'creationDate' ? order : 'asc'}
                                    onClick={() => handleRequestSort('creationDate')}
                                >
                                    <b>Ngày tạo</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <b>Thao tác</b>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productRes?.content.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.id}</TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Avatar
                                            alt={product.name}
                                            src={product.thumbnail_url}
                                            sx={{ width: 50, height: 80, mr: 2, borderRadius: 0 }}
                                        />
                                        {product.name}
                                    </Box>
                                </TableCell>
                                <TableCell>{product?.importPrice?.toLocaleString()}₫</TableCell>
                                <TableCell>{product?.price.toLocaleString()}₫</TableCell>
                                <TableCell>{product?.quantity}</TableCell>
                                <TableCell>
                                    <span
                                        className={cx('status', {
                                            'in-stock': product.status === 'Còn hàng',
                                            'out-of-stock': product.status === 'Hết hàng',
                                        })}
                                    >
                                        {product?.status}
                                    </span>
                                </TableCell>
                                <TableCell>{product?.category}</TableCell>
                                <TableCell>{new Date(product?.creationDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleView(product)}
                                        aria-label="view"
                                        sx={{ color: 'blue' }}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleEdit(product)}
                                        aria-label="edit"
                                        sx={{ color: 'green' }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        // onClick={() => handleDelete(product.id)}
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
            <div className="d-flex justify-content-center mt-5 mb-3">
                <Pagination color="primary" variant="outlined" count={10} />
            </div>
            <Dialog
                open={detailOpen}
                onClose={handleCloseDetail}
                maxWidth="md"
                fullWidth
                classes={{ paper: cx('dialog-paper') }}
                PaperProps={{
                    style: {
                        overflowY: 'visible',
                    },
                }}
            >
                {selectedProduct && (
                    <>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">{selectedProduct.name}</Typography>
                                <IconButton onClick={handleCloseDetail}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers style={{ overflowY: 'scroll' }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'auto 1fr',
                                            gap: 2,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            ID:
                                        </Typography>
                                        <Typography variant="body1">{selectedProduct.id}</Typography>

                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Giá nhập:
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedProduct.importPrice.toLocaleString()}₫
                                        </Typography>

                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Giá bán:
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedProduct.sellingPrice.toLocaleString()}₫
                                        </Typography>

                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Số lượng:
                                        </Typography>
                                        <Typography variant="body1">{selectedProduct.quantity}</Typography>

                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Danh mục:
                                        </Typography>
                                        <Typography variant="body1">{selectedProduct.category}</Typography>

                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Trạng thái:
                                        </Typography>
                                        <Chip
                                            sx={{ width: '10rem' }}
                                            label={selectedProduct.status}
                                            color={selectedProduct.status === 'Còn hàng' ? 'success' : 'error'}
                                            size="small"
                                        />

                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Ngày tạo:
                                        </Typography>
                                        <Typography variant="body1">
                                            {new Date(selectedProduct.creationDate).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Hình ảnh sản phẩm
                                    </Typography>
                                    <Gallery>
                                        <Box display="flex" flexWrap="wrap" gap={2}>
                                            {selectedProduct.images.map((image, index) => (
                                                <Item
                                                    key={index}
                                                    original={image}
                                                    thumbnail={image}
                                                    width="800"
                                                    height="768"
                                                >
                                                    {({ ref, open }) => (
                                                        <img
                                                            ref={ref}
                                                            onClick={open}
                                                            src={image}
                                                            alt={`Hình ảnh sản phẩm ${index + 1}`}
                                                            style={{
                                                                width: '10rem',
                                                                height: '15rem',
                                                                objectFit: 'cover',
                                                                cursor: 'pointer',
                                                            }}
                                                        />
                                                    )}
                                                </Item>
                                            ))}
                                        </Box>
                                    </Gallery>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        <b>Mô tả sản phẩm</b>
                                    </Typography>
                                    <div className={cx('description-container')}>
                                        <Typography variant="body1" className={cx('description-text')}>
                                            {selectedProduct.description}
                                        </Typography>
                                    </div>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" onClick={handleCloseDetail} color="primary">
                                Đóng
                            </Button>
                            <Button onClick={() => handleEdit(selectedProduct)} color="primary" variant="contained">
                                Chỉnh sửa
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </div>
    );
};

export default Product;
