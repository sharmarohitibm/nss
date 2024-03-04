import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://128.168.150.173:8080/",
  timeout: 5000,
});

export { axiosInstance };
