import Cookies from "universal-cookie";
const cookies = new Cookies(null, { path: "/" });

export const cookie = {
  set: (key: string, value: string) => {
    cookies.set(key, value);
  },
  get: (key: string) => {
    return cookies.get(key);
  },
  delete: (key: string) => {
    cookies.remove(key);
  },
};
