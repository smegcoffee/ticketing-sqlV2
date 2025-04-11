
import axios from 'axios';

// Array of backend server URLs
const bURL = [
    // 'http://122.52.134.146:4002',
    // 'http://122.52.134.146:4021',
    // 'http://122.52.134.146:4031',
    // 'http://122.52.134.146:4041',
    // 'http://122.52.134.146:4051',
    // 'http://122.52.134.146:4061',
    // 'http://122.52.134.146:4081',
    // 'http://122.52.134.146:4091',
    // 'http://122.52.134.146:4101',
    // 'http://122.52.134.146:4111',
    // 'http://122.52.134.146:4121',
    // 'http://122.52.134.146:4131',
    // 'http://122.52.134.146:4141',
    // 'http://122.52.134.146:4151',
    // 'http://122.52.134.146:4161',
    // 'http://122.52.134.146:4171',
    // 'http://122.52.134.146:4181',
    // 'http://122.52.134.146:4191',
    // 'http://122.52.134.146:4201',
    // 'http://122.52.134.146:4211',
    'http://localhost:4002'

];

// Function to randomly select a backend URL
function getRandomBaseURL() {2
    const randomIndex = Math.floor(Math.random() * bURL.length);
    return bURL[randomIndex];
}

// Create and export an Axios instance with the selected baseURL
const api = axios.create({
    baseURL: getRandomBaseURL() // Randomly selected URL from the array
});

export default api;
