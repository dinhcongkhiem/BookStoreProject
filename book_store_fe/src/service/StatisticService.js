import axios from 'axios';
import { STATISTICAL_URL } from './config';

class StatisticalServiceClass {
    getStatistic = (type) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: STATISTICAL_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            params: { type },
        };

        return axios.request(config);
    };

}

const StatisticalService = new StatisticalServiceClass();
export default StatisticalService;
