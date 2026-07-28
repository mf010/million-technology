import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import Topbar from '../../components/dashboard/Topbar';
import Modal from '../../components/dashboard/Modal';
import DataTable from '../../components/dashboard/DataTable';
import { ourClientService } from '../../services/ourClientService';
import { OurClient } from '../../models/ourClient';

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-primary/50 transition-all';
const labelCls = 'block text-white/50 text-xs font-medium mb-1.5';
const STORAGE = 'http://localhost:8001/storage/';

const emptyForm = { name: '', website_url: '', description: '', description_ar: '', is_featured: false, is_active: true, display_order: 0 };

export default function OurClientsPage() {
  const [clients, setClients] = useState<OurClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<OurClient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OurClient | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await ourClientService.list(); setClients(r.clients); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const buildFd = () => {
    const fd = new FormData();
    fd.append('name', form.name);
    if (form.website_url) fd.append('website_url', form.website_url);
    if (form.description) fd.append('description', form.description);
    if (form.description_ar) fd.append('description_ar', form.description_ar);
    fd.append('is_featured', form.is_featured ? '1' : '0');
    fd.append('is_active', form.is_active ? '1' : '0');
    fd.append('display_order', String(form.display_order));
    if (logoFile) fd.append('logo', logoFile);
    return fd;
  };

  const handleCreate = async () => {
    setFormError('');
    try { await ourClientService.create(buildFd()); setCreateModal(false); setForm(emptyForm); setLogoFile(null); load(); }
    catch (e: unknown) { const err = e as { errors?: Record<string, string[]>; message?: string }; setFormError(err.errors ? Object.values(err.errors).flat()[0] : err.message ?? 'Error'); }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setFormError('');
    try { await ourClientService.update(editTarget.id, buildFd()); setEditTarget(null); load(); }
    catch (e: unknown) { const err = e as { errors?: Record<string, string[]>; message?: string }; setFormError(err.errors ? Object.values(err.errors).flat()[0] : err.message ?? 'Error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await ourClientService.delete(deleteTarget.id);
    setDeleteTarget(null); load();
  };

  const FormFields = () => (
    <div className="space-y-4">
      {formError && <p className="text-accent text-sm">{formError}</p>}
      <div><label className={labelCls}>Name *</label><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
      <div><label className={labelCls}>Website URL</label><input className={inputCls} value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} /></div>
      <div><label className={labelCls}>Description</label><textarea rows={3} className={inputCls} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
      <div><label className={labelCls}>Description (AR)</label><textarea dir="rtl" rows={3} className={inputCls} value={form.description_ar} onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))} /></div>
      <div><label className={labelCls}>Logo</label><input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] ?? null)} className="text-white/50 text-sm" /></div>
      <div><label className={labelCls}>Display Order</label><input type="number" className={inputCls} value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))} /></div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer"><input type="checkbox" className="accent-primary" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />Featured</label>
        <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer"><input type="checkbox" className="accent-primary" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />Active</label>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Our Clients" />
      <main className="flex-1 p-6">
        <div className="bg-[#1E272E]/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-white font-semibold">Clients</h2><p className="text-white/40 text-xs mt-0.5">{clients.length} total</p></div>
            <button onClick={() => { setForm(emptyForm); setLogoFile(null); setFormError(''); setCreateModal(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-all"><Plus className="w-4 h-4" /> New Client</button>
          </div>
          <DataTable
            columns={[
              { key: 'logo', label: 'Logo', render: r => r.logo ? <img src={STORAGE + r.logo} className="w-8 h-8 rounded-lg object-contain bg-white/5" alt={r.name} /> : <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" /> },
              { key: 'name', label: 'Name' },
              { key: 'is_featured', label: 'Featured', render: r => r.is_featured ? <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> : <Star className="w-4 h-4 text-white/20" /> },
              { key: 'is_active', label: 'Active', render: r => <span className={r.is_active ? 'text-green-400 text-xs' : 'text-white/30 text-xs'}>{r.is_active ? 'Active' : 'Inactive'}</span> },
              { key: 'actions', label: '', render: row => (
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setEditTarget(row); setForm({ name: row.name, website_url: row.website_url ?? '', description: row.description ?? '', description_ar: row.description_ar ?? '', is_featured: row.is_featured, is_active: row.is_active, display_order: row.display_order }); setLogoFile(null); setFormError(''); }} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )},
            ]}
            data={clients}
            isLoading={loading}
          />
        </div>
      </main>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Client">
        {FormFields()}<button onClick={handleCreate} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">Create</button>
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Client">
        {FormFields()}<button onClick={handleEdit} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">Save</button>
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Client" size="sm">
        <p className="text-white/60 text-sm mb-6">Delete client <strong className="text-white">{deleteTarget?.name}</strong>? Related projects will retain their data.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-accent/20 border border-accent/20 text-accent text-sm font-medium">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
