import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileDown,
  Phone,
  MessageSquare,
  Eye,
  ArrowUpDown,
  FileSpreadsheet,
  FileText as FileTextIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Application, ApplicationStatus, Team } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { generateApplicantPDF } from '../../lib/pdfGenerator';
import { exportApplicationsToExcel, exportApplicationsToCSV } from '../../lib/exportUtils';
import { EmptyState } from '../common/EmptyState';
import { StorageService } from '../../lib/storage';

interface ApplicationTableProps {
  applications: Application[];
  teams?: Team[];
  showTeamColumn?: boolean;
  onRefresh?: () => void;
  title?: string;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  teams = [],
  showTeamColumn = true,
  onRefresh,
  title = 'Volunteer Applications',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter & Sort
  const filtered = applications.filter((app) => {
    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = app.full_name.toLowerCase().includes(q);
      const matchPhone = app.phone.toLowerCase().includes(q);
      const matchEmail = app.email.toLowerCase().includes(q);
      const matchRef = app.reference_number.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchRef) return false;
    }

    // Status
    if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }

    // Team
    if (teamFilter !== 'all' && app.team_id !== teamFilter) {
      return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    return sortOrder === 'desc' ? diff : -diff;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-brand-mutedGray absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, email, or reference ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg text-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
          />
        </div>

        {/* Filters & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-brand-mutedGray" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-brand-navy font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses ({applications.length})</option>
              <option value="new">New</option>
              <option value="under_review">Under Review</option>
              <option value="contacted">Contacted</option>
              <option value="approved">Approved</option>
              <option value="on_hold">On Hold</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Team Filter (if multiple teams) */}
          {showTeamColumn && teams.length > 0 && (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
              <select
                value={teamFilter}
                onChange={(e) => {
                  setTeamFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-brand-navy font-medium focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="all">All Teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            title="Toggle newest / oldest first"
            className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-brand-mutedGray hover:text-brand-navy hover:bg-gray-100 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>

          {/* Excel Export */}
          <button
            onClick={() => exportApplicationsToExcel(filtered, 'MAQAM_E_JOUD_Volunteers')}
            title="Export filtered list to Excel (.xlsx)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={() => exportApplicationsToCSV(filtered, 'MAQAM_E_JOUD_Volunteers')}
            title="Export filtered list to CSV"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-navy bg-brand-warmIvory/50 border border-brand-gold/30 hover:bg-brand-warmIvory rounded-lg transition-colors shadow-2xs"
          >
            <FileTextIcon className="w-3.5 h-3.5 text-brand-gold" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Applications Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState
            title="No applications found"
            description={
              searchTerm || statusFilter !== 'all' || teamFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'No volunteer applications have been submitted yet.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-brand-navy text-white text-[11px] font-semibold tracking-wider uppercase border-b border-brand-darkNavy">
                  <th className="py-3 px-4">Applicant & Ref</th>
                  <th className="py-3 px-4">Contact</th>
                  {showTeamColumn && <th className="py-3 px-4">Assigned Team</th>}
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-brand-charcoal">
                {paginated.map((app) => {
                  const answers = app.answers || {};
                  const team = StorageService.getTeamById(app.team_id);
                  const cleanPhone = (app.phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      className="hover:bg-brand-warmIvory/15 cursor-pointer transition-colors"
                    >
                      {/* Name & Reference */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-navy/10 text-brand-navy font-bold flex items-center justify-center text-xs shrink-0">
                            {app.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-brand-navy leading-tight hover:text-brand-gold">
                              {app.full_name}
                            </p>
                            <span className="text-[11px] font-mono text-brand-mutedGray">
                              {app.reference_number}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-brand-charcoal font-medium">
                              {app.phone || '—'}
                            </span>
                            {cleanPhone && (
                              <div className="flex items-center gap-1">
                                <a
                                  href={`tel:${app.phone}`}
                                  className="text-gray-400 hover:text-blue-600"
                                  title="Call"
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-gray-400 hover:text-emerald-600"
                                  title="WhatsApp"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-brand-mutedGray truncate max-w-[160px]">
                            {app.email || '—'}
                          </p>
                        </div>
                      </td>

                      {/* Team */}
                      {showTeamColumn && (
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-brand-navy font-medium text-xs">
                            {team?.name || app.team_name}
                          </span>
                        </td>
                      )}

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-brand-mutedGray text-xs">
                        {new Date(app.submitted_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} size="sm" />
                        {app.notes_count && app.notes_count > 0 ? (
                          <span className="ml-1 text-[10px] text-brand-mutedGray">
                            ({app.notes_count} note{app.notes_count > 1 ? 's' : ''})
                          </span>
                        ) : null}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAppId(app.id)}
                            className="p-1.5 text-brand-navy hover:bg-brand-navy/10 rounded-md transition-colors"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const formCfg = StorageService.getFormConfigByTeamId(app.team_id);
                              generateApplicantPDF(app, team, formCfg);
                            }}
                            className="p-1.5 text-brand-gold hover:bg-brand-gold/15 rounded-md transition-colors"
                            title="Download PDF Dossier"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {sorted.length > pageSize && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-brand-mutedGray">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length} applications
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-medium text-brand-navy">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Profile View */}
      {selectedAppId && (
        <ApplicationDetailModal
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onStatusUpdated={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
};
