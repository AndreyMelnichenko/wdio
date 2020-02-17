import * as moment from 'moment';
import {
  Connection,
  ConnectionOptions,
  createConnection
} from 'mysql2/promise';
import { IDBCore } from './entities/DbCore';
import { IDBStatus } from './entities/IDBStatus';

class MySQLHelper implements IDBCore {
  private config: ConnectionOptions;
  private conn: Connection;
  private dbUrl: string;
  // fomatted data 2019-01-18 16:14:25
  private static DATE_FROMAT: string = 'YYYY-MM-DD hh:mm:ss';
  public static NOW: string = moment.default().format(MySQLHelper.DATE_FROMAT);
  public static YESTRD: string = moment
    .default()
    .subtract(1, 'days')
    .format(MySQLHelper.DATE_FROMAT);

  constructor(
    dbUrl: string = process.env.BASE_URL || '',
    host: string = process.env.DB_HOST || '',
    user: string = process.env.DB_USER || '',
    password: string = process.env.DB_PASS || '',
    database: string = process.env.DB_NAME ||
    `test_${dbUrl}`
  ) {
    this.dbUrl=dbUrl;
    this.config = {
      host,
      user,
      password,
      database
    };
  }
  /**
   * Update if exist, insert if doesn't
   *
   * @static
   * @param {Connection} conn
   * @param {string} fieldName
   * @param {{ selectOne: string; selectAll: string }} test
   * @param {string} updQ
   * @param {string} insrtQ
   * @returns {Promise<IDBStatus>}
   * @memberof MySQLHelper
   */
  public static async updateIfExistOrInsert(
    conn: Connection,
    fieldName: string,
    test: { selectOne: string; selectAll: string },
    updQ: string,
    insrtQ: string
  ): Promise<IDBStatus> {
    let result: string;
    let res;
    const nameID = await conn.query(test.selectOne);
    const all = await conn.query(test.selectAll);
    try {
      if (all[0][0]) {
        return { id: all[0][0][fieldName], result: 'exist' };
      } else if (nameID[0][0]) {
        res = await conn.execute(updQ);
        result = 'updated';
        // return updated row
        return { id: nameID[0][0][fieldName], result };
      } else {
        res = await conn.execute(insrtQ);
        result = 'created';
        // return id of inserted row
        return { id: res[0].insertId, result };
      }
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(`Database connection Error:\n${error}`);
      conn.end();
    }
  }

  /**
   * getConnection
   */
  public async getConnection(): Promise<Connection> {
    this.conn = await createConnection(this.config);
    return this.conn;
  }

  public async execute(
    sql: string,
    conn: Connection,
    closeConn: boolean = true
  ): Promise<any> {
    let result: any;
    try {
      // tslint:disable-next-line:no-console
      console.info(`DB [${this.dbUrl}]: Will execute:\n${sql}\n`);
      result = await conn.execute(sql);
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.warn(`MySQLHelper error: ${error}`);
    } finally {
      if (closeConn) await conn.end();
    }
    return result;
  }

  public shutDown(): void {
    this.conn.end();
  }
}

export { MySQLHelper };
