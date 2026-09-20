import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  Server,
  Search,
  X
} from 'lucide-react';
import type { LocalUser, UserRole } from '../types/doxfin';

interface UsersAndAccessProps {
  users: LocalUser[];
  onAddUser?: (user: LocalUser) => void;
}

export const UsersAndAccess: React.FC<UsersAndAccessProps> = ({ users: initialUsers, onAddUser }) => {
  const [users, setUsers] = useState<LocalUser[]>(initialUsers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Add User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Financial Analyst');
  const [newUserDepartment, setNewUserDepartment] = useState('Equity Research');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: LocalUser = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: newUserDepartment,
      documentsCount: 0,
      lastActive: 'Invited (Pending First Sign-in)',
      status: 'Active',
      permissions: {
        owner: newUserRole === 'Administrator',
        analyze: newUserRole === 'Administrator' || newUserRole === 'Financial Analyst',
        read: true,
        export: newUserRole !== 'Viewer',
        delete: newUserRole === 'Administrator'
      }
    };

    setUsers([...users, newUser]);
    if (onAddUser) onAddUser(newUser);
    setIsAddModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#0F3E5D]/10 text-[#0F3E5D] font-mono uppercase tracking-wider">
                Local User Administration
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Role-Based Access Control (RBAC)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['DM_Sans']">
              Users & Access Management
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Manage internal employees accessing this on-premises DoxFin instance. All credentials, session tokens, and document access controls reside on this local host.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary text-xs sm:text-sm font-semibold flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-sky-200" />
            <span>+ Add Local User</span>
          </button>
        </div>

        {/* Local Security Clarification Banner */}
        <div className="mt-6 p-4 rounded-lg bg-sky-50/60 border border-sky-100 flex items-start gap-3">
          <Server className="w-5 h-5 text-[#0F3E5D] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900 font-semibold block mb-0.5">
              Local Organization Security Boundary
            </strong>
            All team members authenticated here access the same high-performance local AI node over your internal network (e.g. 192.168.1.0/24 subnet). No external SaaS accounts or cloud directories are required.
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="dox-card p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['DM_Sans']">Active Local Team Members</h2>
            <p className="text-xs text-slate-500">{users.length} Authorized enterprise users</p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, role, department..."
              className="dox-input text-xs pl-8"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="dox-table-container">
          <table className="dox-table">
            <thead>
              <tr>
                <th>User / Name</th>
                <th>Enterprise Role</th>
                <th>Department</th>
                <th>Documents</th>
                <th>Permissions Matrix</th>
                <th>Last Active</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Name & Email */}
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#0F3E5D]/10 text-[#0F3E5D] font-bold text-xs flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-slate-900 block">{user.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">{user.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                      user.role === 'Administrator'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : user.role === 'Financial Analyst'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : user.role === 'Reviewer'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="text-xs text-slate-600 font-medium">
                    {user.department}
                  </td>

                  {/* Documents Count */}
                  <td className="text-xs font-mono text-slate-800 font-semibold tabular-nums">
                    {user.documentsCount} docs
                  </td>

                  {/* Document Permissions Matrix */}
                  <td>
                    <div className="flex items-center gap-1 text-[10px] font-mono">
                      <span className={`px-1.5 py-0.5 rounded ${user.permissions.owner ? 'bg-sky-100 text-sky-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                        OWN
                      </span>
                      <span className={`px-1.5 py-0.5 rounded ${user.permissions.analyze ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                        ANALYZE
                      </span>
                      <span className={`px-1.5 py-0.5 rounded ${user.permissions.read ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                        READ
                      </span>
                      <span className={`px-1.5 py-0.5 rounded ${user.permissions.export ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                        EXPORT
                      </span>
                      <span className={`px-1.5 py-0.5 rounded ${user.permissions.delete ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                        DEL
                      </span>
                    </div>
                  </td>

                  {/* Last Active */}
                  <td className="text-xs text-slate-500 font-mono">
                    {user.lastActive}
                  </td>

                  {/* Status */}
                  <td>
                    <span className="badge badge-completed">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0F3E5D] text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-sky-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['DM_Sans']">Add Local Team Member</h3>
                  <p className="text-xs text-slate-500">Assign role and document privileges</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="dox-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enterprise Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="vikram.s@internal.doxfin"
                  className="dox-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="dox-select w-full text-xs"
                >
                  <option value="Financial Analyst">Financial Analyst (Analyze, Read, Export)</option>
                  <option value="Administrator">Administrator (Full Control)</option>
                  <option value="Reviewer">Reviewer (Read, Verify, Export)</option>
                  <option value="Viewer">Viewer (Read Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={newUserDepartment}
                  onChange={(e) => setNewUserDepartment(e.target.value)}
                  placeholder="e.g. Credit Rating & Risk"
                  className="dox-input text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs font-semibold"
                >
                  Create Local Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
