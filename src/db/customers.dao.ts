import { Connection } from 'mysql2/promise';
import { IUser } from '../models/User';
import { ICustomer } from './entities/ICustomer';
import { IDBStatus } from './entities/IDBStatus';
import { MySQLHelper } from './mysqlHelper';

class CustomersDAO {
  private db: MySQLHelper;

  constructor(dbHelper: MySQLHelper) {
    this.db = dbHelper;
  }

  /**
   * Add customer to db if not exist
   *
   * @private
   * @param {string} name
   * @param {string} country
   * @param {number} [isOnb=0] is onboarded
   * @returns {Promise<IDBStatus>}
   * @memberof CustomersDAO
   */
  private async addCustomer(
    name: string,
    country: string,
    isOnb: number = 0
  ): Promise<IDBStatus> {
    const conn: Connection = await this.db.getConnection();
    const selectOne = conn.format(
      `SELECT customer_id 
       FROM customers 
            WHERE name = ?`, [
        name
      ]);
    const selectAll = conn.format(
      `SELECT customer_id 
         FROM customers 
              WHERE name = ? 
              AND is_onboarding_activated = ?
              AND country = ?`, [
        name, isOnb, country
      ]);
    const insert = conn.format('INSERT INTO customers SET ?', {
      name,
      country,
      is_onboarding_activated: isOnb,
      date_added: MySQLHelper.YESTRD
    });
    const update = conn.format(`UPDATE customers SET ? WHERE ?`, [
      { country, is_onboarding_activated: isOnb },
      { name }
    ]);

    const result: IDBStatus = await MySQLHelper.updateIfExistOrInsert(
      conn,
      'customer_id',
      { selectOne, selectAll },
      update,
      insert
    );
    conn.end();
    return result;
  }

  /**
   * Add subscription to customer, if not exist
   *
   * @private
   * @param {number} customerId
   * @param {number} subscriptionId
   * @param {string} [status='Trial']
   * @param {string} [billPeriod='Monthly']
   * @returns {Promise<IDBStatus>}
   * @memberof CustomersDAO
   */
  private async addCustomerSubscription(
    customerId: number,
    subscriptionId: number,
    status: string = 'Trial',
    billPeriod: string = 'Monthly'
  ): Promise<IDBStatus> {
    const conn = await this.db.getConnection();
    const selectOne = conn.format(
      `SELECT id FROM customer_subscriptions WHERE ?`,
      [{ customer_id: customerId }]
    );
    const selectAll = conn
      .format(
        `SELECT id FROM customer_subscriptions
      WHERE ? LIMIT 1`,
        [
          {
            customer_id: customerId,
            subscription_id: subscriptionId,
            status,
            bill_period: billPeriod,
            created_at: 'IS NOT NULL',
            start_date: 'IS NOT NULL'
          }
        ]
      )
      .replace(/,/g, ' AND ');
    const insert = conn.format('INSERT INTO customer_subscriptions SET ?', {
      customer_id: customerId,
      subscription_id: subscriptionId,
      created_at: MySQLHelper.YESTRD,
      start_date: MySQLHelper.NOW,
      status,
      bill_period: billPeriod
    });
    const update = conn.format(`UPDATE customer_subscriptions SET ? WHERE ?`, [
      {
        subscription_id: subscriptionId,
        created_at: MySQLHelper.YESTRD,
        start_date: MySQLHelper.NOW,
        status,
        bill_period: billPeriod
      },
      { customer_id: customerId }
    ]);

    const result: IDBStatus = await MySQLHelper.updateIfExistOrInsert(
      conn,
      'id',
      { selectOne, selectAll },
      update,
      insert
    );
    conn.end();
    return result;
  }

  public async getCustomer(name: string): Promise<[ICustomer]> {
    const conn = await this.db.getConnection();
    const sql = conn.format(`SELECT * FROM customers WHERE ?`, [{ name }]);
    const res = await this.db.execute(sql, conn);
    return res[0][0];
  }

  /**
   * Add client access setting to db
   *
   * @param {string} passwordHash
   * @returns {Promise<IDBStatus>}
   * @memberof CustomersDAO
   */
  public async addClientAccessSettings(enabled: boolean, passwordHash: string): Promise<number> {
    const conn = await this.db.getConnection();

    const selectAll = conn.format(`SELECT * FROM client_access_settings WHERE is_enabled = ${(enabled) ? 1 : 0} AND password = "${passwordHash}"`);
    const insert = conn.format('INSERT INTO client_access_settings SET ?', {
      is_enabled: 1,
      password: passwordHash
    });
    const selectOne = selectAll;
    const result: IDBStatus = await MySQLHelper.updateIfExistOrInsert(
      conn,
      'id',
      { selectOne, selectAll },
      null,
      insert
    );
    conn.end();
    return result.id;
  }

  // create customers and subscription
  public async createCustomer(
    c: IUser
  ): Promise<{
    id: number;
    result: string;
    subscription?: IDBStatus;
  }> {
    // let subscription: IDBStatus;
    const customer: {
      id: number;
      result: string;
      subscription?: IDBStatus;
    } = await this.addCustomer(c.email, c.locationName || 'GBR');

    if (c.subscriptionId) {
      customer.subscription = await this.addCustomerSubscription(
        customer.id,
        c.subscriptionId
      );
    }
    return customer;
  }
}

export { CustomersDAO };
