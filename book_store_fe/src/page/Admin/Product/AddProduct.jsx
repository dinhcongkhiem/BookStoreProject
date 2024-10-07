import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Autocomplete,
    InputAdornment,
    OutlinedInput,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import style from './AddProduct.module.scss';
import classNames from 'classnames/bind';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import { toast } from 'react-toastify';
import { formats, modules } from '../../../utills/ReactQuillConfig';
import { useMutation } from '@tanstack/react-query';
import ProductService from '../../../service/ProductService';
import ModalLoading from '../../../component/Modal/ModalLoading/ModalLoading';
import { corverTypeData, statusData, yearOfPublicationData } from '../../../utills/ProductManagerUtills';
const cx = classNames.bind(style);
window.Quill = Quill;

Quill.register('modules/imageResize', ImageResize);

function AddProduct() {
    const navigate = useNavigate();

    const [name, setName] = useState();
    const [publisherId, setPublisherId] = useState();
    const [numberOfPages, setNumberOfPages] = useState();
    const [yearOfPublication, setYearOfPublication] = useState();
    const [cost, setCost] = useState();
    const [originalPrice, setOriginalPrice] = useState();
    const [size, setSize] = useState();
    const [quantity, setQuantity] = useState();
    const [status, setStatus] = useState(0);
    const [coverType, setCoverType] = useState(0);
    const [manufacturer, setManufacturer] = useState();
    const [categoriesId, setCategoriesId] = useState([]);
    const [authorsId, setAuthorsId] = useState([]);
    const [description, setDescription] = useState([]);

    const [selectedImages, setSelectedImages] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const quillRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleImageChange = (e) => {
        let files = Array.from(e.target.files);
        if (selectedImages.length + files.length > 10) {
            setOpenSnackbar(true);
            return;
        }
        files = files.filter((file) => {
            const isDuplicate = selectedImages.some((img) => img.name === file.name);
            if (isDuplicate) {
                toast.warn('Vui lòng chọn các ảnh sản phẩm khác nhau!', { position: 'bottom-right' });
            }
            return !isDuplicate;
        });

        files.forEach((file) => {
            file.preview = URL.createObjectURL(file);
        });

        setSelectedImages((prevImages) => [...prevImages, ...files].slice(0, 10));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log('Submitting:', { ...formData, images: selectedImages });
        // navigate('/admin/product');
    };

    const handleRemoveImage = (index) => {
        setSelectedImages((prevImages) => {
            const imageToRemove = prevImages[index];
            if (imageToRemove && imageToRemove.preview) {
                URL.revokeObjectURL(imageToRemove.preview);
            }
            return prevImages.filter((_, i) => i !== index);
        });
    };

    const uploadImgInDesc = useMutation({
        mutationFn: (data) => ProductService.uploadImgInDescription(data),
        onError: (error) => {
            console.log(error);
        },
    });

    useEffect(() => {
        const quill = quillRef?.current?.getEditor();
        const toolbar = quill?.getModule('toolbar');

        toolbar?.addHandler('image', () => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
                if (!input.files || !input?.files?.length || !input?.files?.[0]) return;

                const editor = quillRef?.current?.getEditor();
                const file = input.files[0];
                const range = editor.getSelection(true);
                const formDataReq = new FormData();
                formDataReq.append('file', file);

                uploadImgInDesc.mutate(formDataReq, {
                    onSuccess: (urlImg) => {
                        console.log(urlImg);

                        if (urlImg) {
                            editor.insertEmbed(range.index, 'image', urlImg.data);
                        }
                    },
                });
            };
        });
    }, [quillRef]);

    if (uploadImgInDesc.isLoading) {
        setIsLoading(true);
    }

    return (
        <Box component="form" onSubmit={handleSubmit} className={cx('form')}>
            <Grid container spacing={3} sx={{ height: '48.5rem;' }}>
                <Grid item xs={12} md={6} sx={{ height: '100%' }}>
                    <Paper elevation={3} className={cx('paper')} sx={{ overflow: 'hidden !important' }}>
                        <Typography variant="h5" component="h2" className={cx('section-title')}>
                            Thông tin sản phẩm
                        </Typography>
                        <TextField
                            size="small"
                            fullWidth
                            label="Tên sách"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            margin="normal"
                            variant="outlined"
                        />

                        <div className="row gap-3 m-0 my-3">
                            <TextField
                                size="small"
                                fullWidth
                                label="Số lượng"
                                name="quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                margin="normal"
                                variant="outlined"
                                sx={{ flex: '1', margin: '0' }}
                            />
                            <TextField
                                size="small"
                                fullWidth
                                label="Số trang"
                                name="quantity"
                                type="number"
                                value={numberOfPages}
                                onChange={(e) => setNumberOfPages(e.target.value)}
                                required
                                margin="normal"
                                variant="outlined"
                                sx={{ flex: '1', margin: '0' }}
                            />
                            <TextField
                                size="small"
                                fullWidth
                                label="Kích thước"
                                name="quantity"
                                type="number"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                required
                                margin="normal"
                                variant="outlined"
                                sx={{ flex: '1', margin: '0' }}
                            />
                        </div>
                        <div className="row gap-3 m-0 my-3 align-items-center">
                            <FormControl size="small" sx={{ flex: '1' }}>
                                <InputLabel htmlFor="status-select">Trạng thái</InputLabel>
                                <Select
                                    labelId="status-select-label"
                                    id="status-select"
                                    value={status}
                                    label="Trạng thái"
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    {statusData.map((stt) => (
                                        <MenuItem value={stt.code}>{stt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ flex: '1' }}>
                                <InputLabel htmlFor="coverType-select">Loại bìa</InputLabel>
                                <Select
                                    labelId="coverType-select-label"
                                    id="coverType-select"
                                    value={coverType}
                                    label="Loại bìa"
                                    onChange={(e) => setCoverType(e.target.value)}
                                >
                                    {corverTypeData.map((stt) => (
                                        <MenuItem value={stt.code}>{stt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Autocomplete
                                disableClearable
                                options={yearOfPublicationData.map((year) => ({ label: year, code: year }))}
                                value={yearOfPublication}
                                renderInput={(params) => <TextField {...params} label="Năm xuất bản" />}
                                size="small"
                                onChange={(e) => setYearOfPublication(e.target.value)}
                                sx={{ flex: '1' }}
                            />
                        </div>
                        <div className="row gap-3 m-0 my-3">
                            <FormControl size="small" sx={{ flex: '1' }} required>
                                <InputLabel htmlFor="outlined-adornment-password">Giá nhập</InputLabel>
                                <OutlinedInput
                                    id="outlined-adornment-password"
                                    type={'number'}
                                    endAdornment={<InputAdornment position="end">₫</InputAdornment>}
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    label="Mật khẩu"
                                />
                                {/* <FormHelperText>{listErr.password ? 'Vui lòng nhập mật khẩu' : ''}</FormHelperText> */}
                            </FormControl>
                            <FormControl size="small" sx={{ flex: '1' }} required>
                                <InputLabel htmlFor="outlined-adornment-password">Giá bán</InputLabel>
                                <OutlinedInput
                                    id="outlined-adornment-password"
                                    type={'number'}
                                    endAdornment={<InputAdornment position="end">₫</InputAdornment>}
                                    value={originalPrice}
                                    onChange={(e) => {
                                        if(e.target.value) {
                                            
                                        }
                                        setOriginalPrice(e.target.value)
                                    }}
                                    label="Mật khẩu"
                                />
                                {/* <FormHelperText>{listErr.password ? 'Vui lòng nhập mật khẩu' : ''}</FormHelperText> */}
                            </FormControl>
                        </div>
                        <div className="row gap-3 m-0 my-3">
                            <TextField
                                size="small"
                                label="Nhà phát hành"
                                inputProps={{
                                    min: 0,
                                }}
                                value={publisherId}
                                onChange={(e) => setPublisherId(e.target.value)}
                                required
                                margin="normal"
                                variant="outlined"
                                sx={{ flex: '1', margin: '0' }}
                            />
                            <TextField
                                size="small"
                                label="NXB"
                                name="sellingPrice"
                                inputProps={{
                                    min: 0,
                                }}
                                type="number"
                                value={manufacturer}
                                onChange={(e) => setManufacturer(e.target.value)}
                                required
                                margin="normal"
                                variant="outlined"
                                className="col-6"
                                sx={{ flex: '1', margin: '0' }}
                            />
                        </div>

                        <div className="row gap-3 m-0 my-3">
                            <TextField
                                size="small"
                                label="Tác giả"
                                name="importPrice"
                                type="number"
                                inputProps={{
                                    min: 0,
                                }}
                                value={authorsId}
                                onChange={(e) => setAuthorsId(e.target.value)}
                                required
                                margin="normal"
                                variant="outlined"
                                sx={{ flex: '1', margin: '0' }}
                            />
                            <TextField
                                size="small"
                                label="Thể loại"
                                name="sellingPrice"
                                inputProps={{
                                    min: 0,
                                }}
                                type="number"
                                value={categoriesId}
                                onChange={(e) => setCategoriesId(e.target.value)}
                                required
                                margin="normal"
                                variant="outlined"
                                className="col-6"
                                sx={{ flex: '1', margin: '0' }}
                            />
                        </div>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} sx={{ height: '100%' }}>
                    <Paper elevation={3} className={cx('paper')}>
                        <Typography variant="h5" component="h2" className={cx('section-title')}>
                            Hình ảnh sản phẩm (Tối đa 10 ảnh)
                            <br />
                            <span style={{ fontSize: '1.3rem' }}>Có thể click để chọn 1 ảnh làm thumbnail.</span>
                        </Typography>
                        <Box className={cx('image-preview')}>
                            <input
                                accept="image/*"
                                className={cx('input')}
                                id="contained-button-file"
                                multiple
                                type="file"
                                onChange={handleImageChange}
                                disabled={selectedImages.length >= 10}
                            />
                            <label htmlFor="contained-button-file" className={cx('upload-label')}>
                                <Box className={cx('upload-box', { disabled: selectedImages.length >= 10 })}>
                                    <CloudUploadIcon className={cx('upload-icon')} />
                                    <Typography variant="body1" sx={{ fontSize: '1.3rem', opacity: '.8' }}>
                                        {selectedImages.length >= 10 ? 'Đã đạt giới hạn ảnh' : 'Click để chọn ảnh'}
                                    </Typography>
                                </Box>
                            </label>
                            {selectedImages.map((image, index) => {
                                console.log(selectedImages);

                                return (
                                    <Box
                                        key={index}
                                        className={cx('image-container')}
                                        onClick={() => console.log(selectedImages)}
                                    >
                                        <img
                                            src={image.preview}
                                            alt={`Preview ${index + 1}`}
                                            className={cx('preview-image')}
                                        />
                                        <Box className={cx('remove-button')} onClick={() => handleRemoveImage(index)}>
                                            <CloseIcon />
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            <div className={cx('description-container')}>
                <Typography variant="h6" component="h4" className={cx('description-title')}>
                    Mô tả
                </Typography>
                <ReactQuill
                    ref={quillRef}
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
                    Thêm sản phẩm
                </Button>
            </Box>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                message="Chỉ được chọn tối đa 4 ảnh"
            />
            <ModalLoading isLoading={isLoading} />
        </Box>
    );
}

export default AddProduct;
