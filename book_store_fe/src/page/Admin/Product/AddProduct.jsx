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
    Chip,
    FormHelperText,
    createFilterOptions,
    Tooltip,
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
import { useMutation, useQuery } from '@tanstack/react-query';
import ProductService from '../../../service/ProductService';
import ModalLoading from '../../../component/Modal/ModalLoading/ModalLoading';
import { corverTypeData, statusData, yearOfPublicationData } from '../../../utills/ProductManagerUtills';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Star } from '@mui/icons-material';

const filter = createFilterOptions();

const cx = classNames.bind(style);
window.Quill = Quill;

Quill.register('modules/imageResize', ImageResize);

function AddProduct() {
    const navigate = useNavigate();
    const [indexRemove, setIndexRemove] = useState(null);
    const validationSchema = Yup.object({
        name: Yup.string().required('Vui lòng nhập tên sách.'),
        size: Yup.object({
            x: Yup.number().required('x is required').min(0, 'min is 200').max(200, 'max is 200'),
            y: Yup.number().required('y is required').min(0, 'min is 200').max(200, 'max is 200'),
            z: Yup.number().required('z is required').min(0, 'min is 200').max(200, 'max is 200'),
        }),
        weight: Yup.number()
            .required('Vui lòng nhập khối lượng.')
            .min(1, 'Phải lớn hơn 0')
            .max(2000, 'Tối đa 2000 gam'),
        quantity: Yup.number().required('Vui lòng nhập số lượng.').min(1, 'Phải lớn hơn 0'),
        numberOfPages: Yup.number().required('Vui lòng nhập số trang.').min(1, 'Phải lớn hơn 0'),
        cost: Yup.number().required('Vui lòng nhập giá nhập.'),
        originalPrice: Yup.number().required('Vui lòng nhập giá bán.'),
        publisherId: Yup.string().required('Vui lòng chọn nhà phát hành.'),
        manufacturer: Yup.string().required('Vui lòng nhập NXB.'),
        categoriesId: Yup.array().of(Yup.string()).min(1, 'Vui lòng chọn ít nhất 1 thể loại.'),
        authorsId: Yup.array().of(Yup.string()).min(1, 'Vui lòng chọn ít nhất 1 tác giả.'),
        translator: Yup.string().nullable(),
        selectedImages: Yup.array().of(Yup.string()).min(1, 'Vui lòng chọn ít nhất 1 ảnh sản phẩm.'),
        description: Yup.string().required('Vui lòng nhập mô tả sản phẩm'),
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const quillRef = useRef(null);
    const inputImgRef = useRef(null);
    const insertProductMutation = useMutation({
        mutationFn: (data) => {
            const {
                size: { x: length, y: width, z: height },
                selectedImages,
                indexThumbNail,
                ...rest
            } = data;
            const product = { ...rest, length, width, height };
            return ProductService.insertProduct(product, selectedImages, indexThumbNail);
        },
        onError: (error) => {
            console.log(error);
        },
        onSuccess: () => {
            toast.success("Thành công!")
            navigate("/admin/product");
        }
    });
    const formik = useFormik({
        initialValues: {
            name: '',
            publisherId: '',
            numberOfPages: '',
            yearOfPublication: '',
            cost: '',
            originalPrice: '',
            size: { x: 10, y: 10, z: 10 },
            weight: '',
            quantity: '',
            status: 0,
            coverType: 0,
            manufacturer: '',
            categoriesId: [],
            authorsId: [],
            translator: '',
            description: '',
            selectedImages: [],
            indexThumbNail: 0,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            console.log('Form data:', values);
            insertProductMutation.mutate(values);
        },
        validateOnBlur: false,
        validateOnChange: false,
    });
    const formRefs = useRef({});
    const handleFormikErrors = (errors) => {
        const firstErrorField = Object.keys(errors).find((key) => {
            if (typeof errors[key] === 'object') {
                return Object.keys(errors[key]).length > 0;
            }
            return true;
        });
        if (firstErrorField) {
            const nestedField =
                typeof errors[firstErrorField] === 'object'
                    ? `${firstErrorField}.${Object.keys(errors[firstErrorField])[0]}`
                    : firstErrorField;
            if (formRefs.current[nestedField]) {
                formRefs.current[nestedField].focus();
                formRefs.current[nestedField].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    useEffect(() => {
        if (formik.submitCount > 0) {
            formik.validateForm().then((errors) => {
                if (Object.keys(errors).length > 0) {
                    handleFormikErrors(errors);
                }
            });
        }
    }, [formik.submitCount]);

    const handleImageChange = (e) => {
        let files = Array.from(e.target.files);
        if (formik.values.selectedImages.length + files.length > 10) {
            setOpenSnackbar(true);
            return;
        }
        files = files.filter((file) => {
            const isDuplicate = formik.values.selectedImages.some((img) => img.name === file.name);
            if (isDuplicate) {
                toast.warn('Vui lòng chọn các ảnh sản phẩm khác nhau!', { position: 'bottom-right' });
            }
            return !isDuplicate;
        });
        files.forEach((file) => {
            file.preview = URL.createObjectURL(file);
        });
        formik.setFieldValue('selectedImages', [...formik.values.selectedImages, ...files].slice(0, 10));
    };

    const handleRemoveImage = (index) => {
        setIndexRemove(index);
        const oldImgs = formik.values.selectedImages;
        const imageToRemove = oldImgs[index];
        if (imageToRemove && imageToRemove.preview) {
            URL.revokeObjectURL(imageToRemove.preview);
        }
        const newImg = oldImgs.filter((_, i) => i !== index);
        inputImgRef.current.value = null;
        formik.setValues({
            ...formik.values,
            indexThumbNail: 0,
            selectedImages: newImg,
        });
    };
    useEffect(() => {
        if (formik.values.indexThumbNail === indexRemove && indexRemove !== 0) {
            formik.setFieldValue('indexThumbNail', indexRemove - 1);
        }
    }, [indexRemove, formik.values.indexThumbNail]);

    const uploadImgInDesc = useMutation({
        mutationFn: (data) => ProductService.uploadImgInDescription(data),
        onError: (error) => {
            console.log(error);
        },
    });

    const {
        data: attibutes,
        error,
        isLoading: loadingFetchAttributes,
    } = useQuery({
        queryKey: ['attributes'],
        queryFn: () => ProductService.getAttributes().then((res) => res.data),
        retry: 0,
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
    const renderTextField = (name, label, type = 'text', required = false, key, sx) => {
        const isSizeField = name.startsWith('size.');
        const fieldKey = isSizeField ? name.split('.')[1] : name;
        return (
            <TextField
                key={key === null ? undefined : key}
                size="small"
                fullWidth
                label={label}
                name={name}
                type={type}
                value={isSizeField ? formik.values.size?.[fieldKey] : formik.values[fieldKey]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={isSizeField ? Boolean(formik.errors.size?.[fieldKey]) : Boolean(formik.errors[fieldKey])}
                helperText={isSizeField ? null : formik.errors[fieldKey]}
                required={required}
                margin="normal"
                variant="outlined"
                inputRef={(el) => (formRefs.current[name] = el)}
                sx={sx}
            />
        );
    };

    return (
        <Box className={cx('form')}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6} sx={{ height: '100%' }}>
                    <Paper elevation={3} className={cx('paper')} sx={{ overflow: 'hidden !important' }}>
                        <Typography variant="h5" component="h2" className={cx('section-title')}>
                            Thông tin sản phẩm
                        </Typography>
                        {renderTextField('name', 'Tên sách', 'text', true)}
                        <div className="row gap-3 m-0 my-3 align-items-center">
                            <FormControl size="small" sx={{ flex: '1' }}>
                                <InputLabel htmlFor="status-select">Trạng thái</InputLabel>
                                <Select
                                    id="status"
                                    name="status"
                                    label="Trạng thái"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
                                >
                                    {statusData.map((stt, i) => (
                                        <MenuItem key={i} value={stt.code}>
                                            {stt.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ flex: '1' }}>
                                <InputLabel htmlFor="coverType">Loại bìa</InputLabel>
                                <Select
                                    id="coverType"
                                    name="coverType"
                                    label="Loại bìa"
                                    value={formik.values.coverType}
                                    onChange={formik.handleChange}
                                >
                                    {corverTypeData.map((stt, k) => (
                                        <MenuItem key={k} value={stt.code}>
                                            {stt.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Autocomplete
                                disableClearable
                                options={yearOfPublicationData.map((year) => ({ label: year, code: year }))}
                                value={
                                    yearOfPublicationData.find(
                                        (option) => option?.code === formik.values.yearOfPublication,
                                    )
                                }
                                renderInput={(params) => <TextField {...params} label="Năm xuất bản" />}
                                size="small"
                                onChange={(event, newValue) => {                                    
                                    formik.setFieldValue('yearOfPublication', newValue ? newValue.code : '');
                                }}
                                isOptionEqualToValue={(option, value) => option.code === value.code}
                                sx={{ flex: '1', margin: '0', padding: '0' }}
                            />
                        </div>
                        <div className="row gap-3 m-0 my-3">
                            <div className="row gap-2" style={{ flex: '2' }}>
                                {['x', 'y', 'z'].map((dimension, index) =>
                                    renderTextField(
                                        `size.${dimension}`,
                                        dimension === 'x' ? 'Dài' : dimension === 'y' ? 'Rộng' : 'Cao',
                                        'number',
                                        true,
                                        index,
                                        { flex: '1', margin: '0' },
                                    ),
                                )}

                                <FormHelperText sx={{ color: '#d32f2f' }}>
                                    {formik.errors.size
                                        ? `Size ${Object.keys(formik.errors.size).join(', ')} is required and must be ≤ 200`
                                        : ''}
                                </FormHelperText>
                            </div>
                            {renderTextField('weight', 'KL(gram)', 'number', true, null, {
                                flex: '1',
                                margin: '0',
                                padding: '0',
                            })}
                        </div>
                        <div className="row gap-3 m-0 my-3">
                            {renderTextField('quantity', 'Số lượng', 'number', true, null, {
                                flex: '1',
                                margin: '0',
                            })}

                            {renderTextField('numberOfPages', 'Số trang', 'number', true, null, {
                                flex: '1',
                                margin: '0',
                                padding: '0',
                            })}
                        </div>

                        <div className="row gap-3 m-0 my-3">
                            <FormControl size="small" sx={{ flex: '1' }} required error={Boolean(formik.errors.cost)}>
                                <InputLabel htmlFor="cost-price">Giá nhập</InputLabel>
                                <OutlinedInput
                                    id="cost-price"
                                    type={'number'}
                                    endAdornment={<InputAdornment position="end">₫</InputAdornment>}
                                    value={formik.values.cost || ''}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    name="cost"
                                    label="Giá nhập"
                                    inputRef={(el) => (formRefs.current['cost'] = el)}
                                />
                                {formik.errors.cost && (
                                    <FormHelperText sx={{ color: '#d32f2f' }}>{formik.errors.cost}</FormHelperText>
                                )}
                            </FormControl>
                            <FormControl
                                size="small"
                                sx={{ flex: '1' }}
                                required
                                error={Boolean(formik.errors.originalPrice)}
                            >
                                <InputLabel htmlFor="selling-price">Giá bán</InputLabel>
                                <OutlinedInput
                                    id="selling-price"
                                    type={'number'}
                                    endAdornment={<InputAdornment position="end">₫</InputAdornment>}
                                    value={formik.values.originalPrice || ''}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    name="originalPrice"
                                    label="Giá bán"
                                    inputRef={(el) => (formRefs.current['originalPrice'] = el)}
                                />
                                {formik.errors.originalPrice && (
                                    <FormHelperText sx={{ color: '#d32f2f' }}>
                                        {formik.errors.originalPrice}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </div>
                        <div className="row gap-3 m-0 my-3">
                            <Autocomplete
                                disableClearable
                                options={attibutes?.publishers || []}
                                value={
                                    attibutes?.publishers.find((pub) => pub.id === formik.values.publisherId) || null
                                }
                                onChange={(event, newValue) => {
                                    formik.setFieldValue('publisherId', newValue ? newValue.id : null);
                                    const newPub = newValue.name.startsWith('Thêm');
                                    if (newPub) {
                                        navigate('/admin/attributes');
                                    }
                                }}
                                filterOptions={(options, params) => {
                                    const filtered = filter(options, params);
                                    const { inputValue } = params;
                                    const isExisting = options.some((option) => inputValue === option.name);
                                    if (inputValue !== '' && !isExisting) {
                                        filtered.push({
                                            id: inputValue,
                                            name: `Thêm nhà phát hành mới`,
                                        });
                                    }
                                    return filtered;
                                }}
                                getOptionLabel={(option) => option.name}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Nhà phát hành"
                                        inputRef={(el) => (formRefs.current['publisherId'] = el)}
                                        error={Boolean(formik.errors.publisherId)} // Error handling
                                        helperText={formik.errors.publisherId} // Display error message
                                    />
                                )}
                                size="small"
                                sx={{ flex: '1', margin: '0', padding: '0' }}
                            />
                            {renderTextField('manufacturer', 'NXB', 'text', true, null, {
                                flex: '1',
                                margin: '0',
                            })}
                        </div>

                        <div className="row gap-3 m-0 my-3">
                            <Autocomplete
                                multiple
                                limitTags={2}
                                disableClearable
                                options={attibutes?.categories || []}
                                value={formik.values.categoriesId
                                    .map((id) => attibutes.categories.find((category) => category.id === id))
                                    .filter(Boolean)}
                                onChange={(event, newValue) => {
                                    formik.setFieldValue(
                                        'categoriesId',
                                        newValue.map((author) => author.id),
                                    );

                                    const newCate = newValue.find((option) => option.name.startsWith('Thêm'));
                                    if (newCate) {
                                        navigate('/admin/attributes');
                                    }
                                }}
                                filterOptions={(options, params) => {
                                    const filtered = filter(options, params);
                                    const { inputValue } = params;
                                    const isExisting = options.some((option) => inputValue === option.name);
                                    if (inputValue !== '' && !isExisting) {
                                        filtered.push({
                                            id: inputValue,
                                            name: `Thêm thể loại mới`,
                                        });
                                    }
                                    return filtered;
                                }}
                                getOptionLabel={(option) => option.name}
                                renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option, index) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return <Chip key={key} label={option.name} {...tagProps} size="small" />; // Chỉnh sửa để hiển thị tên
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        label="Thể loại"
                                        inputRef={(el) => (formRefs.current['categoriesId'] = el)}
                                        error={Boolean(formik.errors.categoriesId)}
                                        helperText={formik.errors.categoriesId}
                                    />
                                )}
                                size="small"
                                sx={{ flex: '1', margin: '0', padding: '0' }}
                            />
                        </div>
                        <div className="row gap-3 m-0 my-3">
                            <Autocomplete
                                multiple
                                limitTags={2}
                                disableClearable
                                options={attibutes?.authors || []}
                                value={formik.values.authorsId
                                    .map((id) => attibutes?.authors.find((author) => author.id === id))
                                    .filter((author) => author !== undefined)}
                                onChange={(event, newValue) => {
                                    formik.setFieldValue(
                                        'authorsId',
                                        newValue.map((author) => author.id),
                                    );

                                    const newAuthor = newValue.find((option) => option.name.startsWith('Thêm'));
                                    if (newAuthor) {
                                        navigate('/admin/attributes');
                                    }
                                }}
                                getOptionLabel={(option) => option.name}
                                renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option, index) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return <Chip key={key} label={option.name} {...tagProps} size="small" />;
                                    })
                                }
                                filterOptions={(options, params) => {
                                    const filtered = filter(options, params);
                                    const { inputValue } = params;
                                    const isExisting = options.some((option) => inputValue === option.name);
                                    if (inputValue !== '' && !isExisting) {
                                        filtered.push({
                                            id: inputValue,
                                            name: `Thêm tác giả mới`,
                                        });
                                    }
                                    return filtered;
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        inputRef={(el) => (formRefs.current['authorsId'] = el)}
                                        label="Tác giả"
                                        error={Boolean(formik.errors.authorsId)}
                                        helperText={formik.errors.authorsId}
                                    />
                                )}
                                size="small"
                                sx={{ flex: '1', margin: '0', padding: '0' }}
                            />
                            {renderTextField('translator', 'Dịch giả', 'text', false, null, {
                                flex: '1',
                                margin: '0',
                            })}
                        </div>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} sx={{ height: '100%' }}>
                    <Paper elevation={3} className={cx('paper')}>
                        <Typography variant="h5" component="h2" className={cx('section-title')}>
                            Hình ảnh sản phẩm (Tối đa 10 ảnh)
                            <br />
                            <span style={{ fontSize: '1.3rem' }}>
                                Có thể click để chọn 1 ảnh làm thumbnail.
                                {Boolean(formik.errors.selectedImages) && (
                                    <FormHelperText sx={{ color: '#d32f2f', display: 'inline' }}>
                                        {formik.errors.selectedImages}
                                    </FormHelperText>
                                )}
                            </span>
                        </Typography>
                        <Box className={cx('image-preview')}>
                            <input
                                ref={inputImgRef}
                                accept="image/*"
                                className={cx('input')}
                                id="contained-button-file"
                                multiple
                                type="file"
                                onChange={handleImageChange}
                                disabled={formik.values.selectedImages?.length >= 10}
                            />
                            <label htmlFor="contained-button-file" className={cx('upload-label')}>
                                <Box
                                    className={cx('upload-box', {
                                        disabled: formik.values.selectedImages?.length >= 10,
                                    })}
                                >
                                    <CloudUploadIcon className={cx('upload-icon')} />
                                    <Typography variant="body1" sx={{ fontSize: '1.3rem', opacity: '.8' }}>
                                        {formik.values.selectedImages?.length >= 10
                                            ? 'Đã đạt giới hạn ảnh'
                                            : 'Click để chọn ảnh'}
                                    </Typography>
                                </Box>
                            </label>
                            {formik.values.selectedImages?.map((image, index) => (
                                <Box
                                    key={index}
                                    className={cx('image-container')}
                                    onClick={() => formik.setFieldValue('indexThumbNail', index)}
                                >
                                    <img
                                        src={image.preview}
                                        alt={`Preview ${index + 1}`}
                                        className={cx('preview-image')}
                                    />
                                    {formik.values.indexThumbNail === index && (
                                        <Tooltip title="Thumbnail" placement="top-start" arrow>
                                            <Star className={cx('thumbnail-icon')} />
                                        </Tooltip>
                                    )}
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
                <Typography variant="h6" component="h4" className={cx('description-title')}>
                    Mô tả
                </Typography>
                <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={formik.values.description}
                    onChange={(value) => formik.setFieldValue('description', value)}
                    modules={modules}
                    formats={formats}
                />
                {Boolean(formik.errors.description) && (
                    <FormHelperText sx={{ color: '#d32f2f' }}>{formik.errors.description}</FormHelperText>
                )}
            </div>
            <Box className={cx('button-group')}>
                <Button variant="outlined" onClick={() => navigate('/admin/product')} className={cx('cancel-button')}>
                    Hủy
                </Button>
                <Button type="submit" variant="contained" className={cx('submit-button')} onClick={formik.handleSubmit}>
                    Thêm sản phẩm
                </Button>
            </Box>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                message="Chỉ được chọn tối đa 4 ảnh"
            />
            <ModalLoading
                isLoading={uploadImgInDesc.isPending || loadingFetchAttributes || insertProductMutation.isPending}
            />
        </Box>
    );
}

export default AddProduct;
