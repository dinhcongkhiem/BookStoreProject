import classNames from 'classnames/bind';

import style from './Dashboard.module.scss';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faFile, faFileLines, faSquarePollVertical } from '@fortawesome/free-solid-svg-icons';
import { Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Stack, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import StatisticalService from '../../../service/StatisticService';
const cx = classNames.bind(style);
const areaChartOptions = {
    chart: {
        height: 450,
        type: 'area',
        toolbar: {
            show: false,
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
            <div className={cx('recent-order', 'mt-5')}>
                <h4>Đơn đặt hàng gần đây</h4>
                <div>
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
                                    <TableCell align="center">ID</TableCell>
                                    <TableCell align="center">Tên khách hàng</TableCell>
                                    <TableCell align="right" padding="none">
                                        Calories
                                    </TableCell>
                                    <TableCell align="right">Fat&nbsp;(g)</TableCell>
                                    <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                                    <TableCell align="right">Protein&nbsp;(g)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow
                                    hover
                                    role="checkbox"
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    tabIndex={-1}
                                >
                                    <TableCell component="th" scope="row">
                                        123123123
                                    </TableCell>
                                    <TableCell>{123123}</TableCell>
                                    <TableCell align="right">123123123</TableCell>
                                    <TableCell>
                                        <p>123123</p>
                                    </TableCell>
                                    <TableCell align="right">123123123</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
