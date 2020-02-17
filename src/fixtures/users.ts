import { IUser } from '../models/User';

const passwordHash =
  '$6$rounds=1000000$4c98ff959ce99ec8$inHLwt77Hfz3pEUTnUtgGWQEOJdVtF5f/wkrcX8eCUMuZEs.AUpONbuYfacM9S06L4D.L5AVKaEyaHTBfvBP/0';
const password = '12345678';

const users: IUser[] = [
  {
    email: 'test-user',
    userEmail: 'testUser@add.com'
  }
];

export { users, passwordHash, password };
