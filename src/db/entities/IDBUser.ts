import { IDBEntity } from './IDBEntity';

interface IDBUser extends IDBEntity {
  user_id?: number;
  customer_id?: number;
  email: string;
  password?: string;
  full_name?: string;
  firstname?: string;
  lastname?: string;
  user_type?: string;
  verified?: 'Yes' | 'No';
  status?: 'Enabled' | 'Disabled';
  date_added?: string;
  last_login?: string;
  gdpr_selected?: 0 | 1;
  gdpr_selected_date?: string;
}

export { IDBUser };
