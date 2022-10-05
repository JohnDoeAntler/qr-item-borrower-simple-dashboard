// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Item, Followup, BorrowRecord } = initSchema(schema);

export {
  Item,
  Followup,
  BorrowRecord
};