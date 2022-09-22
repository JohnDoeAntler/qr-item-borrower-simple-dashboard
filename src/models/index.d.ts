import { ModelInit, MutableModel } from "@aws-amplify/datastore";

export declare class BorrowRecord {
  readonly studentId?: string | null;
  readonly borrowedAt?: string | null;
  constructor(init: ModelInit<BorrowRecord>);
}

type ItemMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Item {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly record?: BorrowRecord | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Item, ItemMetaData>);
  static copyOf(source: Item, mutator: (draft: MutableModel<Item, ItemMetaData>) => MutableModel<Item, ItemMetaData> | void): Item;
}