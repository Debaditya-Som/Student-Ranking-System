"use client"

import { useState, useEffect } from "react";
import { Plus, GraduationCap, Calculator, Trash2, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Student {
  name: string;
  marks: { subject: string; UT: number; Final: number; Total: number }[];
  additionalMarks: number[];
  totalMarks: number;
  rank?: number;
}

interface AppState {
  subjects: string[];
  additionalSubjects: string[];
  students: Student[];
}

// Keys for localStorage
const STORAGE_KEY = 'studentRankingSystem';

export default function StudentRanking() {
  // Initialize state with loading function
  const [subjects, setSubjects] = useState<string[]>([]);
  const [additionalSubjects, setAdditionalSubjects] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newAdditionalSubject, setNewAdditionalSubject] = useState("");
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string } | null>(null);

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsedData: AppState = JSON.parse(savedData);
          setSubjects(parsedData.subjects);
          setAdditionalSubjects(parsedData.additionalSubjects);
          setStudents(parsedData.students);
        } else {
          // Set default values if no saved data exists
          setSubjects([
            "English Language",
            "English Literature",
            "Second Language",
            "Environmental Science",
            "Mathematics",
            "Computer"
          ]);
          setAdditionalSubjects([
            "Spelling and Dictation",
            "Reading",
            "Conversation",
            "Moral Science"
          ]);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
        showToast("Error", "Failed to load saved data");
      }
    };

    loadSavedData();
  }, []);

  // Save data whenever state changes
  useEffect(() => {
    const saveData = () => {
      try {
        const dataToSave: AppState = {
          subjects,
          additionalSubjects,
          students
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving data:', error);
        showToast("Error", "Failed to save data");
      }
    };

    // Only save if the states are initialized (not empty arrays from initial render)
    if (subjects.length > 0 || additionalSubjects.length > 0 || students.length > 0) {
      saveData();
    }
  }, [subjects, additionalSubjects, students]);

  const TOTAL_POSSIBLE_MARKS = (subjects.length * 100) + (additionalSubjects.length * 100);

  const showToast = (title: string, description: string) => {
    setToastMessage({ title, description });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add function to clear all data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setSubjects([
        "English Language",
        "English Literature",
        "Second Language",
        "Environmental Science",
        "Mathematics",
        "Computer"
      ]);
      setAdditionalSubjects([
        "Spelling and Dictation",
        "Reading",
        "Conversation",
        "Moral Science"
      ]);
      setStudents([]);
      showToast("Data Cleared", "All data has been reset to default");
    }
  };

  const handleAddSubject = () => {
    if (!newSubject.trim()) {
      showToast("Invalid subject", "Please enter a subject name");
      return;
    }

    if (subjects.includes(newSubject.trim())) {
      showToast("Duplicate subject", "This subject already exists");
      return;
    }

    setSubjects([...subjects, newSubject.trim()]);
    setNewSubject("");

    // Update all existing students with the new subject
    setStudents(students.map(student => ({
      ...student,
      marks: [...student.marks, { subject: newSubject.trim(), UT: 0, Final: 0, Total: 0 }]
    })));
  };

  const handleAddAdditionalSubject = () => {
    if (!newAdditionalSubject.trim()) {
      showToast("Invalid subject", "Please enter a subject name");
      return;
    }

    if (additionalSubjects.includes(newAdditionalSubject.trim())) {
      showToast("Duplicate subject", "This subject already exists");
      return;
    }

    setAdditionalSubjects([...additionalSubjects, newAdditionalSubject.trim()]);
    setNewAdditionalSubject("");

    // Update all existing students with the new additional subject
    setStudents(students.map(student => ({
      ...student,
      additionalMarks: [...student.additionalMarks, 0]
    })));
  };

  const handleDeleteSubject = (index: number) => {
    const updatedSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(updatedSubjects);

    // Update all students by removing the deleted subject
    setStudents(students.map(student => ({
      ...student,
      marks: student.marks.filter((_, i) => i !== index)
    })));

    showToast("Subject deleted", "The subject has been removed successfully");
  };

  const handleDeleteAdditionalSubject = (index: number) => {
    const updatedSubjects = additionalSubjects.filter((_, i) => i !== index);
    setAdditionalSubjects(updatedSubjects);

    // Update all students by removing the deleted additional subject
    setStudents(students.map(student => ({
      ...student,
      additionalMarks: student.additionalMarks.filter((_, i) => i !== index)
    })));

    showToast("Additional subject deleted", "The additional subject has been removed successfully");
  };

  const handleAddStudent = () => {
    setStudents([
      ...students,
      {
        name: "",
        marks: subjects.map((subject) => ({
          subject,
          UT: 0,
          Final: 0,
          Total: 0
        })),
        additionalMarks: Array(additionalSubjects.length).fill(0),
        totalMarks: 0
      }
    ]);
  };

  const handleNameChange = (index: number, value: string) => {
    const updatedStudents = [...students];
    updatedStudents[index].name = value;
    setStudents(updatedStudents);
  };

  const handleMarkChange = (studentIndex: number, subjectIndex: number, type: "UT" | "Final", value: number) => {
    const updatedStudents = [...students];
    const maxMark = type === "UT" ? 20 : 80;
    
    if (value < 0 || value > maxMark) {
      showToast("Invalid marks", `${type} marks should be between 0 and ${maxMark}`);
      return;
    }

    updatedStudents[studentIndex].marks[subjectIndex][type] = value;
    updatedStudents[studentIndex].marks[subjectIndex].Total =
      updatedStudents[studentIndex].marks[subjectIndex].UT +
      updatedStudents[studentIndex].marks[subjectIndex].Final;
    updateTotalMarks(updatedStudents, studentIndex);
    setStudents(updatedStudents);
  };

  const handleAdditionalMarkChange = (studentIndex: number, subjectIndex: number, value: number) => {
    if (value < 0 || value > 100) {
      showToast("Invalid marks", "Additional subject marks should be between 0 and 100");
      return;
    }

    const updatedStudents = [...students];
    updatedStudents[studentIndex].additionalMarks[subjectIndex] = value;
    updateTotalMarks(updatedStudents, studentIndex);
    setStudents(updatedStudents);
  };

  const updateTotalMarks = (studentsList: Student[], studentIndex: number) => {
    const student = studentsList[studentIndex];
    student.totalMarks =
      student.marks.reduce((sum, subject) => sum + subject.Total, 0) +
      student.additionalMarks.reduce((sum, mark) => sum + mark, 0);
  };

  const calculateRanking = () => {
    if (students.some(student => !student.name)) {
      showToast("Missing information", "Please fill in all student names before calculating ranks");
      return;
    }

    const sortedStudents = [...students]
      .map((student) => ({ ...student }))
      .sort((a, b) => b.totalMarks - a.totalMarks);

    let rank = 1, skippedRanks = 0;
    for (let i = 0; i < sortedStudents.length; i++) {
      if (i > 0 && sortedStudents[i].totalMarks === sortedStudents[i - 1].totalMarks) {
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

  const calculatePercentage = (marks: number) => {
    return ((marks / TOTAL_POSSIBLE_MARKS) * 100).toFixed(2);
  };

  const downloadPDF = () => {
    if (students.length === 0) {
      showToast("No data to download", "Please add students and calculate rankings first");
      return;
    }

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text("Student Ranking Report", 14, 15);
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);

    // Prepare table headers and data
    const headers = [
      ["Name", ...subjects, ...additionalSubjects, "Total", "Percentage", "Rank"]
    ];

    const data = students.map(student => [
      student.name || "Unnamed",
      ...student.marks.map(mark => mark.Total.toString()),
      ...student.additionalMarks.map(mark => mark.toString()),
      student.totalMarks.toString(),
      `${calculatePercentage(student.totalMarks)}%`,
      student.rank?.toString() || "-"
    ]);

    // Add the table
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

    // Add summary
    const finalY = (doc as any).lastAutoTable.finalY || 35;
    doc.text(`Total Students: ${students.length}`, 14, finalY + 10);
    doc.text(`Highest Rank: 1st - ${students.find(s => s.rank === 1)?.name || "N/A"}`, 14, finalY + 20);

    doc.save("student-rankings.pdf");

    showToast("PDF downloaded", "The rankings have been downloaded successfully");
  };

  return (
    <div className="text-black min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Toast Message */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Main Subjects Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Main Subjects</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="New subject name"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <button 
                  onClick={handleAddSubject}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {subjects.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{subject}</span>
                    <button
                      onClick={() => handleDeleteSubject(index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Subjects Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Additional Subjects</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="New additional subject name"
                  value={newAdditionalSubject}
                  onChange={(e) => setNewAdditionalSubject(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <button 
                  onClick={handleAddAdditionalSubject}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {additionalSubjects.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{subject}</span>
                    <button
                      onClick={() => handleDeleteAdditionalSubject(index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mb-6">
            <button 
              onClick={handleAddStudent}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Add Student
            </button>
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
                    onChange={(e) => handleNameChange(studentIndex, e.target.value)}
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
                    <h3 className="font-semibold mb-4">Main Subjects</h3>
                    <div className="space-y-4">
                      {student.marks.map((subject, subjectIndex) => (
                        <div key={subjectIndex} className="flex items-center gap-4">
                          <span className="w-40 text-sm">{subject.subject}</span>
                          <input
                            type="number"
                            placeholder="UT"
                            value={subject.UT || ""}
                            onChange={(e) => handleMarkChange(studentIndex, subjectIndex, "UT", Number(e.target.value))}
                            className="w-20 px-3 py-2 border rounded-md"
                          />
                          <input
                            type="number"
                            placeholder="Final"
                            value={subject.Final || ""}
                            onChange={(e) => handleMarkChange(studentIndex, subjectIndex, "Final", Number(e.target.value))}
                            className="w-20 px-3 py-2 border rounded-md"
                          />
                          <span className="text-sm font-medium">Total: {subject.Total}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Additional Subjects</h3>
                    <div className="space-y-4">
                      {additionalSubjects.map((subject, subjectIndex) => (
                        <div key={subjectIndex} className="flex items-center gap-4">
                          <span className="w-40 text-sm">{subject}</span>
                          <input
                            type="number"
                            placeholder="Marks"
                            value={student.additionalMarks[subjectIndex] || ""}
                            onChange={(e) => handleAdditionalMarkChange(studentIndex, subjectIndex, Number(e.target.value))}
                            className="w-20 px-3 py-2 border rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-right">
                  <span className="text-lg font-bold">
                    Total: {student.totalMarks} ({calculatePercentage(student.totalMarks)}%)
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
                      {subjects.map((subject) => (
                        <th key={subject} className="border p-2 text-left">{subject}</th>
                      ))}
                      {additionalSubjects.map((subject) => (
                        <th key={subject} className="border p-2 text-left">{subject}</th>
                      ))}
                      <th className="border p-2 text-left">Total</th>
                      <th className="border p-2 text-left">Percentage</th>
                      <th className="border p-2 text-left">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border p-2">{student.name || 'Unnamed'}</td>
                        {student.marks.map((subject, subjectIndex) => (
                          <td key={subjectIndex} className="border p-2">{subject.Total}</td>
                        ))}
                        {student.additionalMarks.map((mark, markIndex) => (
                          <td key={`additional-${markIndex}`} className="border p-2">{mark}</td>
                        ))}
                        <td className="border p-2 font-medium">{student.totalMarks}</td>
                        <td className="border p-2 font-medium">{calculatePercentage(student.totalMarks)}%</td>
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