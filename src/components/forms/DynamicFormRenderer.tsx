import React, { useState } from 'react';
import { FormField, FormConfig } from '../../types';
import { Upload, Check, AlertCircle, Send } from 'lucide-react';
import { Logo } from '../brand/Logo';

interface DynamicFormRendererProps {
  formConfig: FormConfig;
  teamName?: string;
  isPreview?: boolean;
  onSubmit?: (values: Record<string, any>) => void;
  isSubmitting?: boolean;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  formConfig,
  teamName = 'Volunteer Team',
  isPreview = false,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadFileNames, setUploadFileNames] = useState<Record<string, string>>({});

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleCheckboxMultiChange = (fieldId: string, option: string, checked: boolean) => {
    const current = (formData[fieldId] as string[]) || [];
    let updated: string[];
    if (checked) {
      updated = [...current, option];
    } else {
      updated = current.filter((item) => item !== option);
    }
    handleInputChange(fieldId, updated);
  };

  const handleFileChange = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileNames((prev) => ({ ...prev, [fieldId]: file.name }));
      handleInputChange(fieldId, file.name);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    formConfig.fields.forEach((f) => {
      if (f.required) {
        const val = formData[f.id];
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0) ||
          (f.type === 'checkbox' && !val)
        ) {
          newErrors[f.id] = `${f.label} is required.`;
        }
      }
      if (f.type === 'email' && formData[f.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(formData[f.id]))) {
          newErrors[f.id] = 'Please provide a valid email address.';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      alert('This is a live preview simulation. All validations passed!');
      return;
    }
    if (validate() && onSubmit) {
      onSubmit(formData);
    }
  };

  const sortedFields = [...formConfig.fields].sort((a, b) => a.order - b.order);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="text-center pb-6 border-b border-brand-warmIvory/80">
        <div className="flex justify-center mb-4">
          <Logo size="lg" variant="emblem" theme="light" />
        </div>
        <span className="font-urdu text-xl text-brand-gold font-bold block mb-1">
          مقامِ جود فاؤنڈیشن
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-brand-navy tracking-tight">
          {formConfig.title}
        </h2>
        <span className="inline-block mt-2 px-3 py-1 rounded-full bg-brand-warmIvory/60 border border-brand-gold/30 text-xs font-semibold text-brand-navy">
          {teamName}
        </span>
        {formConfig.description && (
          <p className="mt-3 text-xs sm:text-sm text-brand-mutedGray max-w-xl mx-auto leading-relaxed">
            {formConfig.description}
          </p>
        )}
      </div>

      {/* Welcome Message Card */}
      {formConfig.welcome_message && (
        <div className="p-4 rounded-xl bg-brand-warmIvory/40 border border-brand-gold/30 text-brand-charcoal text-xs sm:text-sm leading-relaxed">
          <p className="font-medium">{formConfig.welcome_message}</p>
        </div>
      )}

      {/* Form Fields List */}
      <div className="space-y-5">
        {sortedFields.map((field) => {
          const fieldError = errors[field.id];
          const val = formData[field.id];

          return (
            <div
              key={field.id}
              className={`p-3.5 rounded-xl border transition-all ${
                fieldError
                  ? 'border-rose-300 bg-rose-50/30'
                  : 'border-gray-200/90 bg-white hover:border-gray-300 shadow-2xs'
              }`}
            >
              <label className="text-xs sm:text-sm font-semibold text-brand-navy block mb-1">
                {field.label}{' '}
                {field.required && <span className="text-rose-500 font-bold">*</span>}
              </label>

              {field.description && (
                <p className="text-[11px] text-brand-mutedGray mb-2">{field.description}</p>
              )}

              {/* Render by Field Type */}
              {field.type === 'short_text' && (
                <input
                  type="text"
                  placeholder={field.placeholder || 'Enter text...'}
                  value={val || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold/60 focus:outline-none bg-gray-50/50 focus:bg-white"
                />
              )}

              {field.type === 'long_text' && (
                <textarea
                  rows={3}
                  placeholder={field.placeholder || 'Enter your response...'}
                  value={val || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold/60 focus:outline-none bg-gray-50/50 focus:bg-white"
                />
              )}

              {field.type === 'email' && (
                <input
                  type="email"
                  placeholder={field.placeholder || 'name@example.com'}
                  value={val || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold/60 focus:outline-none bg-gray-50/50 focus:bg-white"
                />
              )}

              {field.type === 'phone' && (
                <input
                  type="tel"
                  placeholder={field.placeholder || '+92 300 1234567'}
                  value={val || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold/60 focus:outline-none bg-gray-50/50 focus:bg-white"
                />
              )}

              {field.type === 'number' && (
                <input
                  type="number"
                  placeholder={field.placeholder || '0'}
                  value={val || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold/60 focus:outline-none bg-gray-50/50 focus:bg-white"
                />
              )}

              {field.type === 'date' && (
                <input
                  type="date"
                  value={val || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold/60 focus:outline-none bg-gray-50/50 focus:bg-white"
                />
              )}

              {field.type === 'dropdown' && (
                <select
                  value={val || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold/60 focus:outline-none bg-white font-medium text-brand-navy"
                >
                  <option value="">-- Please Select an Option --</option>
                  {field.options?.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {field.type === 'radio' && (
                <div className="space-y-2 mt-1">
                  {field.options?.map((opt, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2.5 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer text-xs sm:text-sm text-brand-charcoal"
                    >
                      <input
                        type="radio"
                        name={field.id}
                        value={opt}
                        checked={val === opt}
                        onChange={() => handleInputChange(field.id, opt)}
                        className="w-4 h-4 text-brand-navy focus:ring-brand-gold border-gray-300"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === 'multiple_choice' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {field.options?.map((opt, i) => {
                    const isChecked = Array.isArray(val) && val.includes(opt);
                    return (
                      <label
                        key={i}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer text-xs sm:text-sm ${
                          isChecked
                            ? 'border-brand-gold bg-brand-warmIvory/30 text-brand-navy font-medium'
                            : 'border-gray-100 hover:bg-gray-50 text-brand-charcoal'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            handleCheckboxMultiChange(field.id, opt, e.target.checked)
                          }
                          className="w-4 h-4 rounded text-brand-navy focus:ring-brand-gold border-gray-300"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {field.type === 'checkbox' && (
                <label className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs sm:text-sm text-brand-charcoal">
                  <input
                    type="checkbox"
                    checked={Boolean(val)}
                    onChange={(e) => handleInputChange(field.id, e.target.checked)}
                    className="w-4 h-4 rounded text-brand-navy focus:ring-brand-gold border-gray-300"
                  />
                  <span>{field.placeholder || 'I confirm and agree to this statement'}</span>
                </label>
              )}

              {field.type === 'file_upload' && (
                <div className="mt-1">
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 hover:border-brand-gold rounded-xl cursor-pointer bg-gray-50/50 hover:bg-brand-warmIvory/10 transition-colors">
                    <Upload className="w-6 h-6 text-brand-gold mb-1.5" />
                    <span className="text-xs font-semibold text-brand-navy">
                      {uploadFileNames[field.id] || 'Click to select or drop file here'}
                    </span>
                    <span className="text-[10px] text-brand-mutedGray mt-0.5">
                      PDF, JPG, PNG or DOCX (Max 10MB)
                    </span>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(field.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Field Validation Error */}
              {fieldError && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{fieldError}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Submission Actions */}
      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-brand-navy hover:bg-brand-darkNavy transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>Submitting Application...</span>
          ) : (
            <>
              <Send className="w-4 h-4 text-brand-gold" />
              <span>{formConfig.submit_button_text || 'Submit Volunteer Application'}</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-brand-mutedGray mt-3">
          MAQAM-E-JOUD Foundation &bull; By submitting this form, you commit to upholding the values and dignity of our humanitarian service.
        </p>
      </div>
    </form>
  );
};
