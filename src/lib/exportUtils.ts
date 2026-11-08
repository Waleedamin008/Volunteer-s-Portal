import * as XLSX from 'xlsx';
import { Application } from '../types';

export const exportApplicationsToExcel = (
  applications: Application[],
  fileName = 'MAQAM-E-JOUD_Applications'
): void => {
  const exportData = applications.map((app) => {
    const answers = app.answers || {};
    return {
      'Ref Number': app.reference_number,
      'Full Name': app.full_name,
      'Status': app.status.replace('_', ' ').toUpperCase(),
      'Team': app.team_name || 'Assigned Team',
      'Phone': app.phone || answers['f_phone'] || '',
      'WhatsApp': answers['f_whatsapp'] || app.phone || '',
      'Email': app.email || answers['f_email'] || '',
      'City': answers['f_city'] || '',
      'Education': answers['f_education'] || '',
      'Institution/Occupation': answers['f_institution'] || '',
      'Skills': answers['f_skills'] || '',
      'Interests': Array.isArray(answers['f_interests'])
        ? answers['f_interests'].join(', ')
        : answers['f_interests'] || '',
      'Available Days': Array.isArray(answers['f_available_days'])
        ? answers['f_available_days'].join(', ')
        : answers['f_available_days'] || '',
      'Available Hours': answers['f_available_time'] || '',
      'Submitted Date': new Date(app.submitted_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Volunteers');

  // Adjust column widths
  const max_width = exportData.reduce((w, r) => Math.max(w, 20), 10);
  worksheet['!cols'] = Object.keys(exportData[0] || {}).map(() => ({ wch: max_width }));

  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportApplicationsToCSV = (
  applications: Application[],
  fileName = 'MAQAM-E-JOUD_Applications'
): void => {
  const exportData = applications.map((app) => {
    const answers = app.answers || {};
    return {
      'Ref Number': app.reference_number,
      'Full Name': app.full_name,
      'Status': app.status.replace('_', ' ').toUpperCase(),
      'Team': app.team_name || 'Assigned Team',
      'Phone': app.phone || answers['f_phone'] || '',
      'WhatsApp': answers['f_whatsapp'] || app.phone || '',
      'Email': app.email || answers['f_email'] || '',
      'City': answers['f_city'] || '',
      'Education': answers['f_education'] || '',
      'Institution/Occupation': answers['f_institution'] || '',
      'Skills': answers['f_skills'] || '',
      'Interests': Array.isArray(answers['f_interests'])
        ? answers['f_interests'].join('; ')
        : answers['f_interests'] || '',
      'Available Days': Array.isArray(answers['f_available_days'])
        ? answers['f_available_days'].join('; ')
        : answers['f_available_days'] || '',
      'Available Hours': answers['f_available_time'] || '',
      'Submitted Date': new Date(app.submitted_at).toLocaleDateString('en-US'),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
