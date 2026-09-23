export interface Collection {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  prompt_count: number;
}

export interface CollectionCounts {
  all: number;
  uncollected: number;
}

export interface CollectionsResponse {
  collections: Collection[];
  counts: CollectionCounts;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Prompt {
  id: number;
  title: string;
  prompt_text: string;
  description?: string | null;
  usage_description?: string | null;
  collection_id?: number | null;
  category_id?: string | null;
  collection_name?: string | null;
  category_name?: string | null;
  tags?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type SelectedCollectionView = 'all' | 'uncollected' | number;
