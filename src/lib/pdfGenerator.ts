import jsPDF from 'jspdf';
import { Application, FormConfig, Team } from '../types';

export const generateApplicantPDF = (
  app: Application,
  team?: Team,
  formConfig?: FormConfig
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  // Helper colors
  const NAVY = [0, 24, 48]; // #001830
  const DARK_NAVY = [0, 16, 40]; // #001028
  const GOLD = [208, 168, 96]; // #D0A860
  const LIGHT_GOLD = [235, 215, 175];
  const CHARCOAL = [37, 37, 37]; // #252525
  const MUTED_GRAY = [119, 119, 119];
  const IVORY_BG = [250, 247, 242]; // #FAF7F2

  // 1. Header Banner
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Decorative Gold Strip
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.rect(0, 38, pageWidth, 2.5, 'F');

  // Foundation Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MAQAM-E-JOUD FOUNDATION', margin + 14, 16);

  // Urdu Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(LIGHT_GOLD[0], LIGHT_GOLD[1], LIGHT_GOLD[2]);
  doc.text('VOLUNTEER MANAGEMENT SYSTEM  |  OFFICIAL APPLICANT DOSSIER', margin + 14, 23);

  // Reference Code Box on right
  doc.setFillColor(DARK_NAVY[0], DARK_NAVY[1], DARK_NAVY[2]);
  doc.roundedRect(pageWidth - margin - 58, 8, 58, 22, 2, 2, 'F');
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth - margin - 58, 8, 58, 22, 2, 2, 'D');

  doc.setFontSize(7.5);
  doc.setTextColor(LIGHT_GOLD[0], LIGHT_GOLD[1], LIGHT_GOLD[2]);
  doc.text('REFERENCE NUMBER', pageWidth - margin - 53, 14);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(app.reference_number, pageWidth - margin - 53, 22);

  // Left side icon / emblem placeholder circle
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.circle(margin + 5, 19, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('MJ', margin + 2.5, 22.5);

  y = 48;

  // Applicant Title & Status Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(app.full_name, margin, y);

  // Status Badge on right
  const statusLabel = app.status.replace('_', ' ').toUpperCase();
  const statusWidth = doc.getTextWidth(statusLabel) + 12;
  const statusX = pageWidth - margin - statusWidth;
  doc.setFillColor(IVORY_BG[0], IVORY_BG[1], IVORY_BG[2]);
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(statusX, y - 6, statusWidth, 8, 1.5, 1.5, 'FD');
  doc.setFontSize(8.5);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(statusLabel, statusX + 6, y - 0.5);

  y += 7;

  // Team & Submission Subheader
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(MUTED_GRAY[0], MUTED_GRAY[1], MUTED_GRAY[2]);
  const teamNameStr = team?.name || app.team_name || 'Volunteer Team';
  const submitDateStr = new Date(app.submitted_at).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Assigned Team: ${teamNameStr}    |    Submitted: ${submitDateStr}`, margin, y);

  y += 9;

  // Helper Section Renderer
  const renderSectionHeader = (title: string) => {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(IVORY_BG[0], IVORY_BG[1], IVORY_BG[2]);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.rect(margin, y, 2.5, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(title.toUpperCase(), margin + 5, y + 5);
    y += 11;
  };

  const renderFieldRow = (label: string, val: string | string[], halfWidth = false, offsetX = 0) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    const currentX = margin + offsetX;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(MUTED_GRAY[0], MUTED_GRAY[1], MUTED_GRAY[2]);
    doc.text(label.toUpperCase(), currentX, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

    const displayVal = Array.isArray(val) ? val.join(', ') : val || '—';
    const splitText = doc.splitTextToSize(displayVal, halfWidth ? contentWidth / 2 - 5 : contentWidth);
    doc.text(splitText, currentX, y + 4.5);

    return splitText.length * 4.5;
  };

  // Section 1: Contact & Personal Overview
  renderSectionHeader('1. Contact & Personal Details');
  const answers = app.answers || {};

  // Row 1: Phone & WhatsApp
  const phoneVal = app.phone || (answers['f_phone'] as string) || '—';
  const waVal = (answers['f_whatsapp'] as string) || phoneVal || '—';
  renderFieldRow('Phone Number', phoneVal, true, 0);
  renderFieldRow('WhatsApp Number', waVal, true, contentWidth / 2);
  y += 11;

  // Row 2: Email & City
  const emailVal = app.email || (answers['f_email'] as string) || '—';
  const cityVal = (answers['f_city'] as string) || '—';
  renderFieldRow('Email Address', emailVal, true, 0);
  renderFieldRow('City of Residence', cityVal, true, contentWidth / 2);
  y += 11;

  // Row 3: Father's Name & Gender
  const fatherVal = (answers['f_father_name'] as string) || '—';
  const genderVal = (answers['f_gender'] as string) || '—';
  renderFieldRow("Father's Name", fatherVal, true, 0);
  renderFieldRow('Gender', genderVal, true, contentWidth / 2);
  y += 13;

  // Section 2: Education & Professional Profile
  renderSectionHeader('2. Education & Professional Profile');
  const eduVal = (answers['f_education'] as string) || '—';
  const instVal = (answers['f_institution'] as string) || '—';
  renderFieldRow('Highest Qualification', eduVal, true, 0);
  renderFieldRow('Current Institution / Occupation', instVal, true, contentWidth / 2);
  y += 11;

  const skillsVal = (answers['f_skills'] as string) || '—';
  const skillsHeight = renderFieldRow('Skills and Core Competencies', skillsVal);
  y += skillsHeight + 6;

  const interestsVal = (answers['f_interests'] as string[]) || '—';
  const interestsHeight = renderFieldRow('Areas of Interest in Foundation', interestsVal);
  y += interestsHeight + 8;

  // Section 3: Availability & Commitment
  renderSectionHeader('3. Availability & Volunteer Engagement');
  const daysVal = (answers['f_available_days'] as string[]) || '—';
  const timeVal = (answers['f_available_time'] as string) || '—';
  renderFieldRow('Available Days', daysVal, true, 0);
  renderFieldRow('Available Weekly Hours', timeVal, true, contentWidth / 2);
  y += 12;

  const expVal = (answers['f_volunteer_experience'] as string) || 'None mentioned';
  const expHeight = renderFieldRow('Previous Volunteer Experience', expVal);
  y += expHeight + 8;

  // Section 4: Motivation & Vision
  renderSectionHeader('4. Motivation to Join MAQAM-E-JOUD Foundation');
  const motVal =
    (answers['f_motivation'] as string) ||
    'Applicant expressed willingness to serve through voluntary action and community dedication.';
  const motHeight = renderFieldRow('Personal Intention / Statement', motVal);
  y += motHeight + 8;

  if (answers['f_additional_info']) {
    const addVal = answers['f_additional_info'] as string;
    const addHeight = renderFieldRow('Additional Remarks / Notes from Applicant', addVal);
    y += addHeight + 8;
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(MUTED_GRAY[0], MUTED_GRAY[1], MUTED_GRAY[2]);
    doc.text(
      'MAQAM-E-JOUD Foundation  |  Confidential Internal Record  |  Generated on ' +
        new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      margin,
      pageHeight - 7
    );

    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 7);
  }

  // Save the PDF
  const safeName = app.full_name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${app.reference_number}_${safeName}_Dossier.pdf`);
};
