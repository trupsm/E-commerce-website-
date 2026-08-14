import axios from "axios";

const axiosInstance = axios.create({ //this axiosInstance is used to send all the HTTP requests to the backend (by importing it in all the components) 
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // This is the base URL for all the API calls. Using this we can access cookies in the frontend which are set by the backend
  withCredentials: true, // Required to send & receive HTTP-only cookies

  headers: {
    "Content-Type": "application/json", // This tells the server that we are sending JSON data in the request body
  },
});

export default axiosInstance;
