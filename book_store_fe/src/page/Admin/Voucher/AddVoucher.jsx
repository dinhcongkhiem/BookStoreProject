import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './AddVoucher.module.scss';
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
    Paper,
} from '@mui/material';

const cx = classNames.bind(style);

function AddVoucher() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        code: '',
        discountValue: '',
        startDate: '',
        expirationDate: '',
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
        navigate('/admin/voucher');
    };

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const resizeCallback = useCallback(
        debounce((entries) => {
            for (let entry of entries) {
                if (entry.contentBoxSize) {
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
                            Thêm mới mã giảm giá
                        </Typography>
                        <TextField
                            fullWidth
                            label="Mã giảm giá"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            margin="normal"
                            variant="outlined"
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
                            InputProps={{
                                endAdornment: '%',
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
                            InputLabelProps={{
                                shrink: true,
                            }}
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
                                <MenuItem value="Đang hoạt động">Đang hoạt động</MenuItem>
                                <MenuItem value="Không hoạt động">Không hoạt động</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>
                </Grid>
            </Grid>
            <Box className={cx('button-group')}>
                <Button variant="outlined" onClick={() => navigate('/admin/voucher')} className={cx('cancel-button')}>
                    Hủy
                </Button>
                <Button type="submit" variant="contained" className={cx('submit-button')}>
                    Thêm mã giảm giá
                </Button>
            </Box>
        </Box>
    );
}

export default AddVoucher;
