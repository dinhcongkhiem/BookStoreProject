import React, { memo } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const ConfirmModalComponent = ({ open, onClose, onConfirm, title, message }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
        >
            <DialogTitle id="confirm-dialog-title">{title || 'Xác nhận hành động'}</DialogTitle>
            <DialogContent>
                <DialogContentText id="confirm-dialog-description">
                    {message || 'Bạn có chắc chắn muốn thực hiện hành động này?'}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Hủy
                </Button>
                <Button onClick={onConfirm} color="primary" variant="contained" autoFocus>
                    Xác nhận
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default memo(ConfirmModalComponent);
