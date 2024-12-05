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
    IconButton,
} from '@mui/material';
import { CalendarToday, Percent, Search, South } from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { convertToISOString, formatDate } from '../../../utills/ConvertData';
import { faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import VoucherService from '../../../service/VoucherService';
import ModalLoading from '../../../component/Modal/ModalLoading/ModalLoading';

const cx = classNames.bind(style);

function AddVoucher() {
    const { voucherId } = useParams();

    const navigate = useNavigate();
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);
    const [startDateVal, setStartDateVal] = useState();
    const [endDateVal, setEndDateVal] = useState();


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
        code: Yup.string().trim().required('Vui lòng nhập mã giảm giá').max(255, 'Tên không được vượt quá 255 ký tự'),
        name: Yup.string().trim().required('Vui lòng nhập tên đợt giảm giá').max(255, 'Tên không được vượt quá 255 ký tự'),
        value: Yup.lazy((value, context) => {
            if (context.parent.type === 'PERCENT') {
                return Yup.number()
                    .required('Vui lòng nhập giá trị giảm giá')
                    .min(5, 'Giá trị tối thiểu là 5%')
                    .max(30, 'Giá trị tối đa là 30%');
            }
            return Yup.number().required('Vui lòng nhập giá trị giảm giá').min(1, 'Giá trị tối thiểu là 1').max(1000000, 'Giá trị tối đa là 1 triệu.');
        }),
        type: Yup.string().required('Vui lòng chọn loại giảm giá'),
        quantity: Yup.number().required('Vui lòng nhập số lượng').min(1, 'Số lượng tối thiểu là 1').max(2000000000, 'Giá trị tối đa là 2 tỷ'),
        maxValue: Yup.number().nullable().min(1, 'Giá trị tối thiểu là 1').max(2000000000, 'Giá trị tối đa là 2 tỷ'),
        condition: Yup.lazy((condition, context) => {
            const { type, value } = context.parent;
    
            if (type === 'PERCENT') {
                return Yup.number()
                    .transform((val, originalVal) => (originalVal ? parseFloat(originalVal) : null))
                    .required('Vui lòng nhập điều kiện sử dụng').max(2000000000, 'Giá trị tối đa là 2 tỷ');
            }
    
            if (type === 'CASH') {
                return Yup.number()
                    .transform((val, originalVal) => (originalVal ? parseFloat(originalVal) : null))
                    .required('Vui lòng nhập điều kiện sử dụng')
                    .min(value + 1, `Điều kiện phải lớn hơn giá trị giảm giá`).max(2000000000, 'Giá trị tối đa là 2 tỷ');
            }
    
            return Yup.mixed().notRequired();
        }),
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
    });

    const createVoucherMutation = useMutation({
        mutationFn: ({ data }) => VoucherService.create(data),
        onError: (error) => {
            if(error.response.status === 409){
                toast.error(error.response.data);
            }
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
            if(error.response.status === 409){
                toast.error(error.response.data);
            }
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
            condition: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const data = {
                code: values.code.trim(),
                name: values.name.trim(),
                value: values.value,
                type: values.type,
                quantity: values.quantity,
                maxValue: values.maxValue,
                startDate: convertToISOString(values.start),
                endDate: convertToISOString(values.end),
                condition: values.condition,
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

    const handleChangeInput = (e,key) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/[^0-9]/g, '');
        if (inputValue.trim() === '') {
            formik.setFieldValue(key, '');
            return;
        }
        formik.setFieldValue(key, parseInt(numericValue));
    }
    return (
        <Box component="form" noValidate className={cx('form')}>
            <div className={cx('wrapper')}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper elevation={3} className={cx('paper')} sx={{ height: '100%' }}>
                            <Typography variant="h5" component="h2" className={cx('section-title')}>
                                Thêm phiếu giảm giá
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
                                    onChange={(e) => handleChangeInput(e,'value')}
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
                                    onChange={(e) => handleChangeInput(e,'maxValue')}
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
                                    onChange={(e) => handleChangeInput(e,'quantity')}
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
                                    onChange={(e) => handleChangeInput(e,'condition')}
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
                                    onClick={() => navigate('/admin/voucher')}
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
            </div>
            <ModalLoading isLoading={createVoucherMutation.isLoading || updateiscountMutation.isLoading} />
        </Box>
    );
}

export default AddVoucher;
