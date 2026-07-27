import { useState, useEffect } from 'react';
import { Plus, Trash2, Key } from 'lucide-react';
import Topbar from '../../components/dashboard/Topbar';
import Modal from '../../components/dashboard/Modal';
import DataTable from '../../components/dashboard/DataTable';
import { authService } from '../../services/authService';
import { User } from '../../models/auth';
import { useAuth } from '../../contexts/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [changePwModal, setChangePwModal] = useState<User | null>(null);
  const [deleteModal, setDeleteModal] = useState<User | null>(null);
  const [createModal, setCreateModal] = useState(false);

  // Create user form
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await authService.listUsers();
      setUsers(res.users);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async () => {
    setFormError('');
    try {
      await authService.register(form);
      setCreateModal(false);
      setSuccess('User registered successfully.');
      setForm({ name: '', email: '', password: '', password_confirmation: '' });
      loadUsers();
    } catch (e: unknown) {
      const err = e as { errors?: Record<string, string[]>; message?: string };
      setFormError(err.errors ? Object.values(err.errors).flat().join('. ') : err.message ?? 'Error');
    }
  };

  const handleChangePassword = async () => {
    setFormError('');
    try {
      await authService.changePassword(pwForm);
      setChangePwModal(null);
      setSuccess('Password changed successfully.');
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (e: unknown) {
      const err = e as { message?: string };
      setFormError(err.message ?? 'Error');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      if (currentUser && deleteModal.id === currentUser.id) {
        await authService.deleteAccount();
        setDeleteModal(null);
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      } else {
        await authService.deleteUser(deleteModal.id);
        setDeleteModal(null);
        loadUsers();
      }
    } catch { /* ignore */ }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-primary/50 transition-all';
  const labelCls = 'block text-white/50 text-xs font-medium mb-1.5';

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="User Management" />
      <main className="flex-1 p-6">
        <div className="bg-[#1E272E]/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-semibold">Users</h2>
              <p className="text-white/40 text-xs mt-0.5">Manage admin accounts</p>
            </div>
            <button
              onClick={() => setCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-all"
            >
              <Plus className="w-4 h-4" /> New User
            </button>
          </div>

          {success && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </div>
          )}

          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'created_at', label: 'Created', render: (r) => new Date(r.created_at).toLocaleDateString() },
              {
                key: 'actions', label: 'Actions',
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setChangePwModal(row); setFormError(''); }} className="p-1.5 rounded-lg bg-primary/10 border border-primary/10 text-primary hover:bg-primary/20 transition-all" title="Change Password">
                      <Key className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteModal(row)} className="p-1.5 rounded-lg bg-accent/10 border border-accent/10 text-accent hover:bg-accent/20 transition-all" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={users}
            isLoading={loading}
            emptyMessage="No additional users. Use 'New User' to register one."
          />
        </div>
      </main>

      {/* Create User Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Register New User">
        <div className="space-y-4">
          {formError && <p className="text-accent text-sm">{formError}</p>}
          {(['name', 'email', 'password', 'password_confirmation'] as const).map((field) => (
            <div key={field}>
              <label className={labelCls}>{field.replace('_', ' ')}</label>
              <input type={field.includes('password') ? 'password' : 'text'} className={inputCls} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            </div>
          ))}
          <button onClick={handleCreate} className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all mt-2">Register</button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal open={!!changePwModal} onClose={() => setChangePwModal(null)} title="Change Password">
        <div className="space-y-4">
          {formError && <p className="text-accent text-sm">{formError}</p>}
          {(['current_password', 'new_password', 'new_password_confirmation'] as const).map((field) => (
            <div key={field}>
              <label className={labelCls}>{field.replace(/_/g, ' ')}</label>
              <input type="password" className={inputCls} value={pwForm[field]} onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })} />
            </div>
          ))}
          <button onClick={handleChangePassword} className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all mt-2">Update Password</button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Account" size="sm">
        <p className="text-white/60 text-sm mb-6">This will permanently delete your account and log you out. This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-all">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-accent/20 border border-accent/20 text-accent text-sm font-medium hover:bg-accent/30 transition-all">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
