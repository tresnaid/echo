import { useEffect, useRef, useState } from 'react';
import { Category, Collection, Prompt, PromptMedia } from '../../types';
import { createPrompt, fetchCategories, updatePrompt, uploadMediaFiles } from '../../api/prompts';
import { getMediaUrl } from '../../api/config';
import { CreateCollectionModal } from '../collections/CreateCollectionModal';

interface PromptFormModalProps {
  prompt?: Prompt | null;
  collections: Collection[];
  defaultCollectionId?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (prompt: Prompt) => void;
  onCollectionCreated?: (collection: Collection) => void;
}

export function PromptFormModal({ prompt, collections, defaultCollectionId, open, onOpenChange, onSaved, onCollectionCreated }: PromptFormModalProps) {
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [description, setDescription] = useState('');
  const [usage, setUsage] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [media, setMedia] = useState<PromptMedia[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkCaption, setLinkCaption] = useState('');
  const [linkType, setLinkType] = useState<'image' | 'video'>('image');
  const [createCollection, setCreateCollection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; prompt?: string; general?: string }>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchCategories().then(setCategories).catch(() => setCategories([])); }, []);
  useEffect(() => {
    if (!open) return;
    setTitle(prompt?.title || ''); setPromptText(prompt?.prompt_text || ''); setDescription(prompt?.description || ''); setUsage(prompt?.usage_description || '');
    setCollectionId(prompt?.collection_id ? String(prompt.collection_id) : defaultCollectionId ? String(defaultCollectionId) : '');
    setCategoryId(prompt?.category_id || ''); setTags(prompt?.tags || []); setMedia(prompt?.media || []); setErrors({}); setShowLink(false);
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && onOpenChange(false);
    document.addEventListener('keydown', escape); document.body.classList.add('echo-modal-open');
    return () => { document.removeEventListener('keydown', escape); document.body.classList.remove('echo-modal-open'); };
  }, [open, prompt, defaultCollectionId, onOpenChange]);
  if (!open) return null;

  const addTag = () => {
    const value = tagInput.trim().replace(/^#/, '');
    if (value && !tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) setTags([...tags, value]);
    setTagInput('');
  };
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      setUploading(true);
      const uploaded = await uploadMediaFiles(Array.from(files));
      setMedia((current) => [...current, ...uploaded]);
    }
    catch (error) { setErrors((current) => ({ ...current, general: error instanceof Error ? error.message : 'Media upload failed' })); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };
  const addLink = () => {
    if (!linkUrl.trim()) return;
    setMedia((current) => [...current, { id: Date.now(), prompt_id: prompt?.id || 0, media_type: linkType, url: linkUrl.trim(), thumbnail_url: linkType === 'image' ? linkUrl.trim() : null, medium_url: linkType === 'image' ? linkUrl.trim() : null, caption: linkCaption.trim() || null, created_at: new Date().toISOString() }]);
    setLinkUrl(''); setLinkCaption(''); setShowLink(false);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = 'Title is required.';
    if (!promptText.trim()) nextErrors.prompt = 'Prompt text is required.';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    try {
      setSaving(true); setErrors({});
      const payload = { title: title.trim(), prompt_text: promptText, description: description.trim() || null, usage_description: usage.trim() || null, collection_id: collectionId ? Number(collectionId) : null, category_id: categoryId || null, tags, media };
      const saved = prompt ? await updatePrompt(prompt.id, payload) : await createPrompt(payload);
      onOpenChange(false); onSaved?.(saved);
    } catch (error) { setErrors({ general: error instanceof Error ? error.message : 'Unable to save prompt' }); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="echo-modal-backdrop echo-editor-backdrop" role="presentation">
        <form className="echo-editor-panel" role="dialog" aria-modal="true" aria-labelledby="echo-editor-title" onSubmit={save}>
          <header className="echo-editor-title-row">
            <div><h2 id="echo-editor-title">{prompt ? 'Edit prompt' : 'Create new prompt'}</h2><p>Edit mode uses the same form with existing values loaded.</p></div>
            <button type="button" onClick={() => onOpenChange(false)}>Cancel</button>
          </header>
          {errors.general && <p className="echo-form-error" role="alert">{errors.general}</p>}

          <div className="echo-editor-columns">
            <div className="echo-editor-primary">
              <label className="echo-field"><span>Title <small>Shown in the library and search results.</small></span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} />{errors.title && <em>{errors.title}</em>}</label>
              <label className="echo-field"><span>Prompt text <small>The exact prompt that will be copied and used.</small></span><textarea rows={8} value={promptText} onChange={(event) => setPromptText(event.target.value)} />{errors.prompt && <em>{errors.prompt}</em>}</label>
              <label className="echo-field"><span>Short description <small>A short summary shown on prompt cards.</small></span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
              <label className="echo-field"><span>Usage notes <small>Explain what to change and what to keep.</small></span><textarea rows={4} value={usage} onChange={(event) => setUsage(event.target.value)} /></label>

              <section className="echo-media-editor">
                <h3>Media</h3><p>Upload an image or video, or add a public media URL.</p>
                <input ref={fileRef} hidden type="file" multiple accept="image/*,video/*" onChange={(event) => upload(event.target.files)} />
                <div className="echo-action-row"><button type="button" className="echo-button echo-button-quiet" disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? 'Uploading...' : 'Upload file'}</button><button type="button" className="echo-button echo-button-quiet" onClick={() => setShowLink(!showLink)}>Add link</button></div>
                {media.map((item, index) => <div className="echo-attached-media" key={item.id || index}>{item.media_type === 'image' && <img src={getMediaUrl(item.thumbnail_url || item.url)} alt={item.caption || 'Attached media'} />}<span>{item.file_name || item.caption || item.url}</span><button type="button" onClick={() => setMedia(media.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}
              </section>
            </div>

            <aside className="echo-editor-secondary">
              <label className="echo-field"><span>Prompt type <small>Text, code, image, or video.</small></span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Uncategorized</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
              <label className="echo-field"><span>Collection <small>Optional group for related prompts.</small></span><select value={collectionId} onChange={(event) => event.target.value === '__new__' ? setCreateCollection(true) : setCollectionId(event.target.value)}><option value="">Uncollected</option>{collections.map((collection) => <option value={collection.id} key={collection.id}>{collection.name}</option>)}<option value="__new__">Create collection...</option></select></label>
              <label className="echo-field"><span>Tags <small>Use tags to make the prompt easier to find.</small></span><input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addTag(); } }} onBlur={addTag} placeholder="portrait, lighting" /></label>
              {!!tags.length && <div className="echo-editor-tags">{tags.map((tag) => <button type="button" key={tag} onClick={() => setTags(tags.filter((item) => item !== tag))}>{tag} ×</button>)}</div>}
              {showLink && <section className="echo-link-editor"><h3>Add media link</h3><select value={linkType} onChange={(event) => setLinkType(event.target.value as 'image' | 'video')}><option value="image">Image</option><option value="video">Video</option></select><input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://example.com/image.jpg" /><input value={linkCaption} onChange={(event) => setLinkCaption(event.target.value)} placeholder="Optional caption" /><button type="button" onClick={addLink}>Add link</button></section>}
              <section className="echo-editor-states"><h3>{prompt ? 'Edit mode' : 'Create mode'}</h3><p>{prompt ? 'Existing media can be removed before saving.' : 'Required: title and prompt text.'}</p></section>
            </aside>
          </div>
          <footer className="echo-editor-footer"><span>Required: title and prompt text</span><button type="submit" className="echo-button echo-button-primary" disabled={saving || uploading}>{saving ? 'Saving...' : 'Save prompt'}</button></footer>
        </form>
      </div>
      <CreateCollectionModal open={createCollection} onOpenChange={setCreateCollection} onCreated={(collection) => { onCollectionCreated?.(collection); setCollectionId(String(collection.id)); }} />
    </>
  );
}
