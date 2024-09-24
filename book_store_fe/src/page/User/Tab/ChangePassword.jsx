import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { TextField, Button } from '@mui/material';

import style from '../User.module.scss';
const cx = classNames.bind(style);

function ChangePassword({ setIsLoading }) {
    return (
        <div className={cx('section')}>
            <h2>Đổi mật khẩu</h2>
            <div style={{ margin: '0 10rem' }}>
                <TextField
                    label="Mật khẩu hiện tại"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required
                    size="small"
                />
                <TextField
                    label="Mật khẩu mới"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required
                    size="small"
                />
                <TextField
                    label="Nhập lại mật khẩu mới"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required
                    size="small"
                />
                <div className="d-flex">
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={cx('save-button')}
                        fullWidth
                        sx={{ mt: 2, padding: '1rem', width: '40%', mx: 'auto' }}
                    >
                        <span className="fw-semibold">Lưu thay đổi</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
ChangePassword.propTypes = {
    setIsLoading: PropTypes.func,
};
export default ChangePassword;
