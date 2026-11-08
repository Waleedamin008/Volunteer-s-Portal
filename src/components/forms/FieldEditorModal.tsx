import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { FormField, FormFieldType } from '../../types';

interface FieldEditorModalProps {
  isOpen: boolean;
  field?: FormField | null;
  onClose: () => void;
  onSave: (field: FormField) => void;
}

const FIELD_TYPES: { type: FormFieldType; label: string; desc: string }[] = [
  { type: 'short_text', label: 'Short Text', desc: 'Single-line input for names, titles, designations' },
  { type: 'long_text', label: 'Long Text / Paragraph', desc: 'Multi-line text area for motivations, answers' },
  { type: 'email', label: 'Email Address', desc: 'Validated email input' },
  { type: 'phone', label: 'Phone Number', desc: 'Contact number format' },
  { type: 'number', label: 'Number', desc: 'Numeric values such as age or hours' },
  { type: 'dropdown', label: 'Dropdown Select', desc: 'Choose one option from a list' },
  { type: 'radio', label: 'Radio Buttons', desc: 'Single-choice selection with radio buttons' },
  { type: 'multiple_choice', label: 'Multiple Choice Checkboxes', desc: 'Select one or more options' },
  { type: 'checkbox', label: 'Single Consent Checkbox', desc: 'Yes/No consent or declaration' },
  { type: 'date', label: 'Date', desc: 'Calendar date picker' },
  { type: 'file_upload', label: 'File Upload', desc: 'Document, CV, or photograph upload' },
];

export const FieldEditorModal: React.FC<FieldEditorModalProps> = ({
  isOpen,
  field,
  onClose,
  onSave,
}) => {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [type, setType] = useState<FormFieldType>('short_text');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [newOption, setNewOption] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (field) {
      setLabel(field.label);
      setDescription(field.description || '');
      setPlaceholder(field.placeholder || '');
      setType(field.type);
      setRequired(field.required);
      setOptions(field.options && field.options.length > 0 ? [...field.options] : ['Option 1', 'Option 2']);
    } else {
      setLabel('');
      setDescription('');
      setPlaceholder('');
      setType('short_text');
      setRequired(false);
      setOptions(['Option 1', 'Option 2']);
    }
    setError('');
  }, [field, isOpen]);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    setOptions([...options, newOption.trim()]);
    setNewOption('');
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!label.trim()) {
      setError('Please provide a field label.');
      return;
    }

    const needsOptions = ['dropdown', 'radio', 'multiple_choice'].includes(type);
    if (needsOptions && options.filter((o) => o.trim()).length < 2) {
      setError('Choice fields require at least 2 non-empty options.');
      return;
    }

    const savedField: FormField = {
      id: field?.id || `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: label.trim(),
      description: description.trim() || undefined,
      placeholder: placeholder.trim() || undefined,
      type,
      required,
      order: field?.order || 999,
      options: needsOptions ? options.filter((o) => o.trim()) : undefined,
    };

    onSave(savedField);
    onClose();
  };

  const showOptionsList = ['dropdown', 'radio', 'multiple_choice'].includes(type);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-brand-navy">
            {field ? 'Edit Form Field' : 'Add New Form Field'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Field Label */}
          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Field Label <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Current City or CNIC Number"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>

          {/* Field Type */}
          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Field Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FormFieldType)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none bg-white font-medium text-brand-navy"
            >
              {FIELD_TYPES.map((ft) => (
                <option key={ft.type} value={ft.type}>
                  {ft.label} — {ft.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Required Checkbox */}
          <div className="flex items-center gap-2.5 py-1">
            <input
              type="checkbox"
              id="field-required-chk"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 text-brand-navy rounded focus:ring-brand-gold border-gray-300 cursor-pointer"
            />
            <label htmlFor="field-required-chk" className="text-xs font-medium text-brand-navy cursor-pointer">
              Mark this field as mandatory / required
            </label>
          </div>

          {/* Placeholder */}
          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Placeholder Hint
            </label>
            <input
              type="text"
              placeholder="e.g. Enter details here..."
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>

          {/* Helper Description */}
          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Help Text / Guidance (Optional)
            </label>
            <input
              type="text"
              placeholder="Short instruction shown beneath the field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>

          {/* Options Manager (for choice types) */}
          {showOptionsList && (
            <div className="pt-2 border-t border-gray-100">
              <label className="text-xs font-semibold text-brand-navy block mb-1.5">
                Choice Options:
              </label>
              <div className="space-y-2 mb-3">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-400 w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="flex-1 text-xs p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      disabled={options.length <= 2}
                      className="text-gray-400 hover:text-rose-500 disabled:opacity-20 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Option */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type new option and click add..."
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  className="flex-1 text-xs p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-brand-navy text-xs font-medium rounded-md flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-darkNavy rounded-lg shadow-sm transition-colors"
            >
              Save Field
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

