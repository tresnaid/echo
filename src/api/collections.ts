import { Collection, CollectionsResponse } from '../types';

export async function fetchCollections(): Promise<CollectionsResponse> {
  const res = await fetch('/api/collections');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch collections');
  }
  return res.json();
}

export async function createCollection(name: string): Promise<Collection> {
  const res = await fetch('/api/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create collection');
  }
  return res.json();
}

export async function renameCollection(id: number, name: string): Promise<Collection> {
  const res = await fetch(`/api/collections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to rename collection');
  }
  return res.json();
}

export async function deleteCollection(id: number): Promise<{ success: boolean; message: string; deleted_id: number }> {
  const res = await fetch(`/api/collections/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete collection');
  }
  return res.json();
}
