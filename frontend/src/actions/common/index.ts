"use client";
import { fetcher } from "@/lib/fetcher";
import Cookies from "universal-cookie";

interface API_PARAMS {
  endpoint: string;
  microserviceURL?: string;
  params?: object;
  payload?: object;
}

export const get = async (
  endpoint: string,
  params?: object,
  microserviceURL?: string
) => {
  const response = await fetcher.get(endpoint, params, microserviceURL);
  return response.data ?? response;
};

export const post = async (
  endpoint: string,
  payload: FormData | object,
  microserviceURL?: string
) => {
  const response = await fetcher.post(endpoint, payload || {}, microserviceURL);
  return response.data;
};

export const patch = async (
  endpoint: string,
  payload: FormData | object,
  microserviceURL?: string
) => {
  const response = await fetcher.patch(endpoint, payload, microserviceURL);
  return response.data;
};

export const put = ({ endpoint, microserviceURL, payload }: API_PARAMS) => {
  console.log("data - ", endpoint, microserviceURL, payload);
};

export const deleteData = ({ endpoint, microserviceURL }: API_PARAMS) => {
  console.log("data - ", endpoint, microserviceURL);
};

export const refreshAccessToken = async () => {
  const cookie = new Cookies();
  console.log("Refreshing token");

  const endpoint = "/user/refresh";
  const payload = {};

  const data = await post(endpoint, payload);

  const { access_token: newAccessToken } = data;
  console.log("New Access token : ", newAccessToken)

  if (newAccessToken) {
    cookie.set("access_token", newAccessToken, { path: "/" });
    return newAccessToken;
  }

  throw new Error("Failed to refresh token");
};