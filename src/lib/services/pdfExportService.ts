import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UserPerformanceSummary } from "./analyticsEngine";
import { AppDatabase } from "../store/storage";

export function exportPerformanceReportPDF(summary: UserPerformanceSummary, db: AppDatabase): void {
  const doc = new jsPDF();

  const charcoalDark = [14, 18, 27] as [number, number, number];
  const goldAccent = [197, 160, 89] as [number, number, number];
  const softSilver = [148, 163, 184] as [number, number, number];

  // Header Banner
  doc.setFillColor(...charcoalDark);
  doc.rect(0, 0, 210, 42, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...goldAccent);
  doc.text("SAP LABS — MISSION 2027", 14, 16);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...softSilver);
  doc.text("OFFICIAL CANDIDATE PREPARATION & SYLLABUS AUDIT REPORT", 14, 23);
  doc.text(`Candidate: ${summary.userName.toUpperCase()}  |  Generated: ${new Date().toLocaleDateString()}`, 14, 29);
  doc.text("Target Deadline: 1 July 2027  |  Placement: SAP Labs India", 14, 35);

  const startY = 50;

  // Key KPI Cards Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("1. Overall Preparation Summary", 14, startY);

  autoTable(doc, {
    startY: startY + 4,
    head: [["Metric", "Value", "Status"]],
    body: [
      ["Overall Syllabus Progress", `${summary.overallProgressPercent}%`, `${summary.topicsMastered} Completed / ${summary.topicsTotal} Total`],
      ["Topics Currently In Study", `${summary.topicsInProgress} Topics`, "In Active Revision Sequence"],
      ["Pending Topics", `${summary.topicsPending} Topics`, "Scheduled in Roadmap"],
      ["LeetCode Problems Solved", `${summary.leetcodeTotal} Solved (${summary.leetcodeMedium} Med, ${summary.leetcodeHard} Hard)`, `${summary.activeStreakDays} Day Streak`],
      ["Daily Task Completion Rate", `${summary.taskCompletionRate}%`, `${summary.dailyTasksCompleted} / ${summary.dailyTasksTotal} Tasks Done`],
    ],
    theme: "striped",
    headStyles: { fillColor: charcoalDark, textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
  });

  const nextY1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  // Subject-wise Breakdown Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("2. 17 Subjects Breakdown & 5-Stage Completion", 14, nextY1);

  const subjectRows = summary.subjectBreakdown.map((s) => [
    s.subjectCode,
    s.subjectName,
    `${s.totalTopics} Topics`,
    `${s.completedStages} / ${s.maxStages} Stages`,
    `${s.percent}%`,
  ]);

  autoTable(doc, {
    startY: nextY1 + 4,
    head: [["Code", "Subject Name", "Topic Count", "Stages Passed", "Mastery %"]],
    body: subjectRows,
    theme: "striped",
    headStyles: { fillColor: charcoalDark, textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("Confidential — SAP Labs Mission 2027: Anuraj × Soumyajit", 14, pageHeight - 10);

  doc.save(`SAP_Labs_Mission_2027_${summary.userName}_Audit.pdf`);
}

export function exportCodingProblemsCSV(problems: {
  problemName: string;
  difficulty: string;
  topicTag: string;
  language: string;
  dateSolved: string;
  timeComplexity: string;
  spaceComplexity: string;
  status: string;
}[]): void {
  const headers = ["Problem Name", "Difficulty", "Topic Tag", "Language", "Date Solved", "Time Complexity", "Space Complexity", "Status"];
  const rows = problems.map((p) => [
    `"${p.problemName.replace(/"/g, '""')}"`,
    p.difficulty,
    `"${p.topicTag}"`,
    p.language,
    p.dateSolved,
    `"${p.timeComplexity}"`,
    `"${p.spaceComplexity}"`,
    p.status,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `LeetCode_Problems_Export_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
