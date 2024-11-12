import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Rating,
    Stack,
    styled,
    TextField,
} from '@mui/material';
import classNames from 'classnames/bind';

import style from './ReviewProductModal.module.scss';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import ReviewService from '../../../service/ReviewService';
import { toast } from 'react-toastify';

const cx = classNames.bind(style);
const ResizableTextField = styled(TextField)({
    '& .MuiInputBase-inputMultiline': {
        resize: 'vertical',
        overflow: 'auto',
        minHeight: '115px',
        maxHeight: '300px',
        width: 'calc(10px * 80)',
    },
});
function ReviewProductModal({ open, handleClose, data }) {
    const validationSchema = Yup.object({
        rate: Yup.number().required('Vui lòng để lại đánh giá của bạn!').min(0.5, 'Vui lòng để lại đánh giá của bạn!'),
        content: Yup.string().max(250, 'Tối đa 250 kí tự'),
    });

    const createReviewMutation = useMutation({
        mutationFn: ({ requestBody, productId }) => {
            console.log(productId);
            return ReviewService.createReview(requestBody, productId);
        },
        onError: (error) => {
            console.log(error);
        },
        onSuccess: () => {
            toast.success('Đánh giá sản phẩm thành công');
            handleClose();
        },
    });

    const formik = useFormik({
        initialValues: {
            content: '',
            rate: 0,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            console.log(values);

            const requestBody = {
                comment: values.content,
                star: values.rate,
            };
            const productId = data?.productId;
            createReviewMutation.mutate({ requestBody, productId });
        },
        validateOnBlur: false,
        validateOnChange: false,
    });

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            maxWidth={'xl'}
        >
            <form action="">
                <DialogTitle id="confirm-dialog-title">
                    <p className="fw-bolder fs-3 text-uppercase m-0">Đánh giá sản phẩm</p>
                </DialogTitle>
                <DialogContent dividers>
                    <div className={cx('product')}>
                        <div className={cx('thumbnail')}>
                            <img src={data?.thumbnailUrl} alt="thumbnail" />
                        </div>
                        <p>{data?.name}</p>
                    </div>

                    <div className={cx('rating')}>
                        <p>Đánh giá sản phẩm: </p>

                        <Stack spacing={1}>
                            <Rating
                                name="half-rating-read"
                                defaultValue={0}
                                value={formik.values.rate}
                                precision={0.5}
                                onChange={(e, v) => formik.setFieldValue('rate', v)}
                            />
                        </Stack>
                        {formik.touched.rate && Boolean(formik.errors.rate) && (
                            <span>{formik.touched.rate && formik.errors.rate}</span>
                        )}
                    </div>
                    <div>
                        <ResizableTextField
                            size="small"
                            label="Nội dung"
                            variant="outlined"
                            multiline
                            rows={1}
                            fullWidth
                            name="content"
                            value={formik.values.content}
                            onChange={formik.handleChange}
                            placeholder="Nhập nội dung tại đây..."
                            error={formik.touched.content && Boolean(formik.errors.content)}
                            helperText={formik.touched.content && formik.errors.content}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Hủy
                    </Button>
                    <Button type="submit" color="primary" variant="contained" onClick={formik.handleSubmit}>
                        Đánh giá
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default ReviewProductModal;
