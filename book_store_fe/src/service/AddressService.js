import axios from 'axios';
const ADDRESS_API_URL = process.env.REACT_APP_API_ADDRESS_URL;
class DataAddressClass {
    getDataAddress = async (type, id) => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${ADDRESS_API_URL}${type}/${id}.htm`,
        };

        try {
            const response = await axios.request(config);
            const options = response.data.data.map((item) => ({
                value: item.id,
                label: item.name,
            }));
            return options;
        } catch (error) {
            console.error('Error fetching data: ', error);
            throw error;
        }
    };
}
const AddressService = new DataAddressClass();
export default AddressService;
