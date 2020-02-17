import {
  Connection,
  OkPacket,
  QueryError,
  RowDataPacket
} from "mysql2/promise";

interface IDBCore {
  getConnection(): Promise<Connection>;
  shutDown(): void;
}

export { IDBCore, OkPacket, QueryError, RowDataPacket };
