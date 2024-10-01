import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './AddDiscount.module.scss';
import classNames from 'classnames/bind';
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
    InputAdornment,
} from '@mui/material';

const cx = classNames.bind(style);

function AddDiscount() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        code: '',
        discountValue: '',
        startDate: '',
        expirationDate: '',
        condition: '',
        status: 'Đang hoạt động',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting:', formData);
        navigate('/admin/discount');
    };

    // Debounce function
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // ResizeObserver callback
    const resizeCallback = useCallback(
        debounce((entries) => {
            for (let entry of entries) {
                if (entry.contentBoxSize) {
                    // Handle the resize here if needed
                    console.log('Content resized');
                }
            }
        }, 250),
        [],
    );

    useEffect(() => {
        const resizeObserver = new ResizeObserver(resizeCallback);

        const elements = document.querySelectorAll('.MuiPaper-root');
        elements.forEach((el) => resizeObserver.observe(el));

        return () => {
            resizeObserver.disconnect();
        };
    }, [resizeCallback]);

    // Error handler for ResizeObserver
    useEffect(() => {
        const errorHandler = (event) => {
            if (event.message === 'ResizeObserver loop completed with undelivered notifications.') {
                event.stopImmediatePropagation();
            }
        };

        window.addEventListener('error', errorHandler);

        return () => {
            window.removeEventListener('error', errorHandler);
        };
    }, []);

    return (
        <Box component="form" onSubmit={handleSubmit} className={cx('form')}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={3} className={cx('paper')}>
                        <Typography variant="h5" component="h2" className={cx('section-title')}>
                            Thêm mới khuyến mãi
                        </Typography>
                        <TextField
                            fullWidth
                            label="Tên khuyến mãi"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            margin="normal"
                            variant="outlined"
                            className={cx('form-field')}
                        />
                        <TextField
                            fullWidth
                            label="Giá trị giảm giá (%)"
                            name="discountValue"
                            type="number"
                            value={formData.discountValue}
                            onChange={handleChange}
                            required
                            margin="normal"
                            variant="outlined"
                            className={cx('form-field')}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Ngày bắt đầu"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                            margin="normal"
                            variant="outlined"
                            className={cx('form-field')}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Ngày hết hạn"
                            name="expirationDate"
                            type="date"
                            value={formData.expirationDate}
                            onChange={handleChange}
                            required
                            margin="normal"
                            variant="outlined"
                            className={cx('form-field')}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Điều kiện áp dụng"
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            className={cx('form-field')}
                        />
                        <FormControl fullWidth margin="normal" variant="outlined" className={cx('form-field')}>
                            <InputLabel id="status-label">Trạng thái</InputLabel>
                            <Select
                                labelId="status-label"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                label="Trạng thái"
                            >
                                <MenuItem value="Đang hoạt động">Đang hoạt động</MenuItem>
                                <MenuItem value="Không hoạt động">Không hoạt động</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>
                </Grid>
            </Grid>
            <Box className={cx('button-group')}>
                <Button variant="outlined" onClick={() => navigate('/admin/discount')} className={cx('cancel-button')}>
                    Hủy
                </Button>
                <Button type="submit" variant="contained" className={cx('submit-button')}>
                    Thêm khuyến mãi
                </Button>
            </Box>
        </Box>
    );
}

export default AddDiscount;
