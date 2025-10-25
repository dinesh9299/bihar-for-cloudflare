import axios from "axios";
import { message } from "antd";

const BASE_URL = "https://biharelection.brihaspathi.com/api";

// 💥 Full-access token (use only for secure admin dashboards)
const ADMIN_TOKEN =
  "0ac039714b346f2465c0759415521dcb2201a61c8ce0890559a67f4ce1da1abacbc97f0d4d96d57fb4b4d25dd0a6d157dd001554f8d2da86b859e7a7894e84c2a5652c1f66d01f759da344e096286235c0f5e2c540b21819c3f3df843503b6f341c12d6c4a50a9f80ac85d99f20ae895f1ced331e85f2f7bab504aa376887cad";

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
