import { IDBEntity } from './IDBEntity';

interface ICustomer extends IDBEntity {
  customerId?: number;
  name: string;
  cCode?: string;
  isOnb?: number;
}

export { ICustomer };
