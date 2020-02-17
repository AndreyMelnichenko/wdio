import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

class Client {
  private static config: AxiosRequestConfig = {
    baseURL: browser.options.baseUrl,
    withCredentials: true,
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json"
    },
    timeout: 20000
  };

  public static getConfig(): AxiosRequestConfig {
    return this.config;
  }

  public static create(config: AxiosRequestConfig): AxiosInstance {
    const instance: AxiosInstance = axios.create(config);
    return instance;
  }
}

export { Client };
