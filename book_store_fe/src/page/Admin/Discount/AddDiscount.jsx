import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import style from './AddDiscount.module.scss';
import classNames from 'classnames/bind';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
    TextField,
    Button,
    Box,
    Typography,
    Grid,
    Paper,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    Checkbox,
    FormHelperText,
} from '@mui/material';
import { CalendarToday, Search, South } from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import ProductService from '../../../service/ProductService';
import useDebounce from '../../../hooks/useDebounce';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DiscountService from '../../../service/DiscountService';
import { toast } from 'react-toastify';
import { convertToISOString, formatDate } from '../../../utills/ConvertData';

const cx = classNames.bind(style);

function AddDiscount() {
    const { discountId } = useParams();

    const navigate = useNavigate();
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);
    const [startDateVal, setStartDateVal] = useState();
    const [endDateVal, setEndDateVal] = useState();

    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const searchTermDebouce = useDebounce(searchTerm.trim(), 0);
    const {
        data: productRes,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['productsToDiscount', searchTermDebouce, page],
        queryFn: () =>
            ProductService.getAllProductForMng({
                page: page,
                pageSize: 8,
                sort: 'newest',
                keyword: searchTermDebouce,
            }).then((response) => response.data),
        retry: 1,
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parseDate = (dateString) => {
        const [day, month, year] = dateString.split('/');
        return new Date(`${year}-${month}-${day}`);
    };


    const handleDateChange = (event, type) => {
        const date = event.target.value;
        let formattedDate = formatDate(date);
        if (date.length === 0) {
            formattedDate = '';
        }
        if (type === 0) {
            setStartDateVal(date);
            formik.setFieldValue('start', formattedDate);
        } else {
            setStartDateVal(date);
            formik.setFieldValue('end', formattedDate);
        }
    };
    const validationSchema = Yup.object({
        name: Yup.string().required('Vui lòng nhập tên đợt giảm giá'),
        value: Yup.number()
            .required('Vui lòng nhập giá trị giảm giá')
            .min(5, 'Giá trị tối thiếu là 5%')
            .max(30, 'Giá trị tối đa là 30%'),
        start: Yup.string()
            .required('Vui lòng nhập ngày bắt đầu.')
            .test('is-valid-date', 'Ngày bắt đầu không hợp lệ', (value) => {
                return value && !isNaN(parseDate(value).getTime());
            })
            .test('is-min-date', 'Ngày bắt đầu phải từ ngày hiện tại trở đi.', (value) => {
                const startDate = parseDate(value);
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                return discountId ? true : startDate >= currentDate;
            }),
        end: Yup.string()
            .required('Vui lòng nhập ngày kết thúc.')
            .test('is-valid-date', 'Ngày kết thúc không hợp lệ', (value) => {
                return value && !isNaN(parseDate(value).getTime());
            })
            .test('is-after-start-date', 'Ngày kết thúc phải sau ngày bắt đầu', (value, context) => {
                const startDate = parseDate(context.parent.start);
                const endDate = parseDate(value);
                return endDate > startDate;
            }),
        productIds: Yup.array()
            .min(1, 'Bạn phải chọn ít nhất một sản phẩm')
            .required('Bạn phải chọn ít nhất một sản phẩm'),
    });

    useQuery({
        queryKey: ['discountById'],
        queryFn: () =>
            DiscountService.getDiscountByID(discountId).then((res) => {
                const resData = res.data;
                const formikMappingVal = {
                    name: resData.name,
                    value: resData.discountRate,
                    start: formatDate(resData.startDate),
                    end: formatDate(resData.endDate),
                    productIds: resData.productIds,
                };
                setStartDateVal(resData.startDate.split('T')[0]);
                setEndDateVal(resData.endDate.split('T')[0]);

                formik.setValues(formikMappingVal);
                return null;
            }),
        retry: 1,
        enabled: !!discountId,
    });


    const createDiscountMutation = useMutation({
        mutationFn: ({ data }) => DiscountService.createDiscount(data),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: () => {
            toast.success('Thành công');
            navigate('/admin/discount');
        },
    });

    const updateiscountMutation = useMutation({
        mutationFn: ({ id, data }) => DiscountService.updateDiscount(id, data),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: () => {
            toast.success('Thành công');
            navigate('/admin/discount');
        },
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            value: '',
            start: '',
            end: '',
            productIds: [],
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            let isAll = false;
            if (values.productIds[0] === -1) {
                values.productIds.shift();
                isAll = true;
            }
            const data = {
                name: values.name,
                value: values.value,
                startDate: convertToISOString(values.start),
                endDate: convertToISOString(values.end),
                productIds: values.productIds,
                isAll: isAll,
            };
            if (discountId) {
                updateiscountMutation.mutate({ id: discountId, data });
            } else {
                createDiscountMutation.mutate({ data });
            }
        },
        validateOnBlur: false,
        validateOnChange: false,
    });

    return (
        <Box component="form" noValidate className={cx('form')}>
            <div className={cx('wrapper')}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper elevation={3} className={cx('paper')} sx={{ height: '100%' }}>
                            <Typography variant="h5" component="h2" className={cx('section-title')}>
                                Thêm đợt giảm giá
                            </Typography>

                            <div className="d-flex gap-3 mt-3">
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Tên"
                                    name="name"
                                    required
                                    margin="normal"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                    className={cx('form-field')}
                                />
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Giá trị giảm giá (%)"
                                    name="value"
                                    type="number"
                                    required
                                    margin="normal"
                                    value={formik.values.value}
                                    onChange={formik.handleChange}
                                    error={formik.touched.value && Boolean(formik.errors.value)}
                                    helperText={formik.touched.value && formik.errors.value}
                                    className={cx('form-field')}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                />
                            </div>
                            <div className="d-flex gap-3 mt-3">
                                <div className={cx('input-date')}>
                                    <TextField
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                                PointerEvent: 'none',
                                            },
                                        }}
                                        size="small"
                                        fullWidth
                                        label="Ngày bắt đầu"
                                        name="start"
                                        type="text"
                                        required
                                        autoComplete="off"
                                        margin="normal"
                                        placeholder="dd/MM/yyyy"
                                        variant="outlined"
                                        onClick={() => {
                                            startDateRef.current && startDateRef.current.showPicker();
                                        }}
                                        value={formik.values.start}
                                        error={formik.touched.start && Boolean(formik.errors.start)}
                                        helperText={formik.touched.start && formik.errors.start}
                                        className={cx('form-field')}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <div className={cx('custom-datepicker')}>
                                                        <CalendarToday />
                                                    </div>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <input
                                        type="date"
                                        ref={startDateRef}
                                        onChange={(e) => handleDateChange(e, 0)}
                                        value={startDateVal}
                                    />
                                </div>

                                <div className={cx('input-date')}>
                                    <TextField
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                            },
                                        }}
                                        size="small"
                                        fullWidth
                                        label="Ngày kết thúc"
                                        name="start"
                                        type="text"
                                        required
                                        autoComplete="off"
                                        margin="normal"
                                        placeholder="dd/MM/yyyy"
                                        variant="outlined"
                                        onClick={() => {
                                            endDateRef.current && endDateRef.current.showPicker();
                                        }}
                                        value={formik.values.end}
                                        error={formik.touched.end && Boolean(formik.errors.end)}
                                        helperText={formik.touched.end && formik.errors.end}
                                        className={cx('form-field')}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <div className={cx('custom-datepicker')}>
                                                        <CalendarToday />
                                                    </div>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <input
                                        type="date"
                                        ref={endDateRef}
                                        value={endDateVal}
                                        onChange={(e) => handleDateChange(e, 1)}
                                    />
                                </div>
                            </div>
                            <Box className={cx('button-group')}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/admin/discount')}
                                    className={cx('cancel-button')}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className={cx('submit-button')}
                                    onClick={formik.handleSubmit}
                                >
                                    {discountId ? 'Cập nhật' : 'Thêm'}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
                <Paper elevation={3} className={cx('paper')}>
                    <h4>Danh sách sản phẩm</h4>
                    <TextField
                        fullWidth
                        id="searchDiscount"
                        className={cx('search-input')}
                        size="small"
                        variant="outlined"
                        placeholder="Tìm kiếm sản phẩm..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {formik.errors.productIds && (
                        <FormHelperText sx={{ color: '#d32f2f' }}>{formik.errors.productIds}</FormHelperText>
                    )}
                    <span style={{ fontSize: '1.4rem', marginTop: '1rem', opacity: 0.8 }}>
                        Đã chọn: {formik.values.productIds.length}
                    </span>
                    <TableContainer component={Paper} className={cx('product-table')}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox" sx={{ width: '50px', minWidth: '50px' }}>
                                        <Checkbox
                                            checked={
                                                Array.isArray(formik.values.productIds) &&
                                                formik.values.productIds[0] === -1 &&
                                                formik.values.productIds.length === 1
                                            }
                                            onChange={() => {
                                                const updatedProductIds = Array.isArray(formik.values.productIds)
                                                    ? formik.values.productIds.includes(-1)
                                                        ? []
                                                        : [-1]
                                                    : [-1];

                                                formik.setFieldValue('productIds', updatedProductIds);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell size="small" sx={{ paddingRight: '.5rem', width: '35px' }}>
                                        <b>ID</b>
                                    </TableCell>
                                    <TableCell
                                        size="small"
                                        sx={{
                                            width: '550px',
                                            maxWidth: '550px',
                                            minWidth: '550px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <b>Tên sách</b>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {productRes?.content.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={
                                                    Array.isArray(formik.values.productIds) &&
                                                    formik.values.productIds[0] === -1
                                                        ? !formik.values.productIds.includes(product.id)
                                                        : formik.values.productIds.includes(product.id)
                                                }
                                                onChange={() => {
                                                    const updatedProductIds = Array.isArray(formik.values.productIds)
                                                        ? formik.values.productIds.includes(product.id)
                                                            ? formik.values.productIds.filter((id) => id !== product.id)
                                                            : [...formik.values.productIds, product.id]
                                                        : [product.id];

                                                    formik.setFieldValue('productIds', updatedProductIds);
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell size="small" sx={{ paddingRight: '.5rem', width: '78px' }}>
                                            {product.id}
                                        </TableCell>
                                        <TableCell
                                            size="small"
                                            sx={{
                                                width: '550px',
                                                maxWidth: '550px',
                                                minWidth: '550px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {product.name}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <div className="d-flex justify-content-center mt-4">
                        <Pagination
                            color="primary"
                            onChange={(e, v) => setPage(v)}
                            variant="outlined"
                            page={parseInt(page)}
                            count={productRes?.totalPages < 1 ? 1 : productRes?.totalPages}
                        />
                    </div>
                </Paper>
            </div>
        </Box>
    );
}

export default AddDiscount;
