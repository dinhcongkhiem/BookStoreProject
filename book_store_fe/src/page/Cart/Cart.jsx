import React, { useState } from 'react';
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
    Box
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import image1 from '../../assets/image/sp.jpg';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CancelIcon from '@mui/icons-material/Cancel';

const cx = classNames.bind(style);

const productsInCart = [
    {
        id: 1,
        name: 'Sách học lập trình Java',
        price: 150000,
        quantity: 1,
        stock: 10,
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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    const handleClearSearch = () => {
        setSearchTerm('');
    };
    const handleQuantityChange = (id, value) => {
        const item = cartItems.find(item => item.id === id);

        if (item.quantity === 1 && value < 1) {
            setItemToDelete(id);
            setOpenDialog(true);
        } else {
            setCartItems(
                cartItems.map(item =>
                    item.id === id
                        ? { ...item, quantity: Math.min(item.stock, Math.max(1, value)) }
                        : item
                )
            );
        }
    };

    const handleDeleteItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleConfirmDelete = () => {
        handleDeleteItem(itemToDelete);
        setOpenDialog(false);
    };

    const handleSelectAll = (event) => {
        setSelectedItems(event.target.checked ? cartItems.map(item => item.id) : []);
    };

    const handleSelectItem = (id) => {
        setSelectedItems(selectedItems.includes(id) ? selectedItems.filter(itemId => itemId !== id) : [...selectedItems, id]);
    };

    const totalAmount = cartItems.reduce(
        (acc, item) => acc + (selectedItems.includes(item.id) ? item.price * item.quantity : 0),
        0
    );

    return (
        <div className={cx('cart-container')}>
            <h2><b>Giỏ Hàng Của Bạn</b></h2>
            <div className={cx('cart-content')}>
                {/* Danh sách sản phẩm ở bên trái */}
                <div className={cx('cart-items-container')}>
                    <div className={cx('cart-header')}>
                        <Checkbox onChange={handleSelectAll} />
                        <span className={cx('header-item', 'product-name')}>Tất cả</span>
                        <span className={cx('header-item')}>Đơn giá</span>
                        <span className={cx('header-item')}>Số lượng</span>
                        <span className={cx('header-item')}>Thành tiền</span>
                        <span className={cx('header-item')}>Xóa</span>
                    </div>

                    <div className={cx('cart-items')}>
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <div key={item.id} className={cx('cart-item')}>
                                    <Checkbox
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => handleSelectItem(item.id)}
                                    />
                                    <img src={image1} alt="Banner" className={cx('banner-image')} />
                                    <div className={cx('item-info')}>
                                        <h4>{item.name}</h4>
                                    </div>
                                    <div className={cx('item-price')}>
                                        {item.price.toLocaleString()} <span className={cx('currency-symbol')}>₫</span>
                                    </div>
                                    <div className={cx('quantity-control')}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <input
                                            type="number"
                                            className={cx('quantity-input')}
                                            value={item.quantity}
                                            min="1"
                                            max={item.stock}
                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                        <p className={cx('stock-info')}>Còn lại: {item.stock}</p>
                                    </div>
                                    <div className={cx('item-total')}>
                                        {(item.price * item.quantity).toLocaleString()} <span className={cx('currency-symbol')}>₫</span>
                                    </div>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteItem(item.id)}
                                        className={cx('delete-button')}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </div>
                            ))
                        ) : (
                            <p className={cx('empty-cart')}>Giỏ hàng trống</p>
                        )}
                    </div>
                </div>
                {/* Thông tin thanh toán bên phải */}
                <div className={cx('cart-summary')}>
                    <div className={cx('discount-section')}>
                        <h3>BookBazaar Khuyến Mãi</h3>
                        <div className={cx('discount-content')} onClick={() => setDiscountDialogOpen(true)}>
                            <MonetizationOnIcon className={cx('discount-icon')} />
                            <span>Chọn hoặc nhập mã khuyến mãi khác</span>
                        </div>
                    </div>
                    {/* Phần chọn mã giảm giá */}
                    <div className={cx('summary-details')}>
                        <p>
                            Tạm tính: <strong>{totalAmount.toLocaleString()} <span className={cx('currency-symbol')}>₫</span></strong>
                        </p>
                        <p>
                            Giảm giá: <strong>0 <span className={cx('currency-symbol')}>₫</span></strong>
                        </p>
                        <hr />
                        <p>
                            Thành tiền: <strong>{totalAmount.toLocaleString()} <span className={cx('currency-symbol')}>₫</span></strong>
                        </p>

                    </div>
                    <Button variant="outlined" color="primary" className={cx('checkout-button')}>
                        Mua hàng (0)
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
                            }}
                        />
                        <Button className={cx('search-button')}
                            variant="outlined"
                            disabled={searchTerm === ''}
                        >
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
                            <WarningAmberIcon style={{ marginRight: '0.5rem', color: '#ff8c1a' }} />
                            Xoá sản phẩm
                        </div>
                    </div>
                </DialogTitle>
                <DialogContent className={cx('dialog-content')}>
                    <div className="dialog-content__message">
                        Bạn có muốn xóa sản phẩm đang chọn?
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="outlined"
                        className={cx('cancel-button')}
                    >
                        Xác Nhận
                    </Button>
                    <Button
                        onClick={handleCloseDialog}
                        variant="outlined"
                        className={cx('delete-confirm-button')}
                    >
                        Hủy
                    </Button>

                </DialogActions>
            </Dialog>


        </div>
    );
}

export default Cart;
