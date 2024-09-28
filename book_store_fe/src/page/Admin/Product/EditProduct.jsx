import React, { useState, useLayoutEffect, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import style from './EditProduct.module.scss';
import classNames from 'classnames/bind';
import CloseIcon from '@mui/icons-material/Close';
import {
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Grid,
    TextareaAutosize,
    Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const cx = classNames.bind(style);

const CurrencySymbol = () => (
    <Typography
        component="span"
        sx={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textDecoration: 'underline',
            marginLeft: '4px'
        }}
    >
        đ
    </Typography>
);

function EditProduct() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        importPrice: '',
        sellingPrice: '',
        quantity: '',
        status: 'Còn hàng',
        category: '',
        description: '',
    });
    const [selectedImages, setSelectedImages] = useState([]);

    useEffect(() => {
        if (location.state && location.state.product) {
            const product = location.state.product;
            setFormData({
                id: product.id,
                name: product.name,
                importPrice: product.importPrice.toString(),
                sellingPrice: product.sellingPrice.toString(),
                quantity: product.quantity.toString(),
                status: product.status,
                category: product.category,
                description: product.description || '',
            });
            // Handle multiple images
            if (Array.isArray(product.images)) {
                setSelectedImages(product.images);
            } else if (product.image) {
                setSelectedImages([product.image]);
            }
        } else {
            navigate('/admin/productmanagent');
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(prevImages => [...prevImages, ...files]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Updating:', { ...formData, images: selectedImages });
        navigate('/admin/productmanagent');
    };

    const handleRemoveImage = (index) => {
        setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index));
    };

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    useLayoutEffect(() => {
        const resizeObserver = new ResizeObserver(
            debounce((entries) => {
                for (let entry of entries) {
                    if (entry.contentBoxSize) {
                        console.log('Content resized');
                    }
                }
            }, 100)
        );

        const elements = document.querySelectorAll('.image-container');
        elements.forEach(el => resizeObserver.observe(el));

        return () => {
            resizeObserver.disconnect();
        };
    }, [selectedImages]);

    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <Box component="form" onSubmit={handleSubmit} className={cx('form')}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} className={cx('paper')}>
                            <Typography variant="h5" component="h2" className={cx('section-title')}>
                                Chỉnh sửa thông tin sản phẩm
                            </Typography>
                            <TextField
                                fullWidth
                                label="Tên sách"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField
                                fullWidth
                                label="Giá nhập"
                                name="importPrice"
                                type="number"
                                value={formData.importPrice}
                                onChange={handleChange}
                                required
                                margin="normal"
                                variant="outlined"
                                InputProps={{
                                    endAdornment: <CurrencySymbol />,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Giá bán"
                                name="sellingPrice"
                                type="number"
                                value={formData.sellingPrice}
                                onChange={handleChange}
                                required
                                margin="normal"
                                variant="outlined"
                                InputProps={{
                                    endAdornment: <CurrencySymbol />,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Số lượng"
                                name="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                margin="normal"
                                variant="outlined"
                            />
                            <FormControl fullWidth margin="normal" variant="outlined">
                                <InputLabel id="status-label">Trạng thái</InputLabel>
                                <Select
                                    labelId="status-label"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    label="Trạng thái"
                                >
                                    <MenuItem value="Còn hàng">Còn hàng</MenuItem>
                                    <MenuItem value="Hết hàng">Hết hàng</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal" variant="outlined">
                                <InputLabel id="category-label">Danh mục</InputLabel>
                                <Select
                                    labelId="category-label"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    label="Danh mục"
                                    required
                                >
                                    <MenuItem value="Tiểu thuyết">Tiểu thuyết</MenuItem>
                                    <MenuItem value="Khoa học viễn tưởng">Khoa học viễn tưởng</MenuItem>
                                    <MenuItem value="Lãng mạn">Lãng mạn</MenuItem>
                                    <MenuItem value="Phiêu lưu">Phiêu lưu</MenuItem>
                                    <MenuItem value="Fiction">Fiction</MenuItem>
                                    <MenuItem value="Non-fiction">Non-fiction</MenuItem>
                                    <MenuItem value="Science">Science</MenuItem>
                                    <MenuItem value="History">History</MenuItem>
                                </Select>
                            </FormControl>
                            <TextareaAutosize
                                minRows={3}
                                maxRows={5}
                                placeholder="Mô tả sản phẩm"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className={cx('description')}
                                style={{ width: '100%', height: 'auto' }}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} className={cx('paper')}>
                            <Typography variant="h5" component="h2" className={cx('section-title')}>
                                Hình ảnh sản phẩm
                            </Typography>
                            <Box className={cx('image-preview')}>
                                <input
                                    accept="image/*"
                                    className={cx('input')}
                                    id="contained-button-file"
                                    multiple
                                    type="file"
                                    onChange={handleImageChange}
                                />
                                <label htmlFor="contained-button-file" className={cx('upload-label')}>
                                    <Box className={cx('upload-box')}>
                                        <CloudUploadIcon className={cx('upload-icon')} />
                                        <Typography variant="body1">
                                            Click để chọn ảnh
                                        </Typography>
                                    </Box>
                                </label>
                                {selectedImages.map((image, index) => (
                                    <Box key={index} className={cx('image-container')}>
                                        <img
                                            src={image instanceof File ? URL.createObjectURL(image) : image}
                                            alt={`Preview ${index + 1}`}
                                            className={cx('preview-image')}
                                        />
                                        <Box
                                            className={cx('remove-button')}
                                            onClick={() => handleRemoveImage(index)}
                                        >
                                            <CloseIcon />
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
                <Box className={cx('button-group')}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/admin/productmanagent')}
                        className={cx('cancel-button')}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        className={cx('submit-button')}
                    >
                        Cập nhật sản phẩm
                    </Button>
                </Box>
            </Box>
        </React.Suspense>
    );
}

export default EditProduct;