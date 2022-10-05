import { ModelInit, MutableModel } from "@aws-amplify/datastore";

export declare class Followup {
  readonly assetNo?: string | null;
  readonly tagNumber?: string | null;
  readonly serialNumber?: string | null;
  readonly modelNur?: string | null;
  readonly taggable?: boolean | null;
  readonly category?: string | null;
  readonly subCategory?: string | null;
  readonly assetAdm?: string | null;
  readonly maintBh?: string | null;
  readonly datePlaceInService?: string | null;
  readonly assetCost?: number | null;
  readonly department?: string | null;
  readonly campus?: string | null;
  readonly block?: string | null;
  readonly floor?: string | null;
  readonly room?: string | null;
  readonly PONo?: string | null;
  readonly invoiceNo?: string | null;
  readonly projectCode?: string | null;
  readonly remarks?: string | null;
  constructor(init: ModelInit<Followup>);
}

export declare class BorrowRecord {
  readonly userId: string;
  readonly username: string;
  readonly borrowedAt: string;
  readonly returnedAt?: string | null;
  constructor(init: ModelInit<BorrowRecord>);
}

type ItemMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Item {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly record: (BorrowRecord | null)[];
  readonly followup?: Followup | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Item, ItemMetaData>);
  static copyOf(source: Item, mutator: (draft: MutableModel<Item, ItemMetaData>) => MutableModel<Item, ItemMetaData> | void): Item;
}