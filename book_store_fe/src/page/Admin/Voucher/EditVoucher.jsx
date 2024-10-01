import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import style from './EditVoucher.module.scss';
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
    Snackbar,
    Alert,
} from '@mui/material';

const cx = classNames.bind(style);

function EditVoucher() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        id: '',
        code: '',
        discountValue: '',
        startDate: '',
        expirationDate: '',
        status: 'Đang hoạt động',
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        if (location.state && location.state.voucher) {
            const { voucher } = location.state;
            setFormData({
                id: voucher.id,
                code: voucher.code,
                discountValue: voucher.discountValue,
                startDate: voucher.startDate.split('T')[0], // Format date for input
                expirationDate: voucher.expirationDate.split('T')[0], // Format date for input
                status: voucher.status,
            });
        } else {
            // Redirect to voucher list if no voucher data is provided
            navigate('/admin/voucher');
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the updated data to your backend
        console.log('Updating voucher:', formData);
        setSnackbar({
            open: true,
            message: 'Mã giảm giá đã được cập nhật thành công!',
            severity: 'success',
        });
        // Simulate a delay before navigating back
        setTimeout(() => navigate('/admin/voucher'), 2000);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    return (
        <Box component="form" onSubmit={handleSubmit} className={cx('form')}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={3} className={cx('paper')}>
                        <Typography variant="h5" component="h2" className={cx('section-title')}>
                            Chỉnh sửa mã giảm giá
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
                    Cập nhật mã giảm giá
                </Button>
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default EditVoucher;
