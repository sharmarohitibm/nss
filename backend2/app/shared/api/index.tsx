import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://162.133.112.45:8080/",
  timeout: 5000,
});

export { axiosInstance };
