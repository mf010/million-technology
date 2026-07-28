import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Topbar from '../../components/dashboard/Topbar';
import Modal from '../../components/dashboard/Modal';
import DataTable from '../../components/dashboard/DataTable';
import { postService } from '../../services/postService';
import { Post, PaginatedResponse } from '../../models/post';

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-primary/50 transition-all';
const labelCls = 'block text-white/50 text-xs font-medium mb-1.5';

const statusColor = { draft: 'text-white/40', published: 'text-green-400', archived: 'text-yellow-400' };
const emptyForm = { title: '', title_ar: '', excerpt: '', excerpt_ar: '', content: '', content_ar: '', status: 'draft', seo_title: '', seo_description: '' };

export default function PostsPage() {
  const [data, setData] = useState<PaginatedResponse<Post> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Post | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await postService.list({ page, page_size: 15 }); setData(r.data); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const buildFd = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (imageFile) fd.append('image', imageFile);
    return fd;
  };

  const handleCreate = async () => {
    setFormError('');
    try { await postService.create(buildFd()); setCreateModal(false); setForm(emptyForm); setImageFile(null); load(); }
    catch (e: unknown) { const err = e as { errors?: Record<string, string[]>; message?: string }; setFormError(err.errors ? Object.values(err.errors).flat()[0] : err.message ?? 'Error'); }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setFormError('');
    try { await postService.update(editTarget.id, buildFd()); setEditTarget(null); load(); }
    catch (e: unknown) { const err = e as { errors?: Record<string, string[]>; message?: string }; setFormError(err.errors ? Object.values(err.errors).flat()[0] : err.message ?? 'Error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await postService.delete(deleteTarget.id);
    setDeleteTarget(null); load();
  };

  const FormFields = () => (
    <div className="space-y-4">
      {formError && <p className="text-accent text-sm">{formError}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Title *</label><input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div><label className={labelCls}>Title (AR)</label><input dir="rtl" className={inputCls} value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} /></div>
      </div>
      <div><label className={labelCls}>Status</label>
        <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
          <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Excerpt</label><textarea rows={2} className={inputCls} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} /></div>
        <div><label className={labelCls}>Excerpt (AR)</label><textarea dir="rtl" rows={2} className={inputCls} value={form.excerpt_ar} onChange={e => setForm(f => ({ ...f, excerpt_ar: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Content</label><textarea rows={6} className={inputCls} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
        <div><label className={labelCls}>Content (AR)</label><textarea dir="rtl" rows={6} className={inputCls} value={form.content_ar} onChange={e => setForm(f => ({ ...f, content_ar: e.target.value }))} /></div>
      </div>
      <div><label className={labelCls}>Cover Image</label><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} className="text-white/50 text-sm" /></div>
      <div><label className={labelCls}>SEO Title</label><input className={inputCls} value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} /></div>
      <div><label className={labelCls}>SEO Description</label><textarea rows={2} className={inputCls} value={form.seo_description} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} /></div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Posts" />
      <main className="flex-1 p-6">
        <div className="bg-[#1E272E]/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-white font-semibold">Blog Posts</h2><p className="text-white/40 text-xs mt-0.5">{data?.total ?? 0} total posts</p></div>
            <button onClick={() => { setForm(emptyForm); setFormError(''); setCreateModal(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-all"><Plus className="w-4 h-4" /> New Post</button>
          </div>
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'title', label: 'Title' },
              { key: 'status', label: 'Status', render: r => <span className={`text-xs font-medium ${statusColor[r.status]}`}>{r.status}</span> },
              { key: 'published_at', label: 'Published', render: r => r.published_at ? new Date(r.published_at).toLocaleDateString() : '—' },
              { key: 'actions', label: '', render: row => (
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setEditTarget(row); setForm({ title: row.title, title_ar: row.title_ar ?? '', excerpt: row.excerpt ?? '', excerpt_ar: row.excerpt_ar ?? '', content: row.content ?? '', content_ar: row.content_ar ?? '', status: row.status, seo_title: row.seo_title ?? '', seo_description: row.seo_description ?? '' }); setFormError(''); }} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )},
            ]}
            data={data?.data ?? []}
            isLoading={loading}
            page={page}
            totalPages={data?.last_page ?? 1}
            onPageChange={setPage}
          />
        </div>
      </main>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Post" size="lg">
        {FormFields()}
        <button onClick={handleCreate} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">Create Post</button>
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Post" size="lg">
        {FormFields()}
        <button onClick={handleEdit} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">Save Changes</button>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Post" size="sm">
        <p className="text-white/60 text-sm mb-6">Delete <strong className="text-white">{deleteTarget?.title}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-accent/20 border border-accent/20 text-accent text-sm font-medium">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
