import React, { useState, useEffect } from 'react';
import style from './Cart.module.scss';
import classNames from 'classnames/bind';
import {
    Button,
    Checkbox,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    InputAdornment,
    Box,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import image1 from '../../assets/image/sp.jpg';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CancelIcon from '@mui/icons-material/Cancel';
import { Table } from 'react-bootstrap';

const cx = classNames.bind(style);

const productsInCart = [
    {
        id: 1,
        name: 'Sách học lập trình Java',
        price: 150000,
        quantity: 1,
        stock: 100,
        image: 'link-to-image-1.jpg',
    },
    {
        id: 2,
        name: 'Sách học lập trình Java',
        price: 150000,
        quantity: 1,
        stock: 100,
        image: 'link-to-image-1.jpg',
    },
];

function Cart() {
    const [cartItems, setCartItems] = useState(productsInCart);
    const [selectedItems, setSelectedItems] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCount, setSelectedCount] = useState(0);

    useEffect(() => {
        setSelectedCount(selectedItems.length);
    }, [selectedItems]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const handleQuantityChange = (id, value) => {
        setCartItems(
            cartItems.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.min(item.stock, parseInt(value) < 1 ? 1 : parseInt(value)) }
                    : item,
            ),
        );
    };

    const handleDeleteIconClick = (id) => {
        setItemToDelete(id);
        setOpenDialog(true);
    };

    const handleDeleteItem = (id) => {
        setCartItems(cartItems.filter((item) => item.id !== id));
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleConfirmDelete = () => {
        handleDeleteItem(itemToDelete);
        setOpenDialog(false);
    };

    const handleSelectAll = (event) => {
        setSelectedItems(event.target.checked ? cartItems.map((item) => item.id) : []);
    };

    const handleSelectItem = (id) => {
        setSelectedItems(
            selectedItems.includes(id) ? selectedItems.filter((itemId) => itemId !== id) : [...selectedItems, id],
        );
    };

    const totalAmount = cartItems.reduce(
        (acc, item) => acc + (selectedItems.includes(item.id) ? item.price * item.quantity : 0),
        0,
    );

    return (
        <div className={cx('cart-container')}>
            <h2>
                <b>Giỏ Hàng Của Bạn</b>
            </h2>
            <div className={cx('cart-content')}>
                <TableContainer
                    sx={{
                        width: '100%',
                        overflowX: 'auto',
                        position: 'relative',
                        display: 'block',
                        maxWidth: '100%',
                        '& td, & th': { whiteSpace: 'nowrap' },
                    }}
                >
                    <Table aria-labelledby="tableTitle">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox onChange={handleSelectAll} />
                                </TableCell>
                                <TableCell>Sản phẩm</TableCell>
                                <TableCell align="center">Đơn giá</TableCell>
                                <TableCell align="center">Số lượng</TableCell>
                                <TableCell align="center">Thành tiền</TableCell>
                                <TableCell align="center">Xóa</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cartItems.length > 0 ? (
                                cartItems.map((item) => (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        key={item.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleSelectItem(item.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <img
                                                src={image1}
                                                alt="Banner"
                                                style={{ width: '50px', marginRight: '10px' }}
                                            />
                                            {item.name}
                                        </TableCell>
                                        <TableCell align="center">
                                            {item.price.toLocaleString()} <span>₫</span>
                                        </TableCell>

                                        <TableCell align="center">
                                            <div className={cx('quantity-container')}>
                                                <button
                                                    className={cx('quantity-btn')}
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <RemoveIcon />
                                                </button>

                                                <input
                                                    type="number"
                                                    className={cx('quantity-input')}
                                                    value={item.quantity}
                                                    min="1"
                                                    max={item.stock}
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                                    }}
                                                    onChange={(e) => {
                                                        handleQuantityChange(item.id, e.target.value);
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.value <= 0 && handleQuantityChange(item.id, 1);
                                                    }}
                                                />
                                                <button
                                                    className={cx('quantity-btn')}
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock}
                                                >
                                                    <AddIcon />
                                                </button>
                                            </div>
                                            <div className={cx('stock-remaining')}>
                                                Số lượng còn lại:
                                                {isNaN(item.stock - item.quantity) ? 0 : item.stock - item.quantity}
                                            </div>
                                        </TableCell>

                                        <TableCell align="center" style={{ width: '15rem' }}>
                                            {isNaN(item.price * item.quantity)
                                                ? 0
                                                : (item.price * item.quantity).toLocaleString('vi-VN')}{' '}
                                            <span>₫</span>
                                        </TableCell>

                                        <TableCell align="center">
                                            <IconButton
                                                className={cx('delete-icon-btn')}
                                                color="error"
                                                onClick={() => handleDeleteIconClick(item.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Giỏ hàng trống
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <div className={cx('cart-summary')}>
                    <div className={cx('discount-section')}>
                        <h3>BookBazaar Khuyến Mãi</h3>
                        <div className={cx('discount-content')} onClick={() => setDiscountDialogOpen(true)}>
                            <MonetizationOnIcon className={cx('discount-icon')} />
                            <span>Chọn hoặc nhập mã khuyến mãi khác</span>
                        </div>
                    </div>
                    <div className={cx('summary-details')}>
                        <p>
                            Tạm tính:{' '}
                            <strong>
                                {totalAmount.toLocaleString()} <span className={cx('currency-symbol')}>₫</span>
                            </strong>
                        </p>
                        <p>
                            Giảm giá:{' '}
                            <strong>
                                0 <span className={cx('currency-symbol')}>₫</span>
                            </strong>
                        </p>
                        <hr />
                        <p>
                            Thành tiền:{' '}
                            <strong>
                                {totalAmount.toLocaleString()} <span className={cx('currency-symbol')}>₫</span>
                            </strong>
                        </p>
                    </div>
                    <Button variant="outlined" color="primary" className={cx('checkout-button')}>
                        Mua hàng ({selectedCount})
                    </Button>
                </div>
            </div>

            {/* Dialog chọn mã giảm giá */}
            <Dialog open={discountDialogOpen} onClose={() => setDiscountDialogOpen(false)}>
                <DialogTitle>Chọn mã giảm giá</DialogTitle>
                <DialogContent>
                    <div className={cx('search-container')}>
                        <TextField
                            placeholder="Tìm kiếm mã giảm giá..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocalOfferIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {searchTerm ? (
                                            <IconButton onClick={handleClearSearch} className={cx('close-icon')}>
                                                <CancelIcon />
                                            </IconButton>
                                        ) : (
                                            <Box sx={{ width: '1.5rem' }} />
                                        )}
                                    </InputAdornment>
                                ),
                                classes: {
                                    input: cx('custom-textfield'),
                                },
                                style: { width: '25rem' },
                            }}
                        />
                        <Button className={cx('search-button')} variant="outlined" disabled={searchTerm === ''}>
                            Xác nhận
                        </Button>
                    </div>
                    <p>Chưa có mã giảm giá nào được áp dụng.</p>
                </DialogContent>

                <DialogActions>
                    <Button variant="outlined" color="primary" onClick={() => setDiscountDialogOpen(false)}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xóa sản phẩm */}
            <Dialog open={openDialog} onClose={handleCloseDialog} className={cx('delete-dialog')}>
                <DialogTitle className={cx('dialog-title')}>
                    <div className="dialog-content__text">
                        <div className="dialog-content__title">
                            <WarningAmberIcon style={{ marginRight: '0.5rem', fontSize: '2rem', color: 'orange' }} />
                            Xác nhận xóa sản phẩm
                        </div>
                    </div>
                </DialogTitle>
                <DialogContent className={cx('dialog-content')}>
                    <p>Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDelete} variant="outlined" className={cx('cancel-button')}>
                        Xác Nhận
                    </Button>
                    <Button onClick={handleCloseDialog} variant="outlined" className={cx('delete-confirm-button')}>
                        Hủy
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Cart;
