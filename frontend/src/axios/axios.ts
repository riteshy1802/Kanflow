import { refreshAccessToken } from "@/actions/common";
import { cookie } from "@/helper/cookie";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

export const logoutUser = () => {
  cookie.delete("access_token");
  cookie.delete("refresh_token");

  window.location.href = "/login";
};

let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: any[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


axiosInstance.interceptors.request.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config: any) => {
    const token = cookie.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: any) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              resolve(axiosInstance(originalRequest));
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        processQueue(err, null);
        if (err.response?.status === 403 || err.response?.status === 401 || err.response?.data?.message === "Refresh token expired") {
          logoutUser();
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const _get = async (
  url: string,
  microserviceURL: string,
  params: object
) => {
  try {
    const config = {
      params,
      withCredentials: true,
      ...(microserviceURL && {
        baseURL: `${process.env.NEXT_PUBLIC_API_URL}${microserviceURL}`,
      }),
    };
    const response = await axiosInstance.get(url, config);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const _post = async (
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  microserviceURL?: string,
) => {
  try {
    const isFormData = payload instanceof FormData;
    const response = await axiosInstance.post(url, payload, {
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}${microserviceURL ?? ""}`,
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return Promise.reject(error.response?.data ?? error);
  }
};

export const _patch = async (
  url: string,
  microserviceURL: string,
  payload: object
) => {
  try {
    const config = {
      withCredentials: true,
      ...(microserviceURL && {
        baseURL: `${process.env.NEXT_PUBLIC_API_URL}${microserviceURL}`,
      }),
    };
    const response = await axiosInstance.patch(url, payload, config);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const _delete = async (url: string, microserviceURL: string) => {
  try {
    const config = {
      withCredentials: true,
      ...(microserviceURL && {
        baseURL: `${process.env.NEXT_PUBLIC_API_URL}${microserviceURL}`,
      }),
    };
    const response = await axiosInstance.delete(url, config);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
