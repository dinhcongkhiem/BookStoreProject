import React, { useState } from 'react';
import {
    Container,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    IconButton,
    Tooltip,
    Box,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Add as AddIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    Category as CategoryIcon,
    Close as CloseIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classNames from 'classnames/bind';
import styles from './Attributes.module.scss';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import authorService from '../../../service/AuthorService';
import publisherService from '../../../service/Publisher';
import CategoryService from '../../../service/CategoryService';

const cx = classNames.bind(styles);

function Attributes() {
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [newAttributeName, setNewAttributeName] = useState('');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmSaveDialogOpen, setConfirmSaveDialogOpen] = useState(false);
    const [saveAction, setSaveAction] = useState(null);
    const queryClient = useQueryClient();

    const handleOpenModal = (type, attribute = null) => {
        setModalType(type);
        setSelectedAttribute(attribute);
        setNewAttributeName(attribute ? attribute.name : '');
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedAttribute(null);
        setNewAttributeName('');
    };

    const {
        data: authors,
        isLoading: loadingAuthors,
        isError: errorAuthors,
    } = useQuery({
        queryKey: ['authors'],
        queryFn: () => authorService.getAll().then((response) => response.data),
    });

    const {
        data: publishers,
        isLoading: loadingPublishers,
        isError: errorPublishers,
    } = useQuery({
        queryKey: ['publishers'],
        queryFn: () => publisherService.getAll().then((response) => response.data),
    });

    const {
        data: categories,
        isLoading: loadingCategories,
        isError: errorCategories,
    } = useQuery({
        queryKey: ['categories'],
        queryFn: () => CategoryService.getAll().then((response) => response.data),
    });

    const handleSave = async () => {
        setConfirmSaveDialogOpen(false);
        try {
            if (modalType === 'addPublisher') {
                const response = await publisherService.create({ name: newAttributeName });
                queryClient.invalidateQueries(['publishers']);
                toast.success('Nhà xuất bản đã được thêm thành công!');
            } else if (modalType === 'addAuthor') {
                const response = await authorService.create({ name: newAttributeName });
                queryClient.invalidateQueries(['authors']);
                toast.success('Tác giả đã được thêm thành công!');
            } else if (modalType === 'addGenre') {
                const response = await CategoryService.create({ name: newAttributeName });
                queryClient.invalidateQueries(['categories']);
                toast.success('Thể loại đã được thêm thành công!');
            }
            handleCloseModal();
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi thêm mới!');
        }
    };

    const handleUpdate = () => {
        setConfirmSaveDialogOpen(true);
    };

    const handleConfirmUpdate = async () => {
        setConfirmSaveDialogOpen(false);
        try {
            if (modalType === 'editAuthor' && selectedAttribute?.id) {
                await authorService.update(selectedAttribute.id, { name: newAttributeName });
                queryClient.invalidateQueries(['authors']);
                toast.success('Tác giả đã được cập nhật thành công!');
            } else if (modalType === 'editPublisher' && selectedAttribute?.id) {
                await publisherService.update(selectedAttribute.id, { name: newAttributeName });
                queryClient.invalidateQueries(['publishers']);
                toast.success('Nhà xuất bản đã được cập nhật thành công!');
            } else if (modalType === 'editGenre' && selectedAttribute?.id) {
                await CategoryService.update(selectedAttribute.id, { name: newAttributeName });
                queryClient.invalidateQueries(['categories']);
                toast.success('Thể loại đã được cập nhật thành công!');
            }
            handleCloseModal();
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi cập nhật!');
        }
    };

    const handleDeleteAuthor = async (id) => {
        try {
            await authorService.delete(id);
            toast.success('Tác giả đã được xóa!');
            queryClient.invalidateQueries(['authors']);
        } catch (error) {
            console.error('Error deleting author:', error);
            toast.error('Đã xảy ra lỗi khi xóa!');
        }
    };

    const handleDeletePublisher = async (id) => {
        try {
            await publisherService.delete(id);
            toast.success('Nhà xuất bản đã được xóa!');
            queryClient.invalidateQueries(['publishers']);
        } catch (error) {
            console.error('Error deleting publisher:', error);
            toast.error('Đã xảy ra lỗi khi xóa!');
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await CategoryService.delete(id);
            toast.success('Thể loại đã được xóa!');
            queryClient.invalidateQueries(['categories']);
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Đã xảy ra lỗi khi xóa!');
        }
    };

    const handleConfirmDialog = (action, item) => {
        if (action === 'delete') {
            setConfirmAction({ action, item });
            setConfirmDialogOpen(true);
        }
    };

    const handleConfirm = () => {
        if (confirmAction.action === 'delete') {
            if (confirmAction.item.type === 'author') {
                handleDeleteAuthor(confirmAction.item.id);
            } else if (confirmAction.item.type === 'publisher') {
                handleDeletePublisher(confirmAction.item.id);
            } else if (confirmAction.item.type === 'category') {
                handleDeleteCategory(confirmAction.item.id);
            }
        }
        setConfirmDialogOpen(false);
    };

    const handleCancel = () => {
        setConfirmDialogOpen(false);
    };

    const handleConfirmSave = (action) => {
        setSaveAction(action);
        setConfirmSaveDialogOpen(true);
    };

    return (
        <div className={cx('pageWrapper')}>
            <Container className={cx('attributesContainer')}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" component="h1" className={cx('title')}>
                        Quản lý thuộc tính
                    </Typography>
                </Box>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Paper className={cx('attributeSection')} elevation={3}>
                            <div className={cx('sectionHeader')}>
                                <div className={cx('titleWrapper')}>
                                    <PersonIcon className={cx('sectionIcon', 'PersonIcon')} />
                                    <Typography variant="h6" className={cx('sectionTitle')}>
                                        Tác giả
                                    </Typography>
                                </div>
                                <Tooltip title="Thêm tác giả" arrow>
                                    <IconButton
                                        className={cx('addButton')}
                                        size="small"
                                        onClick={() => handleOpenModal('addAuthor')}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <TableContainer className={cx('attributeList')}>
                                <Table>
                                    <TableBody>
                                        {loadingAuthors ? (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    <CircularProgress />
                                                </TableCell>
                                            </TableRow>
                                        ) : authors && authors.length > 0 ? (
                                            authors.map((author) => (
                                                <TableRow key={author.id} className={cx('attributeItem')}>
                                                    <TableCell>{author.name}</TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Chỉnh sửa" arrow>
                                                            <IconButton
                                                                size="small"
                                                                className={cx('editButton')}
                                                                onClick={() => handleOpenModal('editAuthor', author)}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Xóa" arrow>
                                                            <IconButton
                                                                size="small"
                                                                className={cx('deleteButton')}
                                                                onClick={() =>
                                                                    handleConfirmDialog('delete', {
                                                                        type: 'author',
                                                                        id: author.id,
                                                                    })
                                                                }
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    Không có dữ liệu
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper className={cx('attributeSection')} elevation={3}>
                            <div className={cx('sectionHeader')}>
                                <div className={cx('titleWrapper')}>
                                    <BusinessIcon className={cx('sectionIcon', 'BusinessIcon')} />
                                    <Typography variant="h6" className={cx('sectionTitle')}>
                                        Nhà xuất bản
                                    </Typography>
                                </div>
                                <Tooltip title="Thêm nhà xuất bản" arrow>
                                    <IconButton
                                        className={cx('addButton')}
                                        size="small"
                                        onClick={() => handleOpenModal('addPublisher')}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <TableContainer className={cx('attributeList')}>
                                <Table>
                                    <TableBody>
                                        {loadingPublishers ? (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    <CircularProgress />
                                                </TableCell>
                                            </TableRow>
                                        ) : publishers && publishers.length > 0 ? (
                                            publishers.map((publisher) => (
                                                <TableRow key={publisher.id} className={cx('attributeItem')}>
                                                    <TableCell>{publisher.name}</TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Chỉnh sửa" arrow>
                                                            <IconButton
                                                                size="small"
                                                                className={cx('editButton')}
                                                                onClick={() =>
                                                                    handleOpenModal('editPublisher', publisher)
                                                                }
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Xóa" arrow>
                                                            <IconButton
                                                                size="small"
                                                                className={cx('deleteButton')}
                                                                onClick={() =>
                                                                    handleConfirmDialog('delete', {
                                                                        type: 'publisher',
                                                                        id: publisher.id,
                                                                    })
                                                                }
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    Không có dữ liệu
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
                <Grid container spacing={4} style={{ marginTop: '2rem' }}>
                    <Grid item xs={12}>
                        <Paper className={cx('attributeSection')} elevation={3}>
                            <div className={cx('sectionHeader')}>
                                <div className={cx('titleWrapper')}>
                                    <CategoryIcon className={cx('sectionIcon', 'CategoryIcon')} />
                                    <Typography variant="h6" className={cx('sectionTitle')}>
                                        Thể loại
                                    </Typography>
                                </div>
                                <Tooltip title="Thêm thể loại" arrow>
                                    <IconButton
                                        className={cx('addButton')}
                                        size="small"
                                        onClick={() => handleOpenModal('addGenre')}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <TableContainer className={cx('attributeList')}>
                                <Table>
                                    <TableBody>
                                        {loadingCategories ? (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    <CircularProgress />
                                                </TableCell>
                                            </TableRow>
                                        ) : categories && categories.length > 0 ? (
                                            categories.map((category) => (
                                                <TableRow key={category.id} className={cx('attributeItem')}>
                                                    <TableCell>{category.name}</TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Chỉnh sửa" arrow>
                                                            <IconButton
                                                                size="small"
                                                                className={cx('editButton')}
                                                                onClick={() => handleOpenModal('editGenre', category)}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Xóa" arrow>
                                                            <IconButton
                                                                size="small"
                                                                className={cx('deleteButton')}
                                                                onClick={() =>
                                                                    handleConfirmDialog('delete', {
                                                                        type: 'category',
                                                                        id: category.id,
                                                                    })
                                                                }
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    Không có dữ liệu
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>

                <Dialog
                    open={openModal}
                    onClose={handleCloseModal}
                    classes={{
                        paper: cx('modalWindow'),
                    }}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle className={cx('modalHeader')}>
                        <Typography variant="h6" component="span">
                            {modalType.startsWith('add') ? 'Thêm' : 'Chỉnh sửa'}{' '}
                            {modalType.includes('Author')
                                ? 'Tác giả'
                                : modalType.includes('Publisher')
                                  ? 'Nhà xuất bản'
                                  : 'Thể loại'}
                        </Typography>
                        <IconButton aria-label="close" onClick={handleCloseModal} className={cx('closeButton')}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent className={cx('modalBody')}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Tên"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newAttributeName}
                            onChange={(e) => setNewAttributeName(e.target.value)}
                            className={cx('inputField')}
                            InputProps={{
                                classes: {
                                    root: cx('inputRoot'),
                                    focused: cx('inputFocused'),
                                },
                            }}
                            InputLabelProps={{
                                classes: {
                                    root: cx('inputLabel'),
                                    focused: cx('inputLabelFocused'),
                                },
                            }}
                        />
                    </DialogContent>
                    <DialogActions className={cx('modalFooter')}>
                        <Button onClick={handleCloseModal} className={cx('cancelButton')} variant="outlined">
                            Hủy
                        </Button>
                        {modalType.startsWith('add') ? (
                            <Button
                                onClick={() => handleConfirmSave('add')}
                                variant="contained"
                                className={cx('confirmButton')}
                            >
                                Thêm
                            </Button>
                        ) : (
                            <Button onClick={handleUpdate} variant="contained" className={cx('confirmButton')}>
                                Lưu
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={confirmDialogOpen}
                    onClose={handleCancel}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Xác nhận xóa</DialogTitle>
                    <DialogContent>
                        <Typography>Bạn có chắc chắn muốn xóa mục này?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancel} color="primary">
                            Hủy
                        </Button>
                        <Button onClick={handleConfirm} color="primary" autoFocus>
                            Xác nhận
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={confirmSaveDialogOpen}
                    onClose={() => setConfirmSaveDialogOpen(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {saveAction === 'add' ? 'Xác nhận thêm mới' : 'Xác nhận cập nhật'}
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            {saveAction === 'add'
                                ? 'Bạn có chắc chắn muốn thêm mục này?'
                                : 'Bạn có chắc chắn muốn cập nhật mục này?'}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmSaveDialogOpen(false)} color="primary">
                            Hủy
                        </Button>
                        <Button
                            onClick={saveAction === 'add' ? handleSave : handleConfirmUpdate}
                            color="primary"
                            autoFocus
                        >
                            Xác nhận
                        </Button>
                    </DialogActions>
                </Dialog>

                <ToastContainer />
            </Container>
        </div>
    );
}

export default Attributes;
