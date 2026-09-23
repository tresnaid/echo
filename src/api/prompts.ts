import { Prompt, Category } from '../types';

export interface PromptInput {
  title: string;
  prompt_text: string;
  description?: string | null;
  usage_description?: string | null;
  collection_id?: number | null;
  category_id?: string | null;
  tags?: string[];
}

export interface PromptQueryParams {
  collection_id?: 'uncollected' | number;
  category_id?: string;
  tag?: string;
  search?: string;
}

export async function fetchPrompts(params?: PromptQueryParams): Promise<Prompt[]> {
  const query = new URLSearchParams();
  if (params?.collection_id !== undefined) {
    query.set('collection_id', String(params.collection_id));
  }
  if (params?.category_id) {
    query.set('category_id', params.category_id);
  }
  if (params?.tag) {
    query.set('tag', params.tag);
  }
  if (params?.search) {
    query.set('search', params.search);
  }

  const qs = query.toString();
  const res = await fetch(`/api/prompts${qs ? `?${qs}` : ''}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch prompts');
  }
  return res.json();
}

export async function fetchPrompt(id: number): Promise<Prompt> {
  const res = await fetch(`/api/prompts/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch prompt');
  }
  return res.json();
}

export async function createPrompt(data: PromptInput): Promise<Prompt> {
  const res = await fetch('/api/prompts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create prompt');
  }
  return res.json();
}

export async function updatePrompt(id: number, data: PromptInput): Promise<Prompt> {
  const res = await fetch(`/api/prompts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update prompt');
  }
  return res.json();
}

export async function deletePrompt(id: number): Promise<{ success: boolean; message: string; deleted_id: number }> {
  const res = await fetch(`/api/prompts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete prompt');
  }
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch categories');
  }
  return res.json();
}

export async function fetchTags(): Promise<string[]> {
  const res = await fetch('/api/tags');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch tags');
  }
  return res.json();
}
