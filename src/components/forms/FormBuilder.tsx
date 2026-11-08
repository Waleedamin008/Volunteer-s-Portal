import React, { useState } from 'react';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Edit2,
  Eye,
  Settings,
  Sparkles,
  Smartphone,
  Monitor,
  CheckCircle2,
  Save,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { FormConfig, FormField } from '../../types';
import { StorageService } from '../../lib/storage';
import { FieldEditorModal } from './FieldEditorModal';
import { DynamicFormRenderer } from './DynamicFormRenderer';

interface FormBuilderProps {
  teamId: string;
  onSaved?: () => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ teamId, onSaved }) => {
  const team = StorageService.getTeamById(teamId);
  const initialConfig =
    StorageService.getFormConfigByTeamId(teamId) ||
    (team ? StorageService.createInitialFormForTeam(team) : null);

  const [config, setConfig] = useState<FormConfig>(
    initialConfig || {
      id: `form_cfg_${teamId}`,
      team_id: teamId,
      title: 'Volunteer Application',
      description: '',
      slug: team?.slug || 'team',
      status: 'draft',
      published_version: 1,
      fields: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  );

  const [activeTab, setActiveTab] = useState<'fields' | 'settings' | 'preview'>('fields');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleFieldMove = (index: number, direction: 'up' | 'down') => {
    const fields = [...config.fields];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;

    const temp = fields[index];
    fields[index] = fields[targetIdx];
    fields[targetIdx] = temp;

    // re-index orders
    fields.forEach((f, idx) => {
      f.order = idx + 1;
    });

    setConfig({ ...config, fields });
    StorageService.saveFormConfig({ ...config, fields });
  };

  const handleDuplicateField = (field: FormField) => {
    const newField: FormField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: `${field.label} (Copy)`,
      order: config.fields.length + 1,
    };
    const updatedFields = [...config.fields, newField];
    setConfig({ ...config, fields: updatedFields });
    StorageService.saveFormConfig({ ...config, fields: updatedFields });
  };

  const handleRemoveField = (fieldId: string) => {
    if (window.confirm('Remove this field from the form template? (Past submissions will retain this answer)')) {
      const updatedFields = config.fields.filter((f) => f.id !== fieldId);
      setConfig({ ...config, fields: updatedFields });
      StorageService.saveFormConfig({ ...config, fields: updatedFields });
    }
  };

  const handleSaveField = (savedField: FormField) => {
    let updatedFields: FormField[];
    const exists = config.fields.some((f) => f.id === savedField.id);

    if (exists) {
      updatedFields = config.fields.map((f) => (f.id === savedField.id ? savedField : f));
    } else {
      updatedFields = [...config.fields, { ...savedField, order: config.fields.length + 1 }];
    }

    setConfig({ ...config, fields: updatedFields });
    StorageService.saveFormConfig({ ...config, fields: updatedFields });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveFormConfig(config);
    setSaveSuccessMsg('Form settings saved successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
    if (onSaved) onSaved();
  };

  const handlePublishNewVersion = () => {
    if (
      window.confirm(
        `Publishing this will make Version ${(config.published_version || 0) + 1} live for public applicants. All historical applications will preserve their original form version. Continue?`
      )
    ) {
      const res = StorageService.publishFormConfig(config.id);
      setConfig(res.config);
      setSaveSuccessMsg(`Published Version ${res.config.published_version} is now active!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
      if (onSaved) onSaved();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-brand-navy">{config.title}</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-brand-warmIvory text-brand-navy border border-brand-gold/30">
              Version {config.published_version || 1}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                config.status === 'published'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {config.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-brand-mutedGray mt-1">
            Dynamic Joining Form for <strong>{team?.name || 'Recruitment Team'}</strong> &bull; Public Link:{' '}
            <code className="text-brand-navy bg-gray-100 px-1 py-0.5 rounded">/join/{team?.slug}</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePublishNewVersion}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-xs font-bold rounded-xl hover:bg-brand-darkNavy transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span>Publish New Version</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4">
        <button
          onClick={() => setActiveTab('fields')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'fields'
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-brand-mutedGray hover:text-brand-navy'
          }`}
        >
          <span>Field Editor ({config.fields.length} fields)</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-brand-mutedGray hover:text-brand-navy'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Form Settings & Messaging</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-brand-mutedGray hover:text-brand-navy'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Form Preview</span>
        </button>
      </div>

      {/* Tab 1: Field Editor */}
      {activeTab === 'fields' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-brand-mutedGray">
              Customize the volunteer application questions. Reorder using arrow buttons, edit properties, or add new dynamic fields.
            </p>
            <button
              onClick={() => {
                setEditingField(null);
                setIsFieldModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold text-brand-navy text-xs font-semibold rounded-lg hover:bg-brand-lightGold transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Field</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {config.fields.map((field, idx) => (
              <div
                key={field.id}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs hover:border-brand-gold/50 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-brand-warmIvory/60 text-brand-navy font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-brand-navy">
                        {field.label}
                      </span>
                      {field.required && (
                        <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-medium">
                          Required
                        </span>
                      )}
                      <span className="text-[10px] text-brand-mutedGray bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                        {field.type.replace('_', ' ')}
                      </span>
                    </div>
                    {field.description && (
                      <p className="text-[11px] text-brand-mutedGray truncate max-w-md mt-0.5">
                        {field.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleFieldMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-gray-400 hover:text-brand-navy disabled:opacity-20"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFieldMove(idx, 'down')}
                    disabled={idx === config.fields.length - 1}
                    className="p-1.5 text-gray-400 hover:text-brand-navy disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicateField(field)}
                    className="p-1.5 text-gray-400 hover:text-brand-navy"
                    title="Duplicate Field"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingField(field);
                      setIsFieldModalOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600"
                    title="Edit Field Properties"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveField(field.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600"
                    title="Remove Field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Settings */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4 max-w-2xl"
        >
          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Form Title
            </label>
            <input
              type="text"
              required
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Form Description
            </label>
            <textarea
              rows={2}
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Welcome Greeting Message
            </label>
            <textarea
              rows={2}
              value={config.welcome_message || ''}
              onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-brand-navy block mb-1">
                Submit Button Label
              </label>
              <input
                type="text"
                value={config.submit_button_text || ''}
                onChange={(e) => setConfig({ ...config, submit_button_text: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-navy block mb-1">
                Form Status
              </label>
              <select
                value={config.status}
                onChange={(e) => setConfig({ ...config, status: e.target.value as any })}
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none bg-white font-medium text-brand-navy"
              >
                <option value="published">Published (Open for Submissions)</option>
                <option value="draft">Draft (Testing only)</option>
                <option value="unpublished">Unpublished (Closed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Success / Confirmation Message
            </label>
            <textarea
              rows={2}
              value={config.success_message || ''}
              onChange={(e) => setConfig({ ...config, success_message: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-darkNavy rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Live Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
            <p className="text-xs text-brand-mutedGray">
              Live interactive preview showing exactly how prospective volunteers experience this form.
            </p>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  previewDevice === 'desktop'
                    ? 'bg-white text-brand-navy shadow-xs font-semibold'
                    : 'text-gray-500 hover:text-brand-navy'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  previewDevice === 'mobile'
                    ? 'bg-white text-brand-navy shadow-xs font-semibold'
                    : 'text-gray-500 hover:text-brand-navy'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center py-4 bg-gray-100/60 rounded-2xl border border-gray-200/80 p-4">
            <div
              className={`bg-white rounded-2xl shadow-xl border border-gray-200 transition-all p-6 sm:p-8 ${
                previewDevice === 'mobile'
                  ? 'w-[380px] max-w-full rounded-[36px] border-[10px] border-gray-800'
                  : 'w-full max-w-2xl'
              }`}
            >
              <DynamicFormRenderer
                formConfig={config}
                teamName={team?.name}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Field Editor Modal */}
      {isFieldModalOpen && (
        <FieldEditorModal
          isOpen={isFieldModalOpen}
          field={editingField}
          onClose={() => {
            setIsFieldModalOpen(false);
            setEditingField(null);
          }}
          onSave={handleSaveField}
        />
      )}
    </div>
  );
};
