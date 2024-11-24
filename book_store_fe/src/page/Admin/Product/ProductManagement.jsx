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
    Snackbar,
    Alert,
    Checkbox,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    QrCode,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProductService from '../../../service/ProductService';
import ModalLoading from '../../../component/Modal/ModalLoading/ModalLoading';
import useDebounce from '../../../hooks/useDebounce';
import { toast } from 'react-toastify';

import style1 from '../Admin.module.scss';
const cx1 = classNames.bind(style1);
const cx = classNames.bind(style);

const Product = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [page, setPage] = useState(1);
    const [orderBy, setOrderBy] = useState('newest');
    const [productIds, setProductIds] = useState([]);
    const [isClicked, setIsClicked] = useState(false); // Trạng thái kiểm tra nút đã click hay chưa
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage] = useState('');
    const [toastSeverity] = useState('success');
    const debouncedSearchValue = useDebounce(searchTerm, 800);
    const queryClient = useQueryClient();
    const handleEdit = (product) => {
        navigate(`/admin/product/update/${product.id}`);
    };

    const handleView = (product) => {
        setSelectedProduct(product);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedProduct(null);
    };

    const handleChangeSort = (prop) => {
        if (prop === 'newest' && orderBy === prop) {
            setOrderBy('oldest');
        } else if (prop === 'newest') {
            setOrderBy(prop);
        } else if (orderBy.split('_')[0] !== prop) {
            setOrderBy(`${prop}_asc`);
        } else {
            setOrderBy(`${prop}_${orderBy.split('_')[1] !== 'desc' ? 'desc' : 'asc'}`);
        }
        setPage(1);
    };

    const handleSearch = (event) => {
        setPage(1);
        setSearchTerm(event.target.value);
    };
    const handleToastClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setToastOpen(false);
    };

    const { data: productDetailRes, isLoading: isLoadingDetail } = useQuery({
        queryKey: ['productDetailMng', selectedProduct],
        queryFn: () => ProductService.getProductDetail(selectedProduct.id).then((response) => response.data),
        retry: 1,
        enabled: !!selectedProduct,
    });

    const {
        data: productRes,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['productsMng', orderBy, debouncedSearchValue, page],
        queryFn: () =>
            ProductService.getAllProductForMng({ page: page, sort: orderBy, keyword: debouncedSearchValue }).then(
                (response) => response.data,
            ),
        retry: 1,
    });
    const deleteMutation = useMutation({
        mutationFn: (productId) => ProductService.removeProduct(productId),
        onSuccess: () => {
            queryClient.invalidateQueries(['productsMng']);
            toast.success('Sản phẩm đã được xóa thành công');
        },
        onError: (error) => {
            toast.error('Có lỗi xảy ra khi xóa sản phẩm');
        },
    });

    useQuery({
        queryKey: ['barcodes'],
        queryFn: () => {
            setIsClicked(false);
            let isAll = false;
            let productIdsReq = [...productIds];
            if (productIdsReq[0] === -1) {
                productIdsReq.shift();
                isAll = true;
            }
            ProductService.getBarcodes({ productIds: productIdsReq, isAll: isAll }).then(async res => {
                if (res.status !== 200) {
                    throw new Error('Failed to fetch PDF');
                  }
                  const url = URL.createObjectURL(res.data);
                  const iframe = document.createElement('iframe');
                  iframe.style.display = 'none';
                  iframe.src = url;
                  document.body.appendChild(iframe);
              
                  URL.revokeObjectURL(url);
              
                  iframe.onload = () => {
                    iframe.contentWindow?.print();
                  };
            });
          
        },
        enabled: isClicked,
        retry: 1,
    });

    useEffect(() => {
        if (productRes) {
            window.scrollTo({ top: 0, behavior: 'instant' });
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
                <div className="d-flex gap-3">
                    <Button
                        disabled={productIds.length === 0}
                        variant="outlined"
                        color="primary"
                        startIcon={<QrCode />}
                        onClick={() => setIsClicked(true)}
                    >
                        In mã vạch
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/admin/product/add')}
                    >
                        Thêm sách
                    </Button>
                </div>
            </Box>
            <TableContainer component={Paper} className={cx('product-table')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell size="small" sx={{ paddingRight: '.5rem' }}>
                                <Checkbox
                                    checked={
                                        Array.isArray(productIds) && productIds[0] === -1 && productIds.length === 1
                                    }
                                    onChange={() => {
                                        const updatedProductIds = Array.isArray(productIds)
                                            ? productIds.includes(-1)
                                                ? []
                                                : [-1]
                                            : [-1];

                                        setProductIds(updatedProductIds);
                                    }}
                                />
                            </TableCell>
                            <TableCell size="small" sx={{ paddingRight: '.5rem', width: '78px' }}>
                                <TableSortLabel
                                    active={orderBy.split('_')[0] === 'id'}
                                    direction={orderBy.split('_')[1]}
                                    onClick={() => handleChangeSort('id')}
                                >
                                    <b>ID</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell
                                size="small"
                                sx={{
                                    width: '589px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <TableSortLabel
                                    active={orderBy.split('_')[0] === 'name'}
                                    direction={orderBy.split('_')[1]}
                                    onClick={() => handleChangeSort('name')}
                                >
                                    <b>Tên sách</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell size="small" sx={{ padding: '.5rem' }}>
                                <TableSortLabel
                                    active={orderBy.split('_')[0] === 'price'}
                                    direction={orderBy.split('_')[1]}
                                    onClick={() => handleChangeSort('price')}
                                >
                                    <b>Giá bán</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell size="small" sx={{ padding: '.5rem' }}>
                                <TableSortLabel
                                    active={orderBy.split('_')[0] === 'qty'}
                                    direction={orderBy.split('_')[1]}
                                    onClick={() => handleChangeSort('qty')}
                                >
                                    <b>Số lượng</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell size="small" sx={{ padding: '.5rem' }}>
                                <TableSortLabel
                                    active={orderBy.split('_')[0] === 'status'}
                                    direction={orderBy.split('_')[1]}
                                    onClick={() => handleChangeSort('status')}
                                >
                                    <b>Trạng thái</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell size="small" sx={{ padding: '.5rem' }}>
                                <TableSortLabel
                                    active={orderBy === 'oldest' || orderBy === 'newest'}
                                    direction={orderBy === 'oldest' ? 'asc' : 'desc'}
                                    onClick={() => handleChangeSort('newest')}
                                >
                                    <b>Ngày tạo</b>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell size="small" sx={{ padding: '.5rem' }}>
                                <b>Thao tác</b>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productRes?.content.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={
                                            Array.isArray(productIds) && productIds[0] === -1
                                                ? !productIds.includes(product.id)
                                                : productIds.includes(product.id)
                                        }
                                        onChange={() => {
                                            const updatedProductIds = Array.isArray(productIds)
                                                ? productIds.includes(product.id)
                                                    ? productIds.filter((id) => id !== product.id)
                                                    : [...productIds, product.id]
                                                : [product.id];

                                            setProductIds(updatedProductIds);
                                        }}
                                    />
                                </TableCell>
                                <TableCell size="small" sx={{ paddingRight: '.5rem', width: '78px' }}>
                                    {product.id}
                                </TableCell>
                                <TableCell
                                    size="small"
                                    sx={{
                                        width: '589px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'wrap',
                                    }}
                                >
                                    <Box display="flex" alignItems="center" sx={{ fontWeight: '700' }}>
                                        <Avatar
                                            alt={product.name}
                                            src={product.thumbnail_url}
                                            sx={{ width: 50, height: 80, mr: 2, borderRadius: 0 }}
                                        />
                                        {product.name}
                                    </Box>
                                </TableCell>
                                <TableCell size="small" sx={{ padding: '.5rem' }}>
                                    {product?.price.toLocaleString('vi-VN')} <strong>₫</strong>
                                </TableCell>
                                <TableCell size="small" sx={{ padding: '.5rem' }}>
                                    {product?.quantity}
                                </TableCell>
                                <TableCell size="small" sx={{ padding: '.5rem' }}>
                                    <Chip
                                        label={product?.status === 'AVAILABLE' ? 'Còn hàng' : 'Hết hàng'}
                                        color={product?.status === 'AVAILABLE' ? 'success' : 'error'}
                                        size="small"
                                        className={cx1('status', {
                                            'in-stock': product.status === 'AVAILABLE',
                                            'out-of-stock': product.status !== 'AVAILABLE',
                                        })}
                                    />
                                </TableCell>
                                <TableCell size="small" sx={{ padding: '.5rem' }}>
                                    {new Date(product?.createDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell size="small" sx={{ padding: '.5rem' }}>
                                    <IconButton
                                        onClick={() => handleView(product)}
                                        aria-label="view"
                                        sx={{ color: '#4791db' }}
                                    >
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleEdit(product)}
                                        aria-label="edit"
                                        sx={{ color: 'green' }}
                                    >
                                        <EditIcon fontSize="small" />
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
                    variant="outlined"
                    count={productRes?.totalPages < 1 ? 1 : productRes?.totalPages}
                    onChange={(e, v) => setPage(v)}
                />
            </div>
            <Dialog
                open={detailOpen}
                onClose={handleCloseDetail}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: {
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    },
                }}
            >
                {selectedProduct && productDetailRes && (
                    <>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">{selectedProduct.name}</Typography>
                                <IconButton onClick={handleCloseDetail}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'auto 1fr',
                                            gap: 2,
                                            alignItems: 'start',
                                        }}
                                    >
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            ID:
                                        </Typography>
                                        <Typography variant="body1">{selectedProduct.id}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Tên sách:
                                        </Typography>
                                        <Typography variant="body1">{selectedProduct.name}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Trạng thái:
                                        </Typography>
                                        <Chip
                                            label={selectedProduct.status === 'AVAILABLE' ? 'Còn hàng' : 'Hết hàng'}
                                            color={selectedProduct.status === 'AVAILABLE' ? 'success' : 'error'}
                                            size="small"
                                        />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Loại bìa:
                                        </Typography>
                                        <Typography variant="body1">
                                            {productDetailRes?.coverType === 'SOFTCOVER' ? 'Bìa cứng' : 'Bìa mềm'}
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Năm xuất bản:
                                        </Typography>
                                        <Typography variant="body1">{productDetailRes?.year_of_publication}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Kích thước:
                                        </Typography>
                                        <Typography variant="body1">
                                            {productDetailRes.size?.x} x {productDetailRes.size?.y} x{' '}
                                            {productDetailRes.size?.z} cm
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Trọng lượng:
                                        </Typography>
                                        <Typography variant="body1">{productDetailRes?.weight} gram</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Số lượng:
                                        </Typography>
                                        <Typography variant="body1">{productDetailRes?.quantity}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Số trang:
                                        </Typography>
                                        <Typography variant="body1">{productDetailRes?.number_of_pages}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Giá nhập:
                                        </Typography>
                                        <Typography variant="body1">
                                            {productDetailRes?.importPrice?.toLocaleString('vi-VN')}₫
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Giá bán:
                                        </Typography>
                                        <Typography variant="body1">
                                            {productDetailRes?.price.toLocaleString('vi-VN')} ₫
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Nhà phát hành:
                                        </Typography>
                                        <Typography variant="body1">
                                            {productDetailRes.publisher?.name || 'Không có'}
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            NXB:
                                        </Typography>
                                        <Typography variant="body1">{productDetailRes?.manufacturer}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Thể loại:
                                        </Typography>
                                        <Box>
                                            {productDetailRes.categories?.map((category, index) => (
                                                <Chip
                                                    key={index}
                                                    label={category.name}
                                                    size="small"
                                                    sx={{ mr: 1, mb: 1 }}
                                                />
                                            ))}
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Tác giả:
                                        </Typography>
                                        <Box>
                                            {productDetailRes.authors?.map((author, index) => (
                                                <Chip
                                                    key={index}
                                                    label={author.name}
                                                    size="small"
                                                    sx={{ mr: 1, mb: 1 }}
                                                />
                                            ))}
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Dịch giả:
                                        </Typography>
                                        <Typography variant="body1">{productDetailRes.translatorName}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            Ngày tạo:
                                        </Typography>
                                        <Typography variant="body1">
                                            {new Date(selectedProduct.createDate).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Hình ảnh sản phẩm
                                    </Typography>
                                    <Gallery>
                                        <Box display="flex" flexWrap="wrap" gap={2}>
                                            {productDetailRes?.images?.map((image, index) => (
                                                <Item
                                                    original={image.urlImage}
                                                    thumbnail={image.urlImage}
                                                    width="1024"
                                                    height="768"
                                                >
                                                    {({ ref, open }) => (
                                                        <img
                                                            ref={ref}
                                                            onClick={open}
                                                            src={image.urlImage}
                                                            alt={image.nameImage}
                                                            style={{
                                                                width: '100px',
                                                                height: '150px',
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
                                        Mô tả sản phẩm
                                    </Typography>
                                    <div dangerouslySetInnerHTML={{ __html: productDetailRes?.description }} />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDetail} color="primary">
                                Đóng
                            </Button>
                            <Button onClick={() => handleEdit(selectedProduct)} color="primary" variant="contained">
                                Chỉnh sửa
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
            {/* <ConfirmModal 
              open={deleteConfirmOpen}
              onClose={handleDeleteCancel}
              onConfirm={handleConfirmDelete}
              title={'Xác nhận'}
              message={'Xóa sản phẩm khỏi cửa hàng.'}
              type={'warn'}/> */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={3000}
                onClose={handleToastClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleToastClose} severity={toastSeverity} sx={{ width: '100%' }} variant="filled">
                    {toastMessage}
                </Alert>
            </Snackbar>
            <ModalLoading isLoading={isLoading || deleteMutation.isPending} />
        </div>
    );
};

export default Product;
