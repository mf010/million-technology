import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Topbar from '../../components/dashboard/Topbar';
import Modal from '../../components/dashboard/Modal';
import DataTable from '../../components/dashboard/DataTable';
import { jobOpeningService } from '../../services/jobOpeningService';
import { JobOpening } from '../../models/jobOpening';
import { PaginatedResponse } from '../../models/post';

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-primary/50 transition-all';
const labelCls = 'block text-white/50 text-xs font-medium mb-1.5';

const statusColor: Record<string, string> = { draft: 'text-white/40', open: 'text-green-400', close: 'text-accent' };
const emptyForm = { title: '', department: '', location: '', employment_type: 'full-time', workplace_type: 'on-site', summary: '', description: '', responsibilities: '', requirements: '', application_email: '', application_url: '', status: 'draft' };

export default function JobOpeningsPage() {
  const [data, setData] = useState<PaginatedResponse<JobOpening> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<JobOpening | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobOpening | null>(null);
  const [form, setForm] = useState<Record<string, string>>(emptyForm);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await jobOpeningService.list({ page: String(page), page_size: '15' }); setData(r.data); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    setFormError('');
    try { await jobOpeningService.create(form); setCreateModal(false); setForm(emptyForm); load(); }
    catch (e: unknown) { const err = e as { errors?: Record<string, string[]>; message?: string }; setFormError(err.errors ? Object.values(err.errors).flat()[0] : err.message ?? 'Error'); }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setFormError('');
    try { await jobOpeningService.update(editTarget.id, form); setEditTarget(null); load(); }
    catch (e: unknown) { const err = e as { errors?: Record<string, string[]>; message?: string }; setFormError(err.errors ? Object.values(err.errors).flat()[0] : err.message ?? 'Error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await jobOpeningService.delete(deleteTarget.id);
    setDeleteTarget(null); load();
  };

  const F = (key: string, label: string, type: 'input' | 'textarea' | 'select', opts?: string[]) => (
    <div key={key}>
      <label className={labelCls}>{label}</label>
      {type === 'textarea' ? <textarea rows={3} className={inputCls} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
        : type === 'select' ? <select className={inputCls} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>{opts!.map(o => <option key={o} value={o}>{o}</option>)}</select>
        : <input className={inputCls} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />}
    </div>
  );

  const FormContent = () => (
    <div className="grid grid-cols-2 gap-4">
      {formError && <p className="text-accent text-sm col-span-2">{formError}</p>}
      <div className="col-span-2">{F('title', 'Title *', 'input')}</div>
      {F('department', 'Department', 'input')} {F('location', 'Location', 'input')}
      {F('employment_type', 'Employment Type', 'select', ['full-time','part-time','contract','internship','temporary'])}
      {F('workplace_type', 'Workplace Type', 'select', ['on-site','remote','hybrid'])}
      {F('status', 'Status', 'select', ['draft','open','close'])}
      {F('application_email', 'Application Email', 'input')}
      <div className="col-span-2">{F('application_url', 'Application URL', 'input')}</div>
      <div className="col-span-2">{F('summary', 'Summary', 'textarea')}</div>
      <div className="col-span-2">{F('description', 'Description *', 'textarea')}</div>
      <div className="col-span-2">{F('responsibilities', 'Responsibilities', 'textarea')}</div>
      <div className="col-span-2">{F('requirements', 'Requirements', 'textarea')}</div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Job Openings" />
      <main className="flex-1 p-6">
        <div className="bg-[#1E272E]/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-white font-semibold">Job Openings</h2><p className="text-white/40 text-xs mt-0.5">{data?.total ?? 0} total</p></div>
            <button onClick={() => { setForm(emptyForm); setFormError(''); setCreateModal(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-all"><Plus className="w-4 h-4" /> New Job</button>
          </div>
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'title', label: 'Title' },
              { key: 'employment_type', label: 'Type' },
              { key: 'workplace_type', label: 'Location' },
              { key: 'status', label: 'Status', render: r => <span className={`text-xs font-medium ${statusColor[r.status]}`}>{r.status}</span> },
              { key: 'actions', label: '', render: row => (
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setEditTarget(row); setForm({ title: row.title, department: row.department ?? '', location: row.location ?? '', employment_type: row.employment_type, workplace_type: row.workplace_type, summary: row.summary ?? '', description: row.description, responsibilities: row.responsibilities ?? '', requirements: row.requirements ?? '', application_email: row.application_email ?? '', application_url: row.application_url ?? '', status: row.status }); setFormError(''); }} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
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

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Job Opening" size="xl">
        {FormContent()}<button onClick={handleCreate} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">Create</button>
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Job Opening" size="xl">
        {FormContent()}<button onClick={handleEdit} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">Save</button>
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Job Opening" size="sm">
        <p className="text-white/60 text-sm mb-6">Delete <strong className="text-white">{deleteTarget?.title}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-accent/20 border border-accent/20 text-accent text-sm font-medium">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
