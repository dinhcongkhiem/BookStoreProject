import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './DetailProduct.module.scss';
import classNames from 'classnames/bind';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Chip,
} from '@mui/material';
import { ArrowBack, Edit, LocalOffer, Category, Inventory2, CheckCircle, Cancel } from '@mui/icons-material';
import 'photoswipe/dist/photoswipe.css'
import { Gallery, Item } from 'react-photoswipe-gallery'
const cx = classNames.bind(styles);

function DetailProduct() {
    const navigate = useNavigate();
    const location = useLocation();
    const [productData, setProductData] = useState({
        id: '',
        name: '',
        importPrice: '',
        sellingPrice: '',
        quantity: '',
        status: '',
        category: '',
        description: '',
        images: [],
    });
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        if (location.state && location.state.product) {
            const product = location.state.product;
            setProductData({
                id: product.id,
                name: product.name,
                importPrice: product.importPrice.toString(),
                sellingPrice: product.sellingPrice.toString(),
                quantity: product.quantity.toString(),
                status: product.status,
                category: product.category,
                description: product.description || '',
                images: product.images,
            });
        } else {
            navigate('/admin/productmanagent');
        }
    }, [location, navigate]);

    const handleThumbnailClick = (index) => {
        setSelectedImageIndex(index);
    };

    return (
        <Box className={cx('container')}>
            <Grid container spacing={3} className={cx('content-grid')}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} className={cx('header-paper')}>
                        <Typography variant="h3" component="h1" className={cx('product-name')}>
                            {productData.name}
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell component="th" scope="row" width="40%">ID</TableCell>
                                        <TableCell width="60%">{productData.id}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row" width="40%">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <LocalOffer className={cx('icon')} color="primary" />
                                                Giá nhập
                                            </Box>
                                        </TableCell>
                                        <TableCell width="60%">{`${parseInt(productData.importPrice).toLocaleString()} đ`}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row" width="40%">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <LocalOffer className={cx('icon')} color="secondary" />
                                                Giá bán
                                            </Box>
                                        </TableCell>
                                        <TableCell width="60%">{`${parseInt(productData.sellingPrice).toLocaleString()} đ`}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row" width="40%">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Inventory2 className={cx('icon')} color="info" />
                                                Số lượng
                                            </Box>
                                        </TableCell>
                                        <TableCell width="60%">{productData.quantity}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row" width="40%">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Category className={cx('icon')} color="warning" />
                                                Danh mục
                                            </Box>
                                        </TableCell>
                                        <TableCell width="60%">{productData.category}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row" width="40%">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {productData.status === 'Còn hàng' ? (
                                                    <CheckCircle className={cx('icon')} color="success" />
                                                ) : (
                                                    <Cancel className={cx('icon')} color="error" />
                                                )}
                                                Trạng thái
                                            </Box>
                                        </TableCell>
                                        <TableCell width="60%">
                                            <Chip
                                                label={productData.status}
                                                color={productData.status === 'Còn hàng' ? 'success' : 'error'}
                                                size="small"
                                                className={cx('status-chip')}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} className={cx('paper')}>
                        <Typography variant="h6" component="h3" className={cx('section-title')}>
                            Hình ảnh sản phẩm
                        </Typography>
                        <Gallery>
                            <Box className={cx('gallery-container')}>
                                {productData.images.map((image, index) => (
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
                                                className={cx('product-image')}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        )}
                                    </Item>
                                ))}
                            </Box>
                        </Gallery>
                    </Paper>
                </Grid>
            </Grid>
            <Paper elevation={3} className={cx('description-paper')}>
                <Typography variant="h6" component="h3" className={cx('section-title')}>
                    Mô tả sản phẩm
                </Typography>
                <Typography variant="body1" paragraph>
                    {productData.description}
                </Typography>
            </Paper>
            <Box className={cx('button-container')}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/admin/productmanagent')}
                    className={cx('back-button')}
                >
                    Quay lại
                </Button>
                <Button
                    variant="contained"
                    endIcon={<Edit />}
                    onClick={() => navigate('/admin/editproduct', { state: { product: productData } })}
                    className={cx('edit-button')}
                >
                    Chỉnh sửa sản phẩm
                </Button>
            </Box>
        </Box>
    );
}

export default DetailProduct;