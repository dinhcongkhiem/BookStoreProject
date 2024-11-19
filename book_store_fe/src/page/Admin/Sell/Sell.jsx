import React, { useState, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Grid,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Checkbox,
  Switch,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  LocalOffer as LocalOfferIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Webcam from 'react-webcam';
import { useQuery, queryClient, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames/bind';
import styles from './Sell.module.scss';
import ProductService from '../../../service/ProductService';
import useDebounce from '../../../hooks/useDebounce';

const cx = classNames.bind(styles);

export default function Sell() {
  const [invoices, setInvoices] = useState([]);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const webcamRef = useRef(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchValue = useDebounce(searchTerm, 800)
  const [orderBy, setOrderBy] = useState('');
  const queryClient = useQueryClient();
  const handleSearch = (event) => {
    setPage(1);
    setSearchTerm(event.target.value);
  };

  const {
    data: productSellRes,
    error,
    isLoading: isLoadingProducts,
  } = useQuery({
    queryKey: ['productsMng', debouncedSearchValue, page],
    queryFn: () =>
      ProductService.getAllProductForMng({ page: page, keyword: debouncedSearchValue }).then(
        (response) => response.data,
      ),
    retry: 1,
  });

  const createInvoice = () => {
    if (invoices.length < 5) {
      const newInvoice = {
        id: Date.now(),
        items: [],
        total: 0,
        discount: 0,
      };
      setInvoices((prev) => [...prev, newInvoice]);
      setActiveInvoice(newInvoice.id);
      showSnackbar('Hóa đơn mới đã được tạo');
    } else {
      showSnackbar('Đã đạt giới hạn số lượng hóa đơn');
    }
  };

  const deleteInvoice = (invoiceId) => {
    setInvoices((prevInvoices) =>
      prevInvoices.filter((invoice) => invoice.id !== invoiceId)
    );
    if (activeInvoice === invoiceId) {
      setActiveInvoice(invoices[invoices.length - 2]?.id || null);
    }
    showSnackbar('Hóa đơn đã được xóa');
  };

  const addProductToInvoice = (product) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) => {
        if (invoice.id === activeInvoice) {
          const existingItemIndex = invoice.items.findIndex(item => item.id === product.id);
          if (existingItemIndex !== -1) {
            // Product already exists, increase quantity
            const updatedItems = invoice.items.map((item, index) =>
              index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
            );
            return {
              ...invoice,
              items: updatedItems,
              total: invoice.total + product.price,
            };
          } else {
            // Product doesn't exist, add new item
            return {
              ...invoice,
              items: [...invoice.items, { ...product, quantity: 1 }],
              total: invoice.total + product.price,
            };
          }
        }
        return invoice;
      })
    );
    showSnackbar(`Đã thêm ${product.name} vào hóa đơn`);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) => {
        if (invoice.id === activeInvoice) {
          const updatedItems = invoice.items.map((item) => {
            if (item.id === productId) {
              const validQuantity = Math.max(1, newQuantity);
              return {
                ...item,
                quantity: validQuantity,
              };
            }
            return item;
          });

          return {
            ...invoice,
            items: updatedItems,
            total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          };
        }
        return invoice;
      })
    );
  };

  const removeProductFromInvoice = (productId) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === activeInvoice
          ? {
            ...invoice,
            items: invoice.items.filter((item) => item.id !== productId),
            total: invoice.items.reduce(
              (sum, item) => (item.id !== productId ? sum + item.price * item.quantity : sum),
              0
            ),
          }
          : invoice
      )
    );
    showSnackbar('Đã xóa sản phẩm khỏi hóa đơn');
  };

  const handleAddProduct = () => {
    if (!activeInvoice) {
      showSnackbar('Vui lòng tạo hóa đơn');
      return;
    }
    setIsProductDialogOpen(true);
  };

  const confirmAddProducts = () => {
    selectedProducts.forEach(product => {
      addProductToInvoice(product);
    });
    setIsProductDialogOpen(false);
    setSelectedProducts([]);
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleSelectProduct = (product) => {
    const selectedIndex = selectedProducts.findIndex(p => p.id === product.id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedProducts, product);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedProducts.slice(1));
    } else if (selectedIndex === selectedProducts.length - 1) {
      newSelected = newSelected.concat(selectedProducts.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedProducts.slice(0, selectedIndex),
        selectedProducts.slice(selectedIndex + 1),
      );
    }

    setSelectedProducts(newSelected);
  };

  const activeInvoiceData = invoices.find(
    (invoice) => invoice.id === activeInvoice
  );

  const handleChangeTab = (event, newValue) => {
    setActiveInvoice(newValue);
  };

  return (
    <div className={cx('root')}>
      <AppBar position="static" className={cx('appBar')}>
        <Toolbar>
          <ShoppingCartIcon className={cx('icon')} />
          <Typography variant="h6" component="div" className={cx('title')}>
            Bán hàng tại quầy
          </Typography>
          <Button
            color="inherit"
            variant="outlined"
            onClick={createInvoice}
            startIcon={<AddIcon />}
            className={cx('createButton')}
          >
            Tạo hóa đơn mới
          </Button>
        </Toolbar>
      </AppBar>
      <div className={cx('container')}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper className={cx('paper', 'invoicePaper')}>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                className={cx('sectionTitle')}
              >
                Danh sách hóa đơn
              </Typography>
              <Tabs
                value={activeInvoice}
                onChange={handleChangeTab}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="invoice tabs"
              >
                {invoices.map((invoice, index) => (
                  <Tab
                    key={invoice.id}
                    label={`Hóa đơn ${index + 1}`}
                    value={invoice.id}
                    icon={
                      <IconButton sx={{ color: 'red' }}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteInvoice(invoice.id);
                        }}
                        className={cx('deleteIcon')}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                    iconPosition="end"
                  />
                ))}
              </Tabs>
              {activeInvoiceData && (
                <TableContainer className={cx('productList')}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Sản phẩm</TableCell>
                        <TableCell align="right">Giá</TableCell>
                        <TableCell align="center">Số lượng</TableCell>
                        <TableCell align="right">Tổng</TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeInvoiceData.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <img src={item.thumbnail_url} alt={item.name} className={cx('productImage')} style={{ width: '5rem', marginRight: '1rem' }} />
                              <Typography variant="body2" className={cx('productTitle')}>{item.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{item.price.toLocaleString('vi-VN')}đ</TableCell>
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
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              />
                              <button
                                className={cx('quantity-btn')}
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <AddIcon />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell align="right">
                            {(item.quantity * item.price).toLocaleString('vi-VN')}đ
                          </TableCell>
                          <TableCell align="center">
                            <IconButton sx={{ color: 'red' }} onClick={() => removeProductFromInvoice(item.id)} size="small">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className={cx('rightColumn')}>
              <Paper className={cx('paper', 'actionPaper')}>
                <Typography
                  variant="h6"
                  gutterBottom
                  component="div"
                  className={cx('sectionTitle')}
                >
                  Thêm sản phẩm
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleAddProduct}
                  className={cx('addProductButton')}
                  startIcon={<LocalOfferIcon />}
                >
                  Thêm sản phẩm
                </Button>
                <Box className={cx('qrToggleContainer')}>
                  <Typography variant="body1" className={cx('qrToggleLabel')}>Quét mã QR</Typography>
                  <Switch
                    checked={showScanner}
                    onChange={() => setShowScanner(!showScanner)}
                    color="primary"
                  />
                </Box>
                {showScanner && (
                  <Box className={cx('scannerContainer')}>
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        facingMode: 'environment',
                      }}
                      className={cx('webcam')}
                    />
                  </Box>
                )}
              </Paper>
              <Box className={cx('totalAmount')}>
                <Typography variant="h6" className={cx('totalText')}>
                  Tổng cộng:{' '}
                  {activeInvoiceData
                    ? activeInvoiceData.total.toLocaleString('vi-VN')
                    : '0'}
                  đ
                </Typography>
                <Button
                  variant="contained"
                  className={cx('checkoutButton')}
                  disabled={!activeInvoiceData || activeInvoiceData.items.length === 0 || isLoading}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <AttachMoneyIcon />
                    )
                  }
                >
                  {isLoading ? 'Đang xử lý...' : 'Thanh toán'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
      <Dialog
        open={isProductDialogOpen}
        onClose={() => setIsProductDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chọn sản phẩm</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <TextField
              size='small'
              fullWidth
              variant="outlined"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <SearchIcon color="action" />
                ),
              }}
            />
          </Box>
          <TableContainer className={cx('dialogTable')}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedProducts.length > 0 && selectedProducts.length < (productSellRes?.content?.length || 0)}
                      checked={productSellRes?.content?.length > 0 && selectedProducts.length === productSellRes?.content?.length}
                      onChange={() => {
                        if (selectedProducts.length === productSellRes?.content?.length) {
                          setSelectedProducts([]);
                        } else {
                          setSelectedProducts(productSellRes?.content || []);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell align="right">Giá</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>Số lượng còn</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productSellRes?.content?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedProducts.some(p => p.id === product.id)}
                        onChange={() => handleSelectProduct(product)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <img
                          alt={product.name}
                          src={product.thumbnail_url}
                          style={{ width: '6.5rem', marginRight: '1rem' }}
                        />
                        <Typography variant="body2" className={cx('productTitle')}>{product.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{product?.price.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell align="right">
                      {product?.quantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={2}>
            <Pagination
              color="primary"
              variant="outlined"
              count={productSellRes?.totalPages < 1 ? 1 : productSellRes?.totalPages}
              onChange={(e, v) => setPage(v)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsProductDialogOpen(false)} color="primary">
            Hủy
          </Button>
          <Button onClick={confirmAddProducts} color="primary" disabled={selectedProducts.length === 0}>
            Thêm ({selectedProducts.length})
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}