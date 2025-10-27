import axios from "axios";
import { message } from "antd";

const BASE_URL = "https://biharelection.brihaspathi.com/api";

// 💥 Full-access token (use only for secure admin dashboards)
const ADMIN_TOKEN ="3e50cbcb7b267e89f1fc05d5f79770468f97a8f296258142099d993a0999c8329439e5e435b11b94929188200ca62593f7a3185471e1a25273a3d392091aeac87648e12d5f00b34f1647d69c8f5835b5465833214d44dd718b4fadd45cfc86ab28e21dcedf91b962ea50e8b77bd17ba592d986348f33422c5710a8a572087a0d"

// ✅ Create Axios instance
const bpi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${ADMIN_TOKEN}`, // 🔒 Always use admin token
  },
});

// ✅ Global error handler
bpi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      message.error("Unauthorized access — check your admin token.");
    } else if (error.code === "ECONNABORTED") {
      message.error("Request timed out.");
    } else if (error.message === "Network Error") {
      message.error("Network connection issue.");
    } else if (error.response?.status === 403) {
      message.error("Forbidden — your token lacks access rights.");
    }
    return Promise.reject(error);
  }
);

export default bpi;
