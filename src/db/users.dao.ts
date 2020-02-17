import { passwordHash } from '../fixtures/users';
import { IUser } from '../models/User';
import { IDBStatus } from './entities/IDBStatus';
import { IDBUser } from './entities/IDBUser';
import { MySQLHelper } from './mysqlHelper';

class UsersDAO {
  private db: MySQLHelper;

  constructor(dbHelper: MySQLHelper) {
    this.db = dbHelper;
  }

  public async getUser(email: string): Promise<IDBUser> {
    const conn = await this.db.getConnection();
    const sql = conn.format(`SELECT * FROM users WHERE ?`, [{ email }]);
    const res = await this.db.execute(sql, conn);
    return res[0][0];
  }

  private async addUser(
    customerId: number,
    email: string,
    password: string,
    userType: string = 'Admin',
    verified: string = 'Yes',
    status: string = 'Enabled',
    gdrp: string = '1'
  ): Promise<IDBStatus> {
    const conn = await this.db.getConnection();
    const selectOne = conn
      .format(`SELECT user_id FROM users WHERE ?`, [
        { email, full_name: email }
      ])
      .replace(/,/g, ' AND ');
    const selectAll = conn
      .format(
        `SELECT user_id FROM users
      WHERE ?`,
        [
          {
            email,
            customer_id: customerId,
            password,
            user_type: userType,
            verified,
            status
          }
        ]
      )
      .replace(/,/g, ' AND ');
    const insert = conn.format('INSERT INTO users SET ?', {
      customer_id: customerId,
      email,
      password,
      full_name: email,
      firstname: email,
      lastname: email,
      user_type: userType,
      verified,
      status,
      date_added: MySQLHelper.YESTRD,
      last_login: MySQLHelper.YESTRD,
      gdpr_selected: gdrp,
      gdpr_selected_date: MySQLHelper.YESTRD
    });
    const update = conn.format(`UPDATE users SET ? WHERE ?`, [
      {
        customer_id: customerId,
        password,
        full_name: email,
        firstname: email,
        lastname: email,
        user_type: userType,
        verified,
        status,
        date_added: MySQLHelper.YESTRD,
        last_login: MySQLHelper.YESTRD,
        gdpr_selected: gdrp,
        gdpr_selected_date: MySQLHelper.YESTRD
      },
      {
        email
      }
    ]);

    const result: IDBStatus = await MySQLHelper.updateIfExistOrInsert(
      conn,
      'user_id',
      { selectOne, selectAll },
      update,
      insert
    );
    conn.end();
    return result;
  }

  // create users for customers
  public async createUser(customerId: number, u: IUser): Promise<IDBStatus> {
    const user: {
      id: number;
      result: string;
    } = await this.addUser(
      customerId,
      // create user for customer
      u.userEmail || u.email,
      u.password || passwordHash,
      u.userType
    );

    return user;
  }
}

export { UsersDAO };
