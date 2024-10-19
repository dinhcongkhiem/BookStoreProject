import React, { useState, useLayoutEffect, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    Paper,
    Snackbar,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import style from './EditProduct.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

const CurrencySymbol = () => (
    <Typography
        component="span"
        sx={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textDecoration: 'underline',
            marginLeft: '4px',
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
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (location.state && location.state.product) {
            const product = location.state.product;
            setFormData({
                id: product.id,
                name: product.name,
                importPrice: product.importPrice?.toString(),
                sellingPrice: product.sellingPrice?.toString(),
                quantity: product.quantity?.toString(),
                status: product.status,
                category: product.category,
            });
            setDescription(product.description || '');
            if (Array.isArray(product.images)) {
                setSelectedImages(product.images);
            } else if (product.image) {
                setSelectedImages([product.image]);
            }
        } else {
            navigate('/admin/product');
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (selectedImages.length + files.length > 4) {
            setOpenSnackbar(true);
            return;
        }
        setSelectedImages((prevImages) => [...prevImages, ...files].slice(0, 4));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Updating:', { ...formData, images: selectedImages, description });
        navigate('/admin/product');
    };

    const handleRemoveImage = (index) => {
        setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
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
            }, 300),
        );

        const elements = document.querySelectorAll('.image-container');
        elements.forEach((el) => resizeObserver.observe(el));

        return () => {
            resizeObserver.disconnect();
        };
    }, [selectedImages]);

    const modules = {
        toolbar: [
            [{ header: '1' }, { header: '2' }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            ['link', 'image'],
            ['clean'],
        ],
        clipboard: {
            matchVisual: false,
        },
        imageResize: {
            parchment: ReactQuill.Quill.import('parchment'),
            modules: ['Resize', 'DisplaySize', 'Toolbar'],
        },
    };

    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'image',
        'color',
    ];

    return (
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
                                <MenuItem value="Fiction">Fiction</MenuItem>
                                <MenuItem value="Non-fiction">Non-fiction</MenuItem>
                                <MenuItem value="Science">Science</MenuItem>
                                <MenuItem value="History">History</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} className={cx('paper')}>
                        <Typography variant="h5" component="h2" className={cx('section-title')}>
                            Hình ảnh sản phẩm (Tối đa 4 ảnh)
                        </Typography>
                        <Box className={cx('image-preview')}>
                            <input
                                accept="image/*"
                                className={cx('input')}
                                id="contained-button-file"
                                multiple
                                type="file"
                                onChange={handleImageChange}
                                disabled={selectedImages.length >= 4}
                            />
                            <label htmlFor="contained-button-file" className={cx('upload-label')}>
                                <Box className={cx('upload-box', { disabled: selectedImages.length >= 4 })}>
                                    <CloudUploadIcon className={cx('upload-icon')} />
                                    <Typography variant="body1">
                                        {selectedImages.length >= 4 ? 'Đã đạt giới hạn ảnh' : 'Click để chọn ảnh'}
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
                                    <Box className={cx('remove-button')} onClick={() => handleRemoveImage(index)}>
                                        <CloseIcon />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            <div className={cx('description-container')}>
                <Typography variant="h5" component="h2" className={cx('description-title')}>
                    Mô tả
                </Typography>
                <ReactQuill
                    theme="snow"
                    value={description}
                    onChange={setDescription}
                    modules={modules}
                    formats={formats}
                />
            </div>
            <Box className={cx('button-group')}>
                <Button variant="outlined" onClick={() => navigate('/admin/product')} className={cx('cancel-button')}>
                    Hủy
                </Button>
                <Button type="submit" variant="contained" className={cx('submit-button')}>
                    Cập nhật sản phẩm
                </Button>
            </Box>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                message="Chỉ được chọn tối đa 4 ảnh"
            />
        </Box>
    );
}

export default EditProduct;
