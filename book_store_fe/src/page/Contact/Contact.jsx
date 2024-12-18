import React, { useRef } from 'react';
import classNames from 'classnames/bind';
import style from './Contact.module.scss';
import image1 from '../../assets/image/banner.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPhone, faMessage } from '@fortawesome/free-solid-svg-icons';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMutation } from '@tanstack/react-query';
import UserService from '../../service/UserService';
import { styled, TextField } from '@mui/material';
import { toast } from 'react-toastify';
const ResizableTextField = styled(TextField)({
    '& .MuiInputBase-inputMultiline': {
        resize: 'vertical',
        overflow: 'auto',
        minHeight: '115px',
        maxHeight: '300px',
    },
});
const cx = classNames.bind(style);

function Contact() {
    const form = useRef();
    const sendContactMutation = useMutation({
        mutationFn: (data) => {
            return UserService.sendContactMail(data);
        },
        onSuccess: (data) => {
            toast.success('Đã gửi phản hồi thành công');
            formik.resetForm();
        },
        onError: (error) => {
            console.log(error);
        },
    });

    const validationSchema = Yup.object({
        content: Yup.string().trim().required('Vui lòng nhập nội dung').max(255, 'Tối đa 255 ký tự'),
        email: Yup.string()
            .trim()
            .required('Vui lòng nhập email')
            .max(50, 'Tối đa 255 ký tự')
            .email('Email không hợp lệ'),
        name: Yup.string().trim().required('Vui lòng nhập tên').max(50, 'Tối đa 255 ký tự'),
        title: Yup.string().trim().required('Vui lòng nhập tiêu đề').max(50, 'Tối đa 255 ký tự'),
    });

    const formik = useFormik({
        initialValues: {
            content: '',
            email: '',
            name: '',
            title: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const data = values;
            sendContactMutation.mutate(data);
        },
        validateOnBlur: false,
        validateOnChange: false,
    });

    return (
        <div className={cx('page-container')}>
            <div className={cx('container')}>
                <img src={image1} alt="Banner" className={cx('image')} />
                <div className={cx('text-overlay')}>Contact</div>
            </div>
            <div className={cx('map')}>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.68925483665!2d105.74366821036193!3d21.045116180527433!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313455b3f6710da1%3A0x240105831b77a1a2!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1svi!2s!4v1725422444454!5m2!1svi!2s"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="map"
                ></iframe>
            </div>
            <div className={cx('title')}>
                <h1>Liên hệ</h1>
            </div>
            <div className={cx('content')}>
                <form ref={form} onSubmit={formik.handleSubmit} className={cx('input-contact')}>
                    <ResizableTextField
                        name="content"
                        label="Nội dung"
                        variant="outlined"
                        type="text"
                        multiline
                        fullWidth
                        rows={1}
                        value={formik.values.content}
                        onChange={formik.handleChange}
                        margin="normal"
                        size="small"
                        error={formik.touched.content && Boolean(formik.errors.content)}
                        helperText={formik.touched.content && formik.errors.content}
                    />
                    <div className={cx('name-email-row')}>
                        <TextField
                            name="name"
                            label="Họ và Tên"
                            variant="outlined"
                            type="text"
                            multiline
                            fullWidth
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            margin="normal"
                            size="small"
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            sx={{margin: 0}}
                            helperText={formik.touched.name && formik.errors.name}
                        />
                        <TextField
                            name="email"
                            label="Email"
                            variant="outlined"
                            type="text"
                            multiline
                            fullWidth
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            margin="normal"
                            size="small"
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            sx={{margin: 0}}
                        />
                    </div>
                    <TextField
                        name="title"
                        label="Tiêu đề"
                        variant="outlined"
                        type="text"
                        multiline
                        fullWidth
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        margin="normal"
                        size="small"
                        error={formik.touched.title && Boolean(formik.errors.title)}
                        helperText={formik.touched.title && formik.errors.title}
                        sx={{margin: 0, marginTop: '1rem'}}

                    />
                    <button type="submit" className={cx('submit-button')}>
                        Gửi
                    </button>
                </form>

                <div className={cx('contact-info')}>
                    <div className={cx('info-item')}>
                        <FontAwesomeIcon icon={faHouse} className={cx('icon')} />
                        <p>
                            <strong>Địa chỉ:</strong> Cao Đẳng FPT Polytechnic Hà Nội
                        </p>
                    </div>
                    <div className={cx('info-item')}>
                        <FontAwesomeIcon icon={faPhone} className={cx('icon')} />
                        <p>
                            <strong>Điện thoại:</strong> +84 123 456 789
                        </p>
                    </div>
                    <div className={cx('info-item')}>
                        <FontAwesomeIcon icon={faMessage} className={cx('icon')} />
                        <p>
                            <strong>Email:</strong> bookbazzar@gmail.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
