import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";

type EagerFollowup = {
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
}

type LazyFollowup = {
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
}

export declare type Followup = LazyLoading extends LazyLoadingDisabled ? EagerFollowup : LazyFollowup

export declare const Followup: (new (init: ModelInit<Followup>) => Followup)

type EagerBorrowRecord = {
  readonly userId: string;
  readonly username: string;
  readonly borrowedAt: string;
  readonly returnedAt?: string | null;
}

type LazyBorrowRecord = {
  readonly userId: string;
  readonly username: string;
  readonly borrowedAt: string;
  readonly returnedAt?: string | null;
}

export declare type BorrowRecord = LazyLoading extends LazyLoadingDisabled ? EagerBorrowRecord : LazyBorrowRecord

export declare const BorrowRecord: (new (init: ModelInit<BorrowRecord>) => BorrowRecord)

type ItemMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EagerItem = {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly record: (BorrowRecord | null)[];
  readonly followup?: Followup | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyItem = {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly record: (BorrowRecord | null)[];
  readonly followup?: Followup | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Item = LazyLoading extends LazyLoadingDisabled ? EagerItem : LazyItem

export declare const Item: (new (init: ModelInit<Item, ItemMetaData>) => Item) & {
  copyOf(source: Item, mutator: (draft: MutableModel<Item, ItemMetaData>) => MutableModel<Item, ItemMetaData> | void): Item;
}