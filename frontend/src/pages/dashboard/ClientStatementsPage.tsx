import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import Topbar from '../../components/dashboard/Topbar';
import Modal from '../../components/dashboard/Modal';
import DataTable from '../../components/dashboard/DataTable';
import { clientStatementService } from '../../services/clientStatementService';
import { ourClientService } from '../../services/ourClientService';
import { ClientStatement } from '../../models/clientStatement';
import { OurClient } from '../../models/ourClient';
import { STORAGE_URL } from '../../lib/api';

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-primary/50 transition-all';
const labelCls = 'block text-white/50 text-xs font-medium mb-1.5';
const STORAGE = STORAGE_URL;

const emptyForm = { client_name: '', client_name_ar: '', client_position: '', client_position_ar: '', company_name: '', company_name_ar: '', statement: '', statement_ar: '', rating: '5', is_published: false, is_featured: false, display_order: '0', our_client_id: '' };

function StarRating({ rating }: { rating: number }) {
  return <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />)}</div>;
}

export default function ClientStatementsPage() {
  const [statements, setStatements] = useState<ClientStatement[]>([]);
  const [clients, setClients] = useState<OurClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ClientStatement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientStatement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await clientStatementService.list(); setStatements(r.statements); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); ourClientService.list().then(r => setClients(r.clients)).catch(() => {}); }, [load]);

  const buildFd = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null) fd.append(k, k.startsWith('is_') ? (v ? '1' : '0') : String(v));
    });
    if (imageFile) fd.append('client_image', imageFile);
    return fd;
  };

  const handleCreate = async () => {
    setFormError('');
    try { await clientStatementService.create(buildFd()); setCreateModal(false); setForm(emptyForm); setImageFile(null); load(); }
    catch (e: unknown) { const err = e as { errors?: Record<string, string[]>; message?: string }; setFormError(err.errors ? Object.values(err.errors).flat()[0] : err.message ?? 'Error'); }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setFormError('');
    try { await clientStatementService.update(editTarget.id, buildFd()); setEditTarget(null); load(); }
    catch (e: unknown) { const err = e as { errors?: Record<string, string[]>; message?: string }; setFormError(err.errors ? Object.values(err.errors).flat()[0] : err.message ?? 'Error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await clientStatementService.delete(deleteTarget.id);
    setDeleteTarget(null); load();
  };

  const FormFields = () => (
    <div className="space-y-4">
      {formError && <p className="text-accent text-sm">{formError}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Client Name *</label><input className={inputCls} value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} /></div>
        <div><label className={labelCls}>Client Name (AR)</label><input dir="rtl" className={inputCls} value={form.client_name_ar} onChange={e => setForm(f => ({ ...f, client_name_ar: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Position</label><input className={inputCls} value={form.client_position} onChange={e => setForm(f => ({ ...f, client_position: e.target.value }))} /></div>
        <div><label className={labelCls}>Position (AR)</label><input dir="rtl" className={inputCls} value={form.client_position_ar} onChange={e => setForm(f => ({ ...f, client_position_ar: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Company</label><input className={inputCls} value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} /></div>
        <div><label className={labelCls}>Company (AR)</label><input dir="rtl" className={inputCls} value={form.company_name_ar} onChange={e => setForm(f => ({ ...f, company_name_ar: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Linked Client</label>
          <select className={inputCls} value={form.our_client_id} onChange={e => setForm(f => ({ ...f, our_client_id: e.target.value }))}>
            <option value="">None</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>Rating (1–5)</label><input type="number" min={1} max={5} className={inputCls} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Statement *</label><textarea rows={4} className={inputCls} value={form.statement} onChange={e => setForm(f => ({ ...f, statement: e.target.value }))} /></div>
        <div><label className={labelCls}>Statement (AR)</label><textarea rows={4} dir="rtl" className={inputCls} value={form.statement_ar} onChange={e => setForm(f => ({ ...f, statement_ar: e.target.value }))} /></div>
      </div>
      <div><label className={labelCls}>Client Photo</label><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} className="text-white/50 text-sm" /></div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer"><input type="checkbox" className="accent-primary" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />Published</label>
        <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer"><input type="checkbox" className="accent-primary" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />Featured</label>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Client Statements" />
      <main className="flex-1 p-6">
        <div className="bg-[#1E272E]/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-white font-semibold">Testimonials</h2><p className="text-white/40 text-xs mt-0.5">{statements.length} total</p></div>
            <button onClick={() => { setForm(emptyForm); setImageFile(null); setFormError(''); setCreateModal(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-all"><Plus className="w-4 h-4" /> New</button>
          </div>
          <DataTable
            columns={[
              { key: 'client_image', label: '', render: r => r.client_image ? <img src={STORAGE + r.client_image} className="w-8 h-8 rounded-full object-cover" alt={r.client_name} /> : <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" /> },
              { key: 'client_name', label: 'Client' },
              { key: 'company_name', label: 'Company', render: r => r.company_name ?? '—' },
              { key: 'rating', label: 'Rating', render: r => <StarRating rating={r.rating} /> },
              { key: 'is_published', label: 'Published', render: r => <span className={r.is_published ? 'text-green-400 text-xs' : 'text-white/30 text-xs'}>{r.is_published ? 'Yes' : 'No'}</span> },
              { key: 'actions', label: '', render: row => (
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setEditTarget(row); setForm({ client_name: row.client_name, client_name_ar: row.client_name_ar ?? '', client_position: row.client_position ?? '', client_position_ar: row.client_position_ar ?? '', company_name: row.company_name ?? '', company_name_ar: row.company_name_ar ?? '', statement: row.statement, statement_ar: row.statement_ar ?? '', rating: String(row.rating), is_published: row.is_published, is_featured: row.is_featured, display_order: String(row.display_order), our_client_id: String(row.our_client_id ?? '') }); setImageFile(null); setFormError(''); }} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )},
            ]}
            data={statements}
            isLoading={loading}
          />
        </div>
      </main>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Testimonial" size="lg">
        {FormFields()}<button onClick={handleCreate} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">Create</button>
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Testimonial" size="lg">
        {FormFields()}<button onClick={handleEdit} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">Save</button>
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Testimonial" size="sm">
        <p className="text-white/60 text-sm mb-6">Delete statement by <strong className="text-white">{deleteTarget?.client_name}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-accent/20 border border-accent/20 text-accent text-sm font-medium">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
