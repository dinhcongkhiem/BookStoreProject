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
    InputAdornment
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Add as AddIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    Category as CategoryIcon,
    Close as CloseIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classNames from 'classnames/bind';
import { useSearchParams } from 'react-router-dom';
import styles from './Attributes.module.scss';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import authorService from '../../../service/AuthorService';
import publisherService from '../../../service/Publisher';
import CategoryService from '../../../service/CategoryService';
import useDebounce from '../../../hooks/useDebounce';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const cx = classNames.bind(styles);

function Attributes() {
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmSaveDialogOpen, setConfirmSaveDialogOpen] = useState(false);
    const [saveAction, setSaveAction] = useState(null);
    const queryClient = useQueryClient();
    const [authorSearchTerm, setAuthorSearchTerm] = useState('');
    const [publisherSearchTerm, setPublisherSearchTerm] = useState('');
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const authorSearchDebounceVal = useDebounce(authorSearchTerm, 500);
    const publisherSearchDebounceVal = useDebounce(publisherSearchTerm, 500);
    const categorySearchDebounceVal = useDebounce(categorySearchTerm, 500);

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Tên là bắt buộc')
            .min(2, 'Tên phải có ít nhất 2 ký tự')
            .max(50, 'Tên không được vượt quá 50 ký tự')
            .matches(/^[a-zA-Z\s\u00C0-\u1EF9]+$/, 'Tên chỉ được chứa chữ cái và khoảng trắng')
            .test('no-leading-trailing-spaces', 'Tên không được bắt đầu hoặc kết thúc bằng khoảng trắng',
                value => value && value.trim() === value)
            .test('no-consecutive-spaces', 'Tên không được chứa nhiều khoảng trắng liên tiếp',
                value => value && !value.includes('  '))
            .test('not-only-spaces', 'Tên không thể chỉ chứa khoảng trắng',
                value => value && value.trim().length > 0)
    });

    const handleOpenModal = (type, attribute = null) => {
        setModalType(type);
        setSelectedAttribute(attribute);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedAttribute(null);
    };

    const {
        data: authors,
        isLoading: loadingAuthors,
        isError: errorAuthors,
    } = useQuery({
        queryKey: ['authors', authorSearchDebounceVal],
        queryFn: () => authorService.getAll({ keyword: authorSearchDebounceVal }).then((response) => response.data),
    });

    const {
        data: publishers,
        isLoading: loadingPublishers,
        isError: errorPublishers,
    } = useQuery({
        queryKey: ['publishers', publisherSearchDebounceVal],
        queryFn: () => publisherService.getAll({ keyword: publisherSearchDebounceVal }).then((response) => response.data),
    });

    const {
        data: categories,
        isLoading: loadingCategories,
        isError: errorCategories,
    } = useQuery({
        queryKey: ['categories', categorySearchDebounceVal],
        queryFn: () => CategoryService.getAll({ keyword: categorySearchDebounceVal }).then((response) => response.data),
    });

    const handleSave = async (values, { setSubmitting, resetForm }) => {
        setConfirmSaveDialogOpen(false);
        try {
            if (modalType === 'addPublisher') {
                await publisherService.create({ name: values.name });
                queryClient.invalidateQueries(['publishers']);
                toast.success('Nhà phát hành đã được thêm thành công!');
            } else if (modalType === 'addAuthor') {
                await authorService.create({ name: values.name });
                queryClient.invalidateQueries(['authors']);
                toast.success('Tác giả đã được thêm thành công!');
            } else if (modalType === 'addGenre') {
                await CategoryService.create({ name: values.name });
                queryClient.invalidateQueries(['categories']);
                toast.success('Thể loại đã được thêm thành công!');
            }
            handleCloseModal();
            resetForm();
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi thêm mới!');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmUpdate = async () => {
        setConfirmSaveDialogOpen(false);
        try {
            if (modalType === 'editAuthor' && selectedAttribute?.id) {
                await authorService.update(selectedAttribute.id, { name: selectedAttribute.name });
                queryClient.invalidateQueries(['authors']);
                toast.success('Tác giả đã được cập nhật thành công!');
            } else if (modalType === 'editPublisher' && selectedAttribute?.id) {
                await publisherService.update(selectedAttribute.id, { name: selectedAttribute.name });
                queryClient.invalidateQueries(['publishers']);
                toast.success('Nhà phát hành đã được cập nhật thành công!');
            } else if (modalType === 'editGenre' && selectedAttribute?.id) {
                await CategoryService.update(selectedAttribute.id, { name: selectedAttribute.name });
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
            toast.success('Nhà phát hành đã được xóa!');
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
                            <TextField
                                id="searchAuthor"
                                size='small'
                                fullWidth
                                variant="outlined"
                                placeholder="Tìm kiếm tác giả..."
                                value={authorSearchTerm}
                                onChange={(e) => setAuthorSearchTerm(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                className={cx('searchField')}
                            />
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
                                        Nhà phát hành
                                    </Typography>
                                </div>
                                <Tooltip title="Thêm nhà phát hành" arrow>
                                    <IconButton
                                        className={cx('addButton')}
                                        size="small"
                                        onClick={() => handleOpenModal('addPublisher')}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <TextField
                                id="searchPublisher"
                                size='small'
                                fullWidth
                                variant="outlined"
                                placeholder="Tìm kiếm nhà phát hành..."
                                value={publisherSearchTerm}
                                onChange={(e) => setPublisherSearchTerm(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                className={cx('searchField')}
                            />
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
                            <TextField
                                id="searchCategory"
                                size='small'
                                fullWidth
                                variant="outlined"
                                placeholder="Tìm kiếm thể loại..."
                                value={categorySearchTerm}
                                onChange={(e) => setCategorySearchTerm(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                className={cx('searchField')}
                            />
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
                                    ? 'Nhà phát hành'
                                    : 'Thể loại'}
                        </Typography>
                        <IconButton aria-label="close" onClick={handleCloseModal} className={cx('closeButton')}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <Formik
                        initialValues={{ name: '' }}
                        validationSchema={validationSchema}
                        onSubmit={handleSave}
                    >
                        {({ errors, touched, isSubmitting, values }) => (
                            <Form>
                                <DialogContent className={cx('modalBody')}>
                                    <Field
                                        as={TextField}
                                        name="name"
                                        size="small"
                                        autoFocus
                                        margin="dense"
                                        label="Tên"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        error={touched.name && errors.name && values.name !== ''}
                                        helperText={touched.name && errors.name && values.name !== '' ? errors.name : ''}
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
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        className={cx('confirmButton')}
                                        disabled={isSubmitting || !values.name.trim()}
                                    >
                                        {modalType.startsWith('add') ? 'Thêm' : 'Lưu'}
                                    </Button>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
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