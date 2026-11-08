import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Mail,
  FileDown,
  User,
  GraduationCap,
  Briefcase,
  Heart,
  FileText,
  History,
  Send,
  Trash2,
} from 'lucide-react';
import {
  Application,
  ApplicationStatus,
} from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { StorageService } from '../../lib/storage';
import { generateApplicantPDF } from '../../lib/pdfGenerator';
import { useAuth } from '../../context/AuthContext';

interface ApplicationDetailModalProps {
  applicationId: string;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  applicationId,
  onClose,
  onStatusUpdated,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notes' | 'history'>('profile');
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Load fresh application data
  const app = StorageService.getApplicationById(applicationId);
  const team = app ? StorageService.getTeamById(app.team_id) : undefined;
  const formConfig = app ? StorageService.getFormConfigByTeamId(app.team_id) : undefined;
  const notes = StorageService.getApplicationNotes(applicationId);
  const history = StorageService.getApplicationHistory(applicationId);

  if (!app) return null;

  const answers = app.answers || {};

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    const changerName = user?.full_name || 'Authorized Leader';
    StorageService.updateApplicationStatus(app.id, newStatus, changerName);
    if (onStatusUpdated) onStatusUpdated();
  };

  const handleDelete = () => {
    if (user?.role !== 'admin') return;

    if (
      !window.confirm(
        `Are you sure you want to permanently delete the application for "${app.full_name}" (${app.reference_number})?\n\nThis will remove the applicant's profile, answers, notes, and status history. This action cannot be undone.`
      )
    ) {
      return;
    }

    const res = StorageService.deleteApplication(
      app.id,
      user?.full_name || 'Foundation Administrator'
    );
    if (res.success) {
      onClose();
      if (onStatusUpdated) onStatusUpdated();
    } else {
      alert('Failed to delete application.');
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !user) return;
    setIsSubmittingNote(true);
    StorageService.addApplicationNote(
      app.id,
      user.id,
      `${user.full_name} (${user.role === 'admin' ? 'Admin' : 'Leader'})`,
      newNote.trim()
    );
    setNewNote('');
    setIsSubmittingNote(false);
    if (onStatusUpdated) onStatusUpdated();
  };

  const cleanPhone = (app.phone || (answers['f_phone'] as string) || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Assalamu Alaikum ${app.full_name}, this is ${user?.full_name || 'the team'} from MAQAM-E-JOUD Foundation regarding your volunteer application (Ref: ${app.reference_number}).`
      )}`
    : '#';

  const telUrl = app.phone ? `tel:${app.phone}` : '#';
  const mailUrl = app.email
    ? `mailto:${app.email}?subject=${encodeURIComponent(
        `MAQAM-E-JOUD Foundation — Volunteer Application ${app.reference_number}`
      )}`
    : '#';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 my-auto">
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-brand-navy text-white rounded-t-2xl gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold font-bold text-xs sm:text-sm shrink-0">
              {app.full_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate">
                  {app.full_name}
                </h2>
                <span className="text-[10px] sm:text-[11px] font-mono text-brand-lightGold bg-white/10 px-1.5 py-0.5 rounded shrink-0">
                  {app.reference_number}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 truncate">
                {team?.name || app.team_name} &bull; Submitted{' '}
                {new Date(app.submitted_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {user?.role === 'admin' && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                title="Permanently Delete Application"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline sm:inline">Delete</span>
              </button>
            )}

            <button
              onClick={() => generateApplicantPDF(app, team, formConfig)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 bg-brand-gold text-brand-navy rounded-lg text-xs font-semibold hover:bg-brand-lightGold transition-colors shadow-sm cursor-pointer"
              title="Download Official Dossier PDF"
            >
              <FileDown className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline sm:inline">PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action / Contact Strip */}
        <div className="bg-brand-warmIvory/30 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Status selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-brand-navy">Status:</span>
            <select
              value={app.status}
              onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
              className="text-xs font-semibold bg-white border border-gray-300 text-brand-navy rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-brand-gold focus:outline-none shadow-2xs cursor-pointer"
            >
              <option value="new">New</option>
              <option value="under_review">Under Review</option>
              <option value="contacted">Contacted</option>
              <option value="approved">Approved</option>
              <option value="on_hold">On Hold</option>
              <option value="rejected">Rejected</option>
            </select>
            <StatusBadge status={app.status} size="sm" />
          </div>

          {/* Contact Direct Actions */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {app.phone && (
              <a
                href={telUrl}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-brand-navy hover:border-brand-gold text-xs font-medium rounded-lg transition-colors shadow-2xs"
                title={`Call ${app.phone}`}
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Call</span>
              </a>
            )}

            {cleanPhone && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-medium rounded-lg transition-colors shadow-2xs"
                title="Open WhatsApp chat with prefilled message"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            )}

            {app.email && (
              <a
                href={mailUrl}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-brand-navy hover:border-brand-gold text-xs font-medium rounded-lg transition-colors shadow-2xs"
                title={`Email ${app.email}`}
              >
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                <span>Email</span>
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs (horizontally scrollable on mobile) */}
        <div className="flex border-b border-gray-100 px-3 sm:px-6 bg-white overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-brand-mutedGray hover:text-brand-navy'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'notes'
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-brand-mutedGray hover:text-brand-navy'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes ({notes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'history'
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-brand-mutedGray hover:text-brand-navy'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Section 1: Contact & Personal Info */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy border-b pb-1.5 border-brand-warmIvory mb-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Personal & Contact Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block">Full Name</span>
                    <span className="text-xs sm:text-sm font-semibold text-brand-navy">
                      {app.full_name}
                    </span>
                  </div>
                  <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block">Father's Name</span>
                    <span className="text-xs sm:text-sm font-semibold text-brand-navy">
                      {(answers['f_father_name'] as string) || '—'}
                    </span>
                  </div>
                  <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block">Gender</span>
                    <span className="text-xs sm:text-sm font-semibold text-brand-navy">
                      {(answers['f_gender'] as string) || '—'}
                    </span>
                  </div>
                  <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block">Phone</span>
                    <span className="text-xs sm:text-sm font-semibold text-brand-navy">
                      {app.phone || (answers['f_phone'] as string) || '—'}
                    </span>
                  </div>
                  <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block">WhatsApp</span>
                    <span className="text-xs sm:text-sm font-semibold text-brand-navy">
                      {(answers['f_whatsapp'] as string) || app.phone || '—'}
                    </span>
                  </div>
                  <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block">City of Residence</span>
                    <span className="text-xs sm:text-sm font-semibold text-brand-navy">
                      {(answers['f_city'] as string) || '—'}
                    </span>
                  </div>
                  <div className="sm:col-span-2 md:col-span-3 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block">Email Address</span>
                    <span className="text-xs sm:text-sm font-semibold text-brand-navy">
                      {app.email || (answers['f_email'] as string) || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Education & Skills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy border-b pb-1.5 border-brand-warmIvory mb-3 flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Education & Skills</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block">Qualification</span>
                    <span className="text-xs sm:text-sm font-semibold text-brand-navy">
                      {(answers['f_education'] as string) || '—'}
                    </span>
                  </div>
                  <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block">Institution / Occupation</span>
                    <span className="text-xs sm:text-sm font-semibold text-brand-navy">
                      {(answers['f_institution'] as string) || '—'}
                    </span>
                  </div>
                  <div className="sm:col-span-2 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block mb-1">Skills & Expertise</span>
                    <p className="text-xs sm:text-sm text-brand-charcoal whitespace-pre-line">
                      {(answers['f_skills'] as string) || '—'}
                    </p>
                  </div>
                  <div className="sm:col-span-2 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block mb-1">Areas of Interest</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Array.isArray(answers['f_interests']) ? (
                        answers['f_interests'].map((interest: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-brand-warmIvory/60 border border-brand-gold/30 text-brand-navy text-[11px] rounded-md font-medium"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs sm:text-sm text-brand-navy">
                          {(answers['f_interests'] as string) || '—'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Availability & Previous Experience */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy border-b pb-1.5 border-brand-warmIvory mb-3 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Availability & Experience</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block mb-1">Available Days</span>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(answers['f_available_days']) ? (
                        answers['f_available_days'].map((d: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] rounded-md"
                          >
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs sm:text-sm text-brand-navy">
                          {(answers['f_available_days'] as string) || '—'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block">Available Weekly Time</span>
                    <span className="text-xs sm:text-sm font-semibold text-brand-navy">
                      {(answers['f_available_time'] as string) || '—'}
                    </span>
                  </div>
                  <div className="sm:col-span-2 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block mb-1">
                      Previous Volunteer Experience
                    </span>
                    <p className="text-xs sm:text-sm text-brand-charcoal">
                      {(answers['f_volunteer_experience'] as string) || 'None mentioned.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Motivation */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy border-b pb-1.5 border-brand-warmIvory mb-3 flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Motivation to Join Foundation</span>
                </h4>
                <div className="bg-brand-warmIvory/20 border border-brand-gold/30 p-3.5 sm:p-4 rounded-xl">
                  <p className="text-xs sm:text-sm text-brand-charcoal italic leading-relaxed">
                    "{String(answers['f_motivation'] || 'No motivation provided.')}"
                  </p>
                </div>
                {answers['f_additional_info'] && (
                  <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-[11px] text-brand-mutedGray block mb-1">
                      Additional Information / Remarks:
                    </span>
                    <p className="text-xs sm:text-sm text-brand-charcoal">
                      {String(answers['f_additional_info'])}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="text-xs font-semibold text-brand-navy block">
                  Add Confidential Team Note / Follow-up Record:
                </label>
                <div className="relative">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="e.g. Spoke with applicant via phone on Monday. Enthusiastic, verified available on weekends..."
                    rows={3}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim() || isSubmittingNote}
                    className="mt-2 sm:mt-0 sm:absolute sm:right-2.5 sm:bottom-3.5 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand-navy text-white text-xs font-medium rounded-lg hover:bg-brand-darkNavy disabled:opacity-40 transition-colors w-full sm:w-auto cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              <div className="space-y-3 pt-3">
                {notes.length === 0 ? (
                  <div className="text-center py-8 text-brand-mutedGray text-xs bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No follow-up notes recorded yet for this applicant.
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-navy">
                          {note.author_name}
                        </span>
                        <span className="text-[10px] text-brand-mutedGray">
                          {new Date(note.created_at).toLocaleString('en-US', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-brand-charcoal whitespace-pre-line leading-relaxed">
                        {note.note}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <p className="text-xs text-brand-mutedGray mb-2">
                Audit trail of status modifications made by authorized team leaders and administrators.
              </p>
              {history.length === 0 ? (
                <div className="text-center py-8 text-brand-mutedGray text-xs bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No status modifications recorded yet. (Initial status: New)
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-gold/30">
                  {history.map((h) => (
                    <div key={h.id} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-gold border-2 border-white shadow-xs" />
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-brand-mutedGray line-through">
                              {h.old_status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-xs font-bold text-brand-navy">&rarr;</span>
                            <StatusBadge status={h.new_status} size="sm" />
                          </div>
                          <span className="text-[10px] text-brand-mutedGray">
                            {new Date(h.changed_at).toLocaleString('en-US', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-brand-mutedGray mt-1">
                          Updated by <strong className="text-brand-navy">{h.changed_by_name}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between rounded-b-2xl">
          <span className="text-[10px] sm:text-[11px] text-brand-mutedGray truncate max-w-[200px] sm:max-w-none">
            MAQAM-E-JOUD Foundation
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-brand-navy hover:bg-gray-200 bg-white border border-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
