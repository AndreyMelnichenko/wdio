import { users } from '../fixtures/users';
import { CustomersDAO } from './customers.dao';
import { MySQLHelper } from './mysqlHelper';
import { UsersDAO } from './users.dao';

//
const db = new MySQLHelper();
const customerDao = new CustomersDAO(db);
const usersDao = new UsersDAO(db);

users.forEach(async c => {
  const cRes = await customerDao.createCustomer(c);
  // tslint:disable-next-line:no-console
  console.log(
    `\nDB: Customer "${c.email}" subscribed to ${c.subscriptionId}:
      customer_id: ${cRes.id} (${cRes.result})
      customer_subscription id: ${
    cRes.subscription ? cRes.subscription.id : 'Not created'
    } (${
    cRes.subscription
      ? cRes.subscription.result
      : `subscriptionId: ${c.subscriptionId}`
    })\n`
  );

  const uRes = await usersDao.createUser(cRes.id, c);
  // tslint:disable-next-line:no-console
  console.log(
    `\nDB: Create Users:
    user_id: ${uRes.id} ${c.userEmail || c.email} assigned to ${cRes.id} (${
    uRes.result
    })`
  );
});
