import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import style from './ProductManagent.module.scss';
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
    TablePagination,
    TableSortLabel,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';

const cx = classNames.bind(style);

const initialBooks = [
    {
        id: 1,
        name: 'Đại gia Gatsby',
        importPrice: 8990000,
        sellingPrice: 10990000,
        quantity: 20,
        status: 'Còn hàng',
        category: 'Tiểu thuyết',
        creationDate: '2023-01-15T00:00:00.000Z',
        images: [
            'https://cdn0.fahasa.com/media/catalog/product/9/7/9786043721522_1.jpg',
            'https://ironhackvietnam.edu.vn/wp-content/uploads/2021/03/nhung-cuon-sach-hay-ve-lap-trinh-tieng-viet.jpg',
        ],
        description:
            'Một tác phẩm kinh điển của F. Scott Fitzgerald về Giấc mơ Mỹ. Một tác phẩm kinh điển của F. Scott Fitzgerald về Giấc mơ Mỹ. Một tác phẩm kinh điển của F. Scott Fitzgerald về Giấc mơ Mỹ. Một tác phẩm kinh điển của F. Scott Fitzgerald về Giấc mơ Mỹ. Một tác phẩm kinh điển của F. Scott Fitzgerald về Giấc mơ Mỹ. Scott Fitzgerald về Giấc mơ Mỹ. Một tác phẩm kinh điển của F. Scott Fitzgerald về Giấc mơ Mỹ. Scott Fitzgerald về Giấc mơ Mỹ. Một tác phẩm kinh điển của F. Scott Fitzgerald về Giấc mơ Mỹ.',
    },
    {
        id: 2,
        name: '1984',
        importPrice: 6990000,
        sellingPrice: 8990000,
        quantity: 0,
        status: 'Hết hàng',
        category: 'Khoa học viễn tưởng',
        creationDate: '2023-02-20T00:00:00.000Z',
        images: [
            'https://cdn0.fahasa.com/media/catalog/product/9/7/9786043721522_1.jpg',
            'https://thietkelogo.edu.vn/uploads/images/thiet-ke-do-hoa-khac/banner-sach/1.png',
        ],
        description: 'Tiểu thuyết phản địa đàng của George Orwell về một xã hội độc tài.',
    },
    {
        id: 3,
        name: 'Giết con chim nhại',
        importPrice: 10990000,
        sellingPrice: 12990000,
        quantity: 15,
        status: 'Còn hàng',
        category: 'Tiểu thuyết',
        creationDate: '2023-03-10T00:00:00.000Z',
        images: [
            'https://cdn0.fahasa.com/media/catalog/product/9/7/9786043721522_1.jpg',
            'https://ntthnue.edu.vn/uploads/Images/2016/11/088.jpg',
        ],
        description: 'Tác phẩm kinh điển của Harper Lee về công lý và phân biệt chủng tộc.',
    },
    {
        id: 4,
        name: 'Kiêu hãnh và định kiến',
        importPrice: 7990000,
        sellingPrice: 9990000,
        quantity: 0,
        status: 'Hết hàng',
        category: 'Lãng mạn',
        creationDate: '2023-04-05T00:00:00.000Z',
        images: [
            'https://cdn0.fahasa.com/media/catalog/product/9/7/9786043721522_1.jpg',
            'https://ntthnue.edu.vn/uploads/Images/2016/11/088.jpg',
        ],
        description: 'Tiểu thuyết lãng mạn nổi tiếng của Jane Austen.',
    },
    {
        id: 5,
        name: 'Moby Dick',
        importPrice: 13990000,
        sellingPrice: 15990000,
        quantity: 5,
        status: 'Còn hàng',
        category: 'Phiêu lưu',
        creationDate: '2023-05-12T00:00:00.000Z',
        images: [
            'https://cdn0.fahasa.com/media/catalog/product/9/7/9786043721522_1.jpg',
            'https://ntthnue.edu.vn/uploads/Images/2016/11/088.jpg',
        ],
        description: 'Tác phẩm kinh điển của Herman Melville về cuộc săn đuổi một con cá voi trắng khổng lồ.',
    },
];

const Product = () => {
    const [products, setProducts] = useState(initialBooks);
    const [filteredProducts, setFilteredProducts] = useState(initialBooks);
    const [searchTerm, setSearchTerm] = useState('');
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [expandDescription, setExpandDescription] = useState(() => {
        const saved = localStorage.getItem('expandDescription');
        return saved !== null ? JSON.parse(saved) : false;
    });

    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState('id');
    const [order, setOrder] = useState('asc');

    const handleEdit = (product) => {
        navigate('/admin/product/edit', { state: { product } });
    };

    const handleDelete = (id) => {
        setProducts(products.filter((p) => p.id !== id));
    };

    const handleView = (product) => {
        setSelectedProduct(product);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedProduct(null);
    };

    const toggleDescription = () => {
        const newExpandDescription = !expandDescription;
        setExpandDescription(newExpandDescription);
        localStorage.setItem('expandDescription', JSON.stringify(newExpandDescription));
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
        let filtered = products.filter(
            (product) =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase()),
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

        setFilteredProducts(filtered);
        setPage(0);
    }, [searchTerm, products, order, orderBy]);

    return (
        <div className={cx('product-management')}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" className={cx('title')}>
                    Quản lý sách
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
                        {filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.id}</TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Avatar
                                            alt={product.name}
                                            src={product.images[0]}
                                            sx={{ width: 50, height: 80, mr: 2, borderRadius: 0 }}
                                        />
                                        {product.name}
                                    </Box>
                                </TableCell>
                                <TableCell>{product.importPrice.toLocaleString()}₫</TableCell>
                                <TableCell>{product.sellingPrice.toLocaleString()}₫</TableCell>
                                <TableCell>{product.quantity}</TableCell>
                                <TableCell>
                                    <span
                                        className={cx('status', {
                                            'in-stock': product.status === 'Còn hàng',
                                            'out-of-stock': product.status === 'Hết hàng',
                                        })}
                                    >
                                        {product.status}
                                    </span>
                                </TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{new Date(product.creationDate).toLocaleDateString()}</TableCell>
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
                                        onClick={() => handleDelete(product.id)}
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
                count={filteredProducts.length}
                rowsPer
                Page={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Dialog
                open={detailOpen}
                onClose={handleCloseDetail}
                maxWidth="md"
                fullWidth
                classes={{ paper: cx('dialog-paper') }}
                PaperProps={{
                    style: {
                        maxHeight: '100%',
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
                        <DialogContent dividers style={{ overflowY: 'visible' }}>
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
                                    <div className={cx('description-container', { expanded: expandDescription })}>
                                        <Typography variant="body1" className={cx('description-text')}>
                                            {selectedProduct.description}
                                        </Typography>
                                    </div>
                                    {selectedProduct.description.split('.').length > 1 && (
                                        <Button
                                            onClick={toggleDescription}
                                            endIcon={expandDescription ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            className={cx('expand-button')}
                                        >
                                            {expandDescription ? '' : ''}
                                        </Button>
                                    )}
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
