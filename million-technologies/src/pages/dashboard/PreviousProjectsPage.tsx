import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Topbar from '../../components/dashboard/Topbar';
import Modal from '../../components/dashboard/Modal';
import DataTable from '../../components/dashboard/DataTable';
import { previousProjectService } from '../../services/previousProjectService';
import { ourClientService } from '../../services/ourClientService';
import { PreviousProject } from '../../models/previousProject';
import { OurClient } from '../../models/ourClient';
import { PaginatedResponse } from '../../models/post';

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-primary/50 transition-all';
const labelCls = 'block text-white/50 text-xs font-medium mb-1.5';
const STORAGE = 'http://localhost:8001/storage/';

const emptyForm = { title: '', client_display_name: '', short_description: '', description: '', challenge: '', solution: '', results: '', technologies: '', project_url: '', completed_at: '', is_featured: false, is_published: false, display_order: '0', our_client_id: '' };

export default function PreviousProjectsPage() {
  const [data, setData] = useState<PaginatedResponse<PreviousProject> | null>(null);
  const [clients, setClients] = useState<OurClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PreviousProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PreviousProject | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await previousProjectService.list({ page: String(page), page_size: '15' }); setData(r.data); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); ourClientService.list().then(r => setClients(r.clients)).catch(() => {}); }, [load]);

  const buildFd = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'technologies') { const arr = String(v).split(',').map(t => t.trim()).filter(Boolean); arr.forEach(t => fd.append('technologies[]', t)); }
      else if (v !== '' && v !== null) fd.append(k, k.startsWith('is_') ? (v ? '1' : '0') : String(v));
    });
    if (coverFile) fd.append('cover_image', coverFile);
    return fd;
  };

  const handleCreate = async () => {
    setFormError('');
    try { await previousProjectService.create(buildFd()); setCreateModal(false); setForm(emptyForm); setCoverFile(null); load(); }
    catch (e: unknown) { const err = e as { errors?: Record<string, string[]>; message?: string }; setFormError(err.errors ? Object.values(err.errors).flat()[0] : err.message ?? 'Error'); }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setFormError('');
    try { await previousProjectService.update(editTarget.id, buildFd()); setEditTarget(null); load(); }
    catch (e: unknown) { const err = e as { errors?: Record<string, string[]>; message?: string }; setFormError(err.errors ? Object.values(err.errors).flat()[0] : err.message ?? 'Error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await previousProjectService.delete(deleteTarget.id);
    setDeleteTarget(null); load();
  };

  const FormFields = () => (
    <div className="grid grid-cols-2 gap-4">
      {formError && <p className="text-accent text-sm col-span-2">{formError}</p>}
      <div className="col-span-2"><label className={labelCls}>Title *</label><input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
      <div><label className={labelCls}>Linked Client</label>
        <select className={inputCls} value={form.our_client_id} onChange={e => setForm(f => ({ ...f, our_client_id: e.target.value }))}>
          <option value="">None</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div><label className={labelCls}>Client Display Name</label><input className={inputCls} value={form.client_display_name} onChange={e => setForm(f => ({ ...f, client_display_name: e.target.value }))} /></div>
      <div><label className={labelCls}>Completed At</label><input type="date" className={inputCls} value={form.completed_at} onChange={e => setForm(f => ({ ...f, completed_at: e.target.value }))} /></div>
      <div><label className={labelCls}>Display Order</label><input type="number" className={inputCls} value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} /></div>
      <div className="col-span-2"><label className={labelCls}>Technologies (comma-separated)</label><input className={inputCls} value={form.technologies} onChange={e => setForm(f => ({ ...f, technologies: e.target.value }))} placeholder="React, Laravel, MySQL" /></div>
      <div className="col-span-2"><label className={labelCls}>Short Description</label><textarea rows={2} className={inputCls} value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} /></div>
      <div className="col-span-2"><label className={labelCls}>Description</label><textarea rows={3} className={inputCls} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
      <div className="col-span-2"><label className={labelCls}>Challenge</label><textarea rows={2} className={inputCls} value={form.challenge} onChange={e => setForm(f => ({ ...f, challenge: e.target.value }))} /></div>
      <div className="col-span-2"><label className={labelCls}>Solution</label><textarea rows={2} className={inputCls} value={form.solution} onChange={e => setForm(f => ({ ...f, solution: e.target.value }))} /></div>
      <div className="col-span-2"><label className={labelCls}>Results</label><textarea rows={2} className={inputCls} value={form.results} onChange={e => setForm(f => ({ ...f, results: e.target.value }))} /></div>
      <div><label className={labelCls}>Project URL</label><input className={inputCls} value={form.project_url} onChange={e => setForm(f => ({ ...f, project_url: e.target.value }))} /></div>
      <div><label className={labelCls}>Cover Image</label><input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] ?? null)} className="text-white/50 text-sm" /></div>
      <div className="col-span-2 flex gap-6">
        <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer"><input type="checkbox" className="accent-primary" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />Featured</label>
        <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer"><input type="checkbox" className="accent-primary" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />Published</label>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Previous Projects" />
      <main className="flex-1 p-6">
        <div className="bg-[#1E272E]/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-white font-semibold">Projects</h2><p className="text-white/40 text-xs mt-0.5">{data?.total ?? 0} published</p></div>
            <button onClick={() => { setForm(emptyForm); setCoverFile(null); setFormError(''); setCreateModal(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-all"><Plus className="w-4 h-4" /> New Project</button>
          </div>
          <DataTable
            columns={[
              { key: 'cover_image', label: '', render: r => r.cover_image ? <img src={STORAGE + r.cover_image} className="w-10 h-10 rounded-xl object-cover" alt={r.title} /> : <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10" /> },
              { key: 'title', label: 'Title' },
              { key: 'client_display_name', label: 'Client', render: r => r.client?.name ?? r.client_display_name ?? '—' },
              { key: 'is_featured', label: 'Featured', render: r => <span className={r.is_featured ? 'text-yellow-400 text-xs' : 'text-white/30 text-xs'}>{r.is_featured ? 'Yes' : 'No'}</span> },
              { key: 'is_published', label: 'Published', render: r => <span className={r.is_published ? 'text-green-400 text-xs' : 'text-white/30 text-xs'}>{r.is_published ? 'Yes' : 'No'}</span> },
              { key: 'actions', label: '', render: row => (
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setEditTarget(row); setForm({ title: row.title, client_display_name: row.client_display_name ?? '', short_description: row.short_description ?? '', description: row.description ?? '', challenge: row.challenge ?? '', solution: row.solution ?? '', results: row.results ?? '', technologies: (row.technologies ?? []).join(', '), project_url: row.project_url ?? '', completed_at: row.completed_at ?? '', is_featured: row.is_featured, is_published: row.is_published, display_order: String(row.display_order), our_client_id: String(row.our_client_id ?? '') }); setCoverFile(null); setFormError(''); }} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
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

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Project" size="xl">
        {FormFields()}<button onClick={handleCreate} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">Create</button>
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Project" size="xl">
        {FormFields()}<button onClick={handleEdit} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">Save</button>
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Project" size="sm">
        <p className="text-white/60 text-sm mb-6">Delete <strong className="text-white">{deleteTarget?.title}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-accent/20 border border-accent/20 text-accent text-sm font-medium">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
