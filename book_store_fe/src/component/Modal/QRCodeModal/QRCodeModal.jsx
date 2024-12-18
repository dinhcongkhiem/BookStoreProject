import { Dialog } from '@mui/material';

function QRCodeModal({ open, onClose, amount }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <img
                src={`https://api.vietqr.io/image/970422-0842888559-bXU1iBq.jpg?addInfo=BookBazaar&amount=${amount}`}
                alt="qrcode"
            />
        </Dialog>
    );
}

export default QRCodeModal;
