"use client";

import { useState, useEffect } from "react";
import { Plus, GraduationCap, Calculator, Trash2, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Student {
  name: string;
  rollNumber: string;
  halfYearlyMarks: number;
  finalMarks: number;
  averageMarks: number;
  percentage: number;
  rank?: number;
}

const STORAGE_KEY = 'studentRankingSystemSuper';

export default function StudentRanking() {
  const [students, setStudents] = useState<Student[]>([]);
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string } | null>(null);

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsedData: Student[] = JSON.parse(savedData);
          setStudents(parsedData);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
        showToast("Error", "Failed to load saved data");
      }
    };

    loadSavedData();
  }, []);

  useEffect(() => {
    const saveData = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      } catch (error) {
        console.error('Error saving data:', error);
        showToast("Error", "Failed to save data");
      }
    };

    if (students.length > 0) {
      saveData();
    }
  }, [students]);

  const showToast = (title: string, description: string) => {
    setToastMessage({ title, description });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setStudents([]);
      showToast("Data Cleared", "All data has been reset to default");
    }
  };

  const handleAddStudent = () => {
    setStudents([
      ...students,
      {
        name: "",
        rollNumber: "",
        halfYearlyMarks: 0,
        finalMarks: 0,
        averageMarks: 0,
        percentage: 0,
      },
    ]);
  };

  const handleInputChange = (index: number, field: keyof Student, value: string | number) => {
    const updatedStudents = [...students];
    (updatedStudents[index][field] as typeof value) =
      typeof value === "number" ? Math.max(0, Math.min(1000, value)) : value;
    setStudents(updatedStudents);
  };

  const calculateRanking = () => {
    const updatedStudents = students.map((student) => {
      const averageMarks = (student.halfYearlyMarks + student.finalMarks) / 2;
      const percentage = (averageMarks / 1000) * 100;
      return { ...student, averageMarks, percentage };
    });

    const sortedStudents = [...updatedStudents].sort((a, b) => b.averageMarks - a.averageMarks);
    let rank = 1,
      skippedRanks = 0;
    for (let i = 0; i < sortedStudents.length; i++) {
      if (i > 0 && sortedStudents[i].averageMarks === sortedStudents[i - 1].averageMarks) {
        skippedRanks++;
      } else {
        rank += skippedRanks;
        skippedRanks = 1;
      }
      sortedStudents[i].rank = rank;
    }
    setStudents(sortedStudents);
    showToast("Rankings calculated", "Student rankings have been updated successfully");
  };

  const removeStudent = (index: number) => {
    const updatedStudents = students.filter((_, i) => i !== index);
    setStudents(updatedStudents);
    showToast("Student removed", "The student has been removed from the list");
  };

  const downloadPDF = () => {
    if (students.length === 0) {
      showToast("No data to download", "Please add students and calculate rankings first");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Student Ranking Report", 14, 15);
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);

    const headers = [
      ["Name", "Roll Number", "Half-Yearly Marks", "Final Marks", "Average Marks", "Percentage", "Rank"]
    ];

    const data = students.map(student => [
      student.name || "Unnamed",
      student.rollNumber || "N/A",
      student.halfYearlyMarks.toString(),
      student.finalMarks.toString(),
      student.averageMarks.toString(),
      `${student.percentage.toFixed(2)}%`,
      student.rank?.toString() || "-"
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontSize: 8,
        fontStyle: "bold"
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 35 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 35;
    doc.text(`Total Students: ${students.length}`, 14, finalY + 10);
    doc.text(`Highest Rank: 1st - ${students.find(s => s.rank === 1)?.name || "N/A"}`, 14, finalY + 20);

    doc.save("student-rankings.pdf");

    showToast("PDF downloaded", "The rankings have been downloaded successfully");
  };

  return (
    <div className="text-black min-h-screen bg-gray-50 p-4 md:p-8">
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 max-w-sm">
          <h4 className="font-bold text-lg">{toastMessage.title}</h4>
          <p className="text-gray-600">{toastMessage.description}</p>
        </div>
      )}

      <div className="mx-auto max-w-7xl bg-white rounded-lg shadow-md">
        <div className="text-center p-6 border-b">
          <h1 className="flex items-center justify-center gap-2 text-3xl font-bold">
            <GraduationCap className="h-8 w-8" />
            Student Ranking System
          </h1>
        </div>
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Reset to Default
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-end gap-4 mb-6">
            <button onClick={handleAddStudent} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <Plus className="h-4 w-4" /> Add Student </button>
            <button 
              onClick={calculateRanking}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Calculator className="h-4 w-4" />
              Calculate Ranking
            </button>
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              disabled={students.length === 0}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>

          <div className="space-y-6">
            {students.map((student, studentIndex) => (
              <div key={studentIndex} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={student.name}
                    onChange={(e) => handleInputChange(studentIndex, "name", e.target.value)}
                    className="flex-1 max-w-md px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Roll Number"
                    value={student.rollNumber}
                    onChange={(e) => handleInputChange(studentIndex, "rollNumber", e.target.value)}
                    className="flex-1 max-w-md px-3 py-2 border rounded-md"
                  />
                  <button
                    onClick={() => removeStudent(studentIndex)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">Half-Yearly Marks</h3>
                    <div className="space-y-4">
                      <input
                        type="number"
                        placeholder="Half-Yearly Marks"
                        value={student.halfYearlyMarks || ""}
                        onChange={(e) => handleInputChange(studentIndex, "halfYearlyMarks", Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Final Marks</h3>
                    <div className="space-y-4">
                      <input
                        type="number"
                        placeholder="Final Marks"
                        value={student.finalMarks || ""}
                        onChange={(e) => handleInputChange(studentIndex, "finalMarks", Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-right">
                  <span className="text-lg font-bold">
                    Average: {student.averageMarks} ({student.percentage.toFixed(2)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {students.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Rankings</h2>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Name</th>
                      <th className="border p-2 text-left">Roll Number</th>
                      <th className="border p-2 text-left">Half-Yearly Marks</th>
                      <th className="border p-2 text-left">Final Marks</th>
                      <th className="border p-2 text-left">Average Marks</th>
                      <th className="border p-2 text-left">Percentage</th>
                      <th className="border p-2 text-left">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border p-2">{student.name || 'Unnamed'}</td>
                        <td className="border p-2">{student.rollNumber || 'N/A'}</td>
                        <td className="border p-2">{student.halfYearlyMarks}</td>
                        <td className="border p-2">{student.finalMarks}</td>
                        <td className="border p-2 font-medium">{student.averageMarks}</td>
                        <td className="border p-2 font-medium">{student.percentage.toFixed(2)}%</td>
                        <td className="border p-2 font-bold">{student.rank ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}