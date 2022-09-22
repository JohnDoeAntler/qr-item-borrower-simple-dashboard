// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Item, BorrowRecord } = initSchema(schema);

export {
  Item,
  BorrowRecord
};