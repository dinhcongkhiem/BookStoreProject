import React from 'react';
import { useNavigate } from 'react-router-dom';
import style from './EditDiscount.module.scss';
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
    InputAdornment,
} from '@mui/material';

const cx = classNames.bind(style);

function EditDiscount() {
    const navigate = useNavigate();

    return (
        <Box component="form" className={cx('form')}>
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
                            margin="normal"
                            variant="outlined"
                            className={cx('form-field')}
                        />
                        <FormControl fullWidth margin="normal" variant="outlined" className={cx('form-field')}>
                            <InputLabel id="status-label">Trạng thái</InputLabel>
                            <Select labelId="status-label" name="status" label="Trạng thái">
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
                    Cập nhật mã giảm giá
                </Button>
            </Box>
        </Box>
    );
}

export default EditDiscount;
