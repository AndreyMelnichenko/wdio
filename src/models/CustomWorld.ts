import { AxiosResponse } from 'axios';
import { IUser } from './User';

class CustomWorld<T> {
  private currentPage: T;
  private currentUser: IUser;
  private random: string;
  private apiResp: AxiosResponse;
  private store: Map<string, T> = new Map();

  public keepValue(k: string, v: T): void {
    this.store.set(k, v);
  }

  public setValues(map: Map<string, T>) {
    this.store = map;
  }

  public getValues(): Map<string, T> {
    return this.store;
  }

  public findValue(k: string): T {
    return this.store.get(k);
  }

  public setPage(v: T): void {
    this.currentPage = v;
  }

  public getPage(): T {
    return this.currentPage;
  }

  public setUser(user: IUser): void {
    this.currentUser = user;
  }

  public getUser(): IUser {
    return this.currentUser;
  }

  public setApiResp(resp: AxiosResponse): void {
    this.apiResp = resp;
  }

  public getApiResp(): AxiosResponse {
    return this.apiResp;
  }

  public getRandom(): string {
    return this.random;
  }

  public setRandom(v: string) {
    this.random = v;
  }


}

export { CustomWorld };
