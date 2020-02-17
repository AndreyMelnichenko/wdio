import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { URL } from 'url';

abstract class BaseApi {
  private config: AxiosRequestConfig = {
    url: new URL(browser.options.baseUrl).origin,
    withCredentials: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    },
    timeout: 60000
  };

  /**
   * perform request
   */
  public async request(
    endpointPath: string,
    method: string,
    params?: object,
    validate: number = 200
  ): Promise<AxiosResponse> {
    const reqObj = this.config;
    reqObj.url += endpointPath;
    reqObj.method = method;
    reqObj.data = params;
    reqObj.validateStatus = status => status === validate;
    const api = axios.create(reqObj);
    api.interceptors.request.use(request => {
      // tslint:disable-next-line:no-console
      // console.log("API request:");
      // // tslint:disable-next-line:no-console
      // console.log(request);
      return request;
    });
    api.interceptors.response.use(response => {
      // tslint:disable-next-line:no-console
      // console.log(
      //   `API response.status: ${response.status}
      //   }`
      // );
      return response;
    });

    let result: AxiosResponse;
    try {
      result = await api.request(reqObj);
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.warn(`API response.status: ${error}`, this.config);
      result = error;
    }
    return result;
  }
}

export { BaseApi };
