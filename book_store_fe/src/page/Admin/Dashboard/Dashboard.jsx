import classNames from 'classnames/bind';

import style from './Dashboard.module.scss';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faFile, faFileLines, faSquarePollVertical } from '@fortawesome/free-solid-svg-icons';
import {
    Stack,
    Button,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableSortLabel,
    TableBody,
    Box,
    Avatar,
    Chip,
    IconButton,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import StatisticalService from '../../../service/StatisticService';
import styly1 from '../Admin.module.scss';
import ProductService from '../../../service/ProductService';
const cx1 = classNames.bind(styly1);
const cx = classNames.bind(style);
const areaChartOptions = {
    chart: {
        height: 450,
        type: 'area',
        toolbar: {
            show: false,
        },
    },
    legend: {
        onItemClick: {
            toggleDataSeries: false,
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        curve: 'smooth',
        width: 2,
    },
    yaxis: {
        labels: {
            formatter: function (value) {
                return value.toLocaleString('vi-VN') + ' ₫';
            },
        },
    },
    xaxis: {
        categories: [
            'Tháng 1',
            'Tháng 2',
            'Tháng 3',
            'Tháng 4',
            'Tháng 5',
            'Tháng 6',
            'Tháng 7',
            'Tháng 8',
            'Tháng 9',
            'Tháng 10',
            'Tháng 11',
            'Tháng 12',
        ],
    },
};
function Dashboard() {
    const [options, setOptions] = useState(areaChartOptions);
    const [slot, setSlot] = useState('month');
    const [series, setSeries] = useState([]);

    const {
        data: statistic,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['statistic', slot],
        queryFn: () => StatisticalService.getStatistic(slot).then((res) => res.data),
        retry: 1,
    });

    useEffect(() => {
        if (statistic) {
            setSeries([
                {
                    name: 'Doanh thu',
                    data: statistic.data.map((m) => m.revenue),
                },
                {
                    name: 'Lợi nhuận',
                    data: statistic.data.map((m) => m.profit),
                },
            ]);
        }
    }, [statistic]);

    useEffect(() => {
        const updatedCategories =
            slot === 'month'
                ? [
                      'Tháng 1',
                      'Tháng 2',
                      'Tháng 3',
                      'Tháng 4',
                      'Tháng 5',
                      'Tháng 6',
                      'Tháng 7',
                      'Tháng 8',
                      'Tháng 9',
                      'Tháng 10',
                      'Tháng 11',
                      'Tháng 12',
                  ]
                : ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

        setOptions((prevOptions) => ({
            ...prevOptions,
            xaxis: {
                ...prevOptions.xaxis,
                categories: updatedCategories,
            },
        }));
    }, [slot]);


    const {
        data: productRes,
    } = useQuery({
        queryKey: ['productsHotSell'],
        queryFn: () =>
            ProductService.getAllProductForMng({ page: 1,pageSize: 10, sort: "top_seller"}).then(
                (response) => response.data,
            ),
        retry: 1,
    });

    return (
        <div className={cx('wrapper')}>
            <h3>Dashboard</h3>
            <div className={cx('analyst-wrapper')}>
                <div>
                    <FontAwesomeIcon icon={faSquarePollVertical} style={{ opacity: 0.8 }} />
                    <div className={cx('info')}>
                        <p>Số lượng đơn hàng trong ngày</p>
                        <p className={cx('quantity')}>{statistic?.statistics.ordersPerDay}</p>
                    </div>
                </div>
                <div>
                    <FontAwesomeIcon icon={faChartSimple} style={{ opacity: 0.85 }} />
                    <div className={cx('info')}>
                        <p>Tổng số lượng đơn hàng</p>
                        <p className={cx('quantity')}>{statistic?.statistics.totalOrders}</p>
                    </div>
                </div>
                <div>
                    <FontAwesomeIcon icon={faFile} style={{ opacity: 0.9 }} />
                    <div className={cx('info')}>
                        <p>Doanh thu trong ngày</p>
                        <p className={cx('quantity')}>
                            {statistic?.statistics.todayRevenue.toLocaleString('vi-VN')} <span>₫</span>
                        </p>
                    </div>
                </div>
                <div>
                    <FontAwesomeIcon icon={faFileLines} />
                    <div className={cx('info')}>
                        <p>Tổng doanh thu</p>
                        <p className={cx('quantity')}>
                            {statistic?.statistics.totalRevenue.toLocaleString('vi-VN')} <span>₫</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className={cx('income-chart')}>
                <div className="d-flex justify-content-between mb-3">
                    <h4>Doanh thu</h4>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ marginRight: '2rem' }}>
                        <Button
                            size="small"
                            onClick={() => setSlot('month')}
                            color={slot === 'month' ? 'primary' : 'secondary'}
                            variant={slot === 'month' ? 'outlined' : 'text'}
                        >
                            Tháng
                        </Button>
                        <Button
                            size="small"
                            onClick={() => setSlot('week')}
                            color={slot === 'week' ? 'primary' : 'secondary'}
                            variant={slot === 'week' ? 'outlined' : 'text'}
                        >
                            Tuần
                        </Button>
                    </Stack>
                </div>
                <div className={cx('chart')}>
                    <ReactApexChart options={options} series={series} type="area" height={500} />
                </div>
            </div>

            <h4 className='mt-5' style={{marginLeft: '2rem'}}>Sách nổi bật</h4>
            <TableContainer component={Paper} className={cx('product-table', 'mt-3')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell size="small" sx={{ paddingRight: '.5rem', width: '78px' }}>
                                <b>ID</b>
                            </TableCell>
                            <TableCell
                                size="small"
                                sx={{
                                    width: '589px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <b>Tên sách</b>
                            </TableCell>
                            <TableCell size="small" sx={{ padding: '.5rem' }}>
                                <b>Giá bán</b>
                            </TableCell>
                            <TableCell size="small" sx={{ padding: '.5rem' }}>
                                <b>Trạng thái</b>
                            </TableCell>
                            <TableCell size="small" sx={{ padding: '.5rem' }}>
                                <b>Ngày tạo</b>
                            </TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productRes?.content.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell size="small" sx={{ paddingRight: '.5rem', width: '78px' }}>
                                    {product.id}
                                </TableCell>
                                <TableCell
                                    size="small"
                                    sx={{
                                        width: '589px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'wrap',
                                    }}
                                >
                                    <Box display="flex" alignItems="center" sx={{ fontWeight: '700' }}>
                                        <Avatar
                                            alt={product.name}
                                            src={product.thumbnail_url}
                                            sx={{ width: 50, height: 80, mr: 2, borderRadius: 0 }}
                                        />
                                        {product.name}
                                    </Box>
                                </TableCell>
                                <TableCell size="small" sx={{ padding: '.5rem' }}>
                                    {product?.price.toLocaleString('vi-VN')} <strong>₫</strong>
                                </TableCell>
                                <TableCell size="small" sx={{ padding: '.5rem' }}>
                                    <Chip
                                        label={product?.status === 'AVAILABLE' ? 'Còn hàng' : 'Hết hàng'}
                                        color={product?.status === 'AVAILABLE' ? 'success' : 'error'}
                                        size="small"
                                        className={cx1('status', {
                                            'in-stock': product.status === 'AVAILABLE',
                                            'out-of-stock': product.status !== 'AVAILABLE',
                                        })}
                                    />
                                </TableCell>
                                <TableCell size="small" sx={{ padding: '.5rem' }}>
                                    {new Date(product?.createDate).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default Dashboard;
