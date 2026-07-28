import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Topbar from '../../components/dashboard/Topbar';
import Modal from '../../components/dashboard/Modal';
import DataTable from '../../components/dashboard/DataTable';
import { serviceService } from '../../services/serviceService';
import { Service } from '../../models/service';

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-primary/50 transition-all';
const labelCls = 'block text-white/50 text-xs font-medium mb-1.5';

const emptyForm = { title: '', title_ar: '', short_description: '', short_description_ar: '', description: '', description_ar: '', display_order: '0', is_active: true, parent_id: '', seo_title: '', seo_description: '' };

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await serviceService.list(); setServices(r.services); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); setForm(emptyForm); }, [load]);

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null) {
        fd.append(k, k.startsWith('is_') ? (v ? '1' : '0') : String(v));
      }
    });
    return fd;
  };

  const handleCreate = async () => {
    setFormError('');
    try {
      await serviceService.create(buildFormData());
      setCreateModal(false); setForm(emptyForm); load();
    } catch (e: unknown) { const err = e as { errors?: Record<string, string[]>; message?: string }; setFormError(err.errors ? Object.values(err.errors).flat()[0] : err.message ?? 'Error'); }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setFormError('');
    try {
      await serviceService.update(editTarget.id, buildFormData());
      setEditTarget(null); load();
    } catch (e: unknown) { const err = e as { errors?: Record<string, string[]>; message?: string }; setFormError(err.errors ? Object.values(err.errors).flat()[0] : err.message ?? 'Error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await serviceService.delete(deleteTarget.id);
    setDeleteTarget(null); load();
  };

  const topLevel = services.filter(s => !s.parent_id);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Services" />
      <main className="flex-1 p-6">
        <div className="bg-[#1E272E]/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-white font-semibold">Services</h2><p className="text-white/40 text-xs mt-0.5">Manage services and sub-services</p></div>
            <button onClick={() => { setForm(emptyForm); setFormError(''); setCreateModal(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-all">
              <Plus className="w-4 h-4" /> New Service
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'title', label: 'Title', render: (r) => (<span>{r.parent_id ? <span className="text-white/30 mr-1">↳</span> : null}{r.title}</span>) },
              { key: 'is_active', label: 'Active', render: (r) => r.is_active ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-white/30" /> },
              { key: 'display_order', label: 'Order' },
              {
                key: 'actions', label: '',
                render: (row) => (
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditTarget(row); setForm({ title: row.title, title_ar: row.title_ar ?? '', short_description: row.short_description ?? '', short_description_ar: row.short_description_ar ?? '', description: row.description ?? '', description_ar: row.description_ar ?? '', display_order: String(row.display_order), is_active: row.is_active, parent_id: String(row.parent_id ?? ''), seo_title: row.seo_title ?? '', seo_description: row.seo_description ?? '' }); setFormError(''); }} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ),
              },
            ]}
            data={services}
            isLoading={loading}
          />
        </div>
      </main>

      {/* Create/Edit Modal */}
      {[{ open: createModal, title: 'New Service', onClose: () => setCreateModal(false), onSave: handleCreate },
        { open: !!editTarget, title: 'Edit Service', onClose: () => setEditTarget(null), onSave: handleEdit }].map(({ open, title, onClose, onSave }) => (
        <Modal key={title} open={open} onClose={onClose} title={title} size="lg">
          <div className="space-y-4">
            {formError && <p className="text-accent text-sm">{formError}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Title *</label><input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><label className={labelCls}>Title (AR)</label><input dir="rtl" className={inputCls} value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} /></div>
              
              <div><label className={labelCls}>Parent Service</label>
                <select className={inputCls} value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}>
                  <option value="">None (Top Level)</option>
                  {topLevel.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Display Order</label><input type="number" className={inputCls} value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} /></div>
              
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Short Description</label><textarea rows={2} className={inputCls} value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} /></div>
                <div><label className={labelCls}>Short Description (AR)</label><textarea dir="rtl" rows={2} className={inputCls} value={form.short_description_ar} onChange={e => setForm(f => ({ ...f, short_description_ar: e.target.value }))} /></div>
              </div>
              
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Description</label><textarea rows={4} className={inputCls} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div><label className={labelCls}>Description (AR)</label><textarea dir="rtl" rows={4} className={inputCls} value={form.description_ar} onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))} /></div>
              </div>
              
              <div className="col-span-2 flex items-center gap-3">
                <input type="checkbox" id={`svc-active-${title}`} checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-primary" />
                <label htmlFor={`svc-active-${title}`} className="text-white/60 text-sm">Active</label>
              </div>
            </div>
            <button onClick={onSave} className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">{title}</button>
          </div>
        </Modal>
      ))}

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Service" size="sm">
        <p className="text-white/60 text-sm mb-6">Delete <strong className="text-white">{deleteTarget?.title}</strong> and all its sub-services?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-all">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-accent/20 border border-accent/20 text-accent text-sm font-medium hover:bg-accent/30 transition-all">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
