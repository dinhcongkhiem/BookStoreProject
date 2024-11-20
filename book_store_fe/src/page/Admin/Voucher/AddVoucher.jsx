import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import style from './AddVoucher.module.scss';
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
    IconButton,
    Tooltip,
} from '@mui/material';
import { CalendarToday, Percent, Search, South } from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import useDebounce from '../../../hooks/useDebounce';
import DiscountService from '../../../service/DiscountService';
import { toast } from 'react-toastify';
import { formatDate } from '../../../utills/ConvertData';
import { faCircleInfo, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserService from '../../../service/UserService';
import VoucherService from '../../../service/VoucherService';

const cx = classNames.bind(style);

function AddVoucher() {
    const { voucherId } = useParams();

    const navigate = useNavigate();
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);
    const [startDateVal, setStartDateVal] = useState();
    const [endDateVal, setEndDateVal] = useState();

    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const searchTermDebouce = useDebounce(searchTerm.trim(), 0);
    const { data: userRes, error } = useQuery({
        queryKey: ['userToVoucher', searchTermDebouce, page],
        queryFn: () =>
            UserService.getAllUser({
                page: page,
                size: 8,
                keyword: searchTermDebouce.length > 0 ? searchTermDebouce : null,
            }).then((response) => response.data),
        retry: 1,
    });

    useEffect(() => {
        console.log(error);
    }, [error]);
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
        code: Yup.string().required('Vui lòng nhập mã giảm giá'),
        name: Yup.string().required('Vui lòng nhập tên đợt giảm giá'),
        value: Yup.lazy((value, context) => {
            if (context.parent.type === 'PERCENT') {
                return Yup.number()
                    .required('Vui lòng nhập giá trị giảm giá')
                    .min(5, 'Giá trị tối thiểu là 5%')
                    .max(30, 'Giá trị tối đa là 30%');
            }
            return Yup.number().required('Vui lòng nhập giá trị giảm giá').min(1, 'Giá trị tối thiểu là 1');
        }),
        type: Yup.string().required('Vui lòng chọn loại giảm giá'),
        quantity: Yup.number().required('Vui lòng nhập số lượng').min(1, 'Số lượng tối thiểu là 1'),
        maxValue: Yup.number().min(1, 'Giá trị tối thiểu là 1'),
        condition: Yup.string().required('Vui lòng nhập điều kiện sử dụng'),
        start: Yup.string()
            .required('Vui lòng nhập ngày bắt đầu.')
            .test('is-valid-date', 'Ngày bắt đầu không hợp lệ', (value) => {
                return value && !isNaN(parseDate(value).getTime());
            })
            .test('is-min-date', 'Ngày bắt đầu phải từ ngày hiện tại trở đi.', (value) => {
                const startDate = parseDate(value);
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                return voucherId ? true : startDate >= currentDate;
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
        userIds: Yup.array()
            .min(1, 'Bạn phải chọn ít nhất một người dùng')
            .required('Bạn phải chọn ít nhất một người dùng'),
    });

    const convertToISOString = (dateString) => {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}T00:00:00`;
    };
    const createVoucherMutation = useMutation({
        mutationFn: ({ data }) => VoucherService.create(data),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: () => {
            toast.success('Thành công');
            navigate('/admin/voucher');
        },
    });

    const updateiscountMutation = useMutation({
        mutationFn: ({ id, data }) => VoucherService.update({ id, data }),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: () => {
            toast.success('Thành công');
            navigate('/admin/voucher');
        },
    });

    const formik = useFormik({
        initialValues: {
            code: '',
            name: '',
            value: '',
            type: 'PERCENT',
            quantity: '',
            maxValue: '',
            start: '',
            end: '',
            userIds: [],
            condition: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            let isAll = false;
            if (values.userIds[0] === -1) {
                values.userIds.shift();
                isAll = true;
            }
            const data = {
                code: values.code,
                name: values.name,
                value: values.value,
                type: values.type,
                quantity: values.quantity,
                maxValue: values.maxValue,
                startDate: convertToISOString(values.start),
                endDate: convertToISOString(values.end),
                userIds: values.userIds,
                condition: values.condition,
                isAll: isAll,
            };

            if (voucherId) {
                updateiscountMutation.mutate({ id: voucherId, data });
            } else {
                createVoucherMutation.mutate({ data });
            }
        },
        validateOnBlur: false,
        validateOnChange: false,
    });
    useQuery({
        queryKey: ['discountById'],
        queryFn: () =>
            VoucherService.getById(voucherId).then((res) => {
                const resData = res.data;
                const formikMappingVal = {
                    code: resData.code,
                    name: resData.name,
                    value: resData.value,
                    type: resData.type,
                    quantity: resData.quantity,
                    maxValue: resData.maxValue,
                    start: formatDate(resData.startDate),
                    end: formatDate(resData.endDate),
                    userIds: resData.userIds,
                    condition: resData.condition,
                };
                setStartDateVal(resData.startDate.split('T')[0]);
                setEndDateVal(resData.endDate.split('T')[0]);

                formik.setValues(formikMappingVal);
                return null;
            }),
        retry: 1,
        enabled: !!voucherId,
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
                                    label="Mã giảm giá"
                                    name="code"
                                    required
                                    margin="normal"
                                    value={formik.values.code}
                                    onChange={formik.handleChange}
                                    error={formik.touched.code && Boolean(formik.errors.code)}
                                    helperText={formik.touched.code && formik.errors.code}
                                    className={cx('form-field')}
                                />
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
                            </div>
                            <div className="d-flex gap-3 mt-3">
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Giá trị giảm giá"
                                    name="value"
                                    required
                                    margin="normal"
                                    value={formik.values.value}
                                    onChange={formik.handleChange}
                                    error={formik.touched.value && Boolean(formik.errors.value)}
                                    helperText={formik.touched.value && formik.errors.value}
                                    className={cx('form-field')}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => formik.setFieldValue('type', 'PERCENT')}
                                                >
                                                    <Percent
                                                        sx={{
                                                            color:
                                                                formik.values.type === 'PERCENT'
                                                                    ? 'rgba(0, 0, 0, 1)'
                                                                    : 'rgba(0, 0, 0, 0.4)',
                                                        }}
                                                    />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        formik.setFieldValue('type', 'CASH');
                                                        formik.setFieldValue('maxValue', '');
                                                    }}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faMoneyBillWave}
                                                        style={{
                                                            color:
                                                                formik.values.type === 'CASH'
                                                                    ? 'rgba(0, 0, 0, 1)'
                                                                    : 'rgba(0, 0, 0, 0.4)',
                                                        }}
                                                    />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    disabled={formik.values.type === 'CASH'}
                                    size="small"
                                    fullWidth
                                    type="number"
                                    label="Giá trị tối đa"
                                    name="maxValue"
                                    margin="normal"
                                    value={formik.values.maxValue}
                                    onChange={formik.handleChange}
                                    error={formik.touched.maxValue && Boolean(formik.errors.maxValue)}
                                    helperText={formik.touched.maxValue && formik.errors.maxValue}
                                    className={cx('form-field')}
                                />
                            </div>
                            <div className="d-flex gap-3 mt-3">
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Số lượng"
                                    name="quantity"
                                    required
                                    margin="normal"
                                    value={formik.values.quantity}
                                    onChange={formik.handleChange}
                                    error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                                    helperText={formik.touched.quantity && formik.errors.quantity}
                                    className={cx('form-field')}
                                />
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Điều kiện sử dụng"
                                    name="condition"
                                    required
                                    margin="normal"
                                    value={formik.values.condition}
                                    onChange={formik.handleChange}
                                    error={formik.touched.condition && Boolean(formik.errors.condition)}
                                    helperText={formik.touched.condition && formik.errors.condition}
                                    className={cx('form-field')}
                                />
                            </div>
                            <div className="d-flex gap-3 mt-3">
                                <div className={cx('input-date')}>
                                    <TextField
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
                                            readOnly: true,
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
                                            endDateRef.current && endDateRef.current.showPicker();
                                        }}
                                        value={formik.values.end}
                                        error={formik.touched.end && Boolean(formik.errors.end)}
                                        helperText={formik.touched.end && formik.errors.end}
                                        className={cx('form-field')}
                                        InputProps={{
                                            readOnly: true,
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
                                    {voucherId ? 'Cập nhật' : 'Thêm'}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
                <Paper elevation={3} className={cx('paper')}>
                    <h4>Danh sách khách hàng</h4>
                    <TextField
                        fullWidth
                        id="searchDiscount"
                        className={cx('search-input')}
                        size="small"
                        variant="outlined"
                        placeholder="Tìm kiếm khách hàng..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {formik.errors.userIds && (
                        <FormHelperText sx={{ color: '#d32f2f' }}>{formik.errors.userIds}</FormHelperText>
                    )}
                    <span style={{ fontSize: '1.4rem', marginTop: '1rem', opacity: 0.8 }}>
                        Đã chọn: {formik.values.userIds.length}
                    </span>
                    <TableContainer component={Paper} className={cx('product-table')}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox" sx={{ width: '50px', minWidth: '50px' }}>
                                        <Checkbox
                                            checked={
                                                Array.isArray(formik.values.userIds) &&
                                                formik.values.userIds[0] === -1 &&
                                                formik.values.userIds.length === 1
                                            }
                                            onChange={() => {
                                                const updateduserIds = Array.isArray(formik.values.userIds)
                                                    ? formik.values.userIds.includes(-1)
                                                        ? []
                                                        : [-1]
                                                    : [-1];

                                                formik.setFieldValue('userIds', updateduserIds);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell size="small" sx={{ paddingRight: '.5rem' }}>
                                        <b>Họ tên</b>
                                    </TableCell>
                                    <TableCell size="small" sx={{ paddingRight: '.5rem', width: '200px' }}>
                                        <b>Email</b>
                                    </TableCell>
                                    <TableCell size="small" sx={{ paddingRight: '.5rem', width: '100px' }}>
                                        <b>SĐT</b>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {userRes?.content.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={
                                                    Array.isArray(formik.values.userIds) &&
                                                    formik.values.userIds[0] === -1
                                                        ? !formik.values.userIds.includes(user.id)
                                                        : formik.values.userIds.includes(user.id)
                                                }
                                                onChange={() => {
                                                    const updateduserIds = Array.isArray(formik.values.userIds)
                                                        ? formik.values.userIds.includes(user.id)
                                                            ? formik.values.userIds.filter((id) => id !== user.id)
                                                            : [...formik.values.userIds, user.id]
                                                        : [user.id];

                                                    formik.setFieldValue('userIds', updateduserIds);
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell
                                            size="small"
                                            sx={{
                                                width: '250px',
                                                maxWidth: '250px',
                                                paddingRight: '.5rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {user.fullName}
                                        </TableCell>
                                        <TableCell
                                            size="small"
                                            sx={{
                                                paddingRight: '.5rem',
                                                width: '200px',
                                                maxWidth: '200px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {user.email}
                                        </TableCell>
                                        <TableCell size="small" sx={{ paddingRight: '.5rem', width: '100px' }}>
                                            {user.phoneNum}
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
                            count={userRes?.totalPages < 1 ? 1 : userRes?.totalPages}
                        />
                    </div>
                </Paper>
            </div>
        </Box>
    );
}

export default AddVoucher;
