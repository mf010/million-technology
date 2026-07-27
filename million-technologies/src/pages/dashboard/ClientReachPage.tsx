import { useState, useEffect, useCallback } from 'react';
import { Eye, Trash2, X } from 'lucide-react';
import Topbar from '../../components/dashboard/Topbar';
import Modal from '../../components/dashboard/Modal';
import DataTable from '../../components/dashboard/DataTable';
import { clientReachService } from '../../services/clientReachService';
import { ClientReach } from '../../models/clientReach';
import { PaginatedResponse } from '../../models/post';

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-primary/50 transition-all';
const labelCls = 'block text-white/50 text-xs font-medium mb-1.5';

const statusColors: Record<string, string> = {
  new: 'bg-primary/20 text-primary',
  'in-progress': 'bg-yellow-500/20 text-yellow-400',
  resolved: 'bg-green-500/20 text-green-400',
  archived: 'bg-white/10 text-white/40',
};

const typeColors: Record<string, string> = {
  request: 'text-primary', question: 'text-white/60', partnership: 'text-accent',
  complaint: 'text-red-400', other: 'text-white/40',
};

export default function ClientReachPage() {
  const [data, setData] = useState<PaginatedResponse<ClientReach> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [viewTarget, setViewTarget] = useState<ClientReach | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientReach | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), page_size: '15' };
    if (statusFilter) params.status = statusFilter;
    try { const r = await clientReachService.list(params); setData(r.data); } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async () => {
    if (!viewTarget) return;
    await clientReachService.update(viewTarget.id, { status: updateStatus || undefined, internal_notes: internalNotes || undefined });
    setViewTarget(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await clientReachService.delete(deleteTarget.id);
    setDeleteTarget(null); load();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Client Reach Inbox" />
      <main className="flex-1 p-6">
        <div className="bg-[#1E272E]/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-white font-semibold">Inbox</h2><p className="text-white/40 text-xs mt-0.5">{data?.total ?? 0} messages</p></div>
            {/* Status filter */}
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm outline-none focus:border-primary/50 transition-all">
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'message_type', label: 'Type', render: r => <span className={`text-xs font-medium ${typeColors[r.message_type]}`}>{r.message_type}</span> },
              { key: 'status', label: 'Status', render: r => <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[r.status]}`}>{r.status}</span> },
              { key: 'created_at', label: 'Received', render: r => new Date(r.created_at).toLocaleDateString() },
              { key: 'actions', label: '', render: row => (
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setViewTarget(row); setUpdateStatus(row.status); setInternalNotes(row.internal_notes ?? ''); }} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all" title="View"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
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

      {/* View / Update Message Modal */}
      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Message Details" size="lg">
        {viewTarget && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-white/40 text-xs mb-1">Name</p><p className="text-white font-medium">{viewTarget.name}</p></div>
              <div><p className="text-white/40 text-xs mb-1">Email</p><p className="text-white">{viewTarget.email}</p></div>
              {viewTarget.phone_number && <div><p className="text-white/40 text-xs mb-1">Phone</p><p className="text-white">{viewTarget.phone_number}</p></div>}
              {viewTarget.company_name && <div><p className="text-white/40 text-xs mb-1">Company</p><p className="text-white">{viewTarget.company_name}</p></div>}
              <div><p className="text-white/40 text-xs mb-1">Type</p><p className={`font-medium ${typeColors[viewTarget.message_type]}`}>{viewTarget.message_type}</p></div>
              <div><p className="text-white/40 text-xs mb-1">Received</p><p className="text-white">{new Date(viewTarget.created_at).toLocaleString()}</p></div>
            </div>
            <div><p className="text-white/40 text-xs mb-1">Subject</p><p className="text-white font-medium">{viewTarget.subject}</p></div>
            <div><p className="text-white/40 text-xs mb-1">Message</p><p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{viewTarget.message}</p></div>
            <div className="border-t border-white/10 pt-4 space-y-4">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">Admin Actions</p>
              <div>
                <label className={labelCls}>Update Status</label>
                <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)} className={inputCls}>
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Internal Notes</label>
                <textarea rows={4} value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="Add internal notes…" className={inputCls} />
              </div>
              <button onClick={handleUpdate} className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">Save Changes</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Message" size="sm">
        <p className="text-white/60 text-sm mb-6">Delete message from <strong className="text-white">{deleteTarget?.name}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-accent/20 border border-accent/20 text-accent text-sm font-medium">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
