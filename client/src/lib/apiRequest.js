import axios from 'axios';

const apiRequest = axios.create({
    baseURL: 'https://real-state-a91cdc78739e.herokuapp.com/api',
    withCredentials: true,
});

export default apiRequest;
