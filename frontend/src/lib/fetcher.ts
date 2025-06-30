import { _get, _patch, _post, _delete } from "@/axios/axios";

export const fetcher = {
  get: async (url: string, params?: object, microserviceURL?: string) => {
    return _get(url, microserviceURL || "", params || {});
  },

  post: async (
    url: string,
    payload: FormData | object,
    microserviceURL?: string
  ) => {
    return _post(url, payload, microserviceURL || "");
  },

  patch: async (url: string, payload: FormData | object, microserviceURL?: string) => {
    return _patch(url, microserviceURL || "", payload);
  },

  delete: async (url: string, microserviceURL?: string) => {
    return _delete(url, microserviceURL || "");
  },
};
