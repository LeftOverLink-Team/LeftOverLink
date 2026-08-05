import axios from "axios";

const apiRoot =
  ((import.meta as any)?.env?.VITE_API_URL as string) ||
  "http://localhost:5001";

const instance = axios.create({
  baseURL: `${apiRoot.replace(/\/$/, "")}/api`,
  withCredentials: true, // Needed for sending/receiving HttpOnly cookies
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (!config.headers) config.headers = {} as any;
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Pass-through response interceptor so callers can check error.response.status
instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Do not intercept 401s for login or register routes
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${apiRoot.replace(/\/$/, "")}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.token;
        localStorage.setItem("token", newToken);
        instance.defaults.headers.common["Authorization"] = "Bearer " + newToken;
        processQueue(null, newToken);
        
        // Retry the original request
        originalRequest.headers["Authorization"] = "Bearer " + newToken;
        return instance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Surface non-401 / non-403 errors for debugging
    console.error(
      'Axios response error:',
      error?.response?.status,
      error?.message,
    );
    return Promise.reject(error);
  }
);

export default instance;
