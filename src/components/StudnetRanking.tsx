"use client";


import { useState } from "react";
import { Plus, GraduationCap, Calculator, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Student {
  name: string;
  marks: { subject: string; UT: number; Final: number; Total: number }[];
  additionalMarks: number[];
  totalMarks: number;
  rank?: number;
}

const subjects = [
  "English Language",
  "English Literature",
  "Second Language",
  "Environmental Science",
  "Mathematics",
  "Computer"
];

const additionalSubjects = [
  "Spelling and Dictation",
  "Reading",
  "Conversation",
  "Moral Science"
];

const TOTAL_POSSIBLE_MARKS = (subjects.length * 100) + (additionalSubjects.length * 100);

export default function StudentRanking() {
  const [students, setStudents] = useState<Student[]>([]);
  const { toast } = useToast();

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
        additionalMarks: Array(4).fill(0),
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
      toast({
        title: "Invalid marks",
        description: `${type} marks should be between 0 and ${maxMark}`,
        variant: "destructive"
      });
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
      toast({
        title: "Invalid marks",
        description: "Additional subject marks should be between 0 and 100",
        variant: "destructive"
      });
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
      toast({
        title: "Missing information",
        description: "Please fill in all student names before calculating ranks",
        variant: "destructive"
      });
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
    
    toast({
      title: "Rankings calculated",
      description: "Student rankings have been updated successfully"
    });
  };

  const removeStudent = (index: number) => {
    const updatedStudents = students.filter((_, i) => i !== index);
    setStudents(updatedStudents);
    toast({
      title: "Student removed",
      description: "The student has been removed from the list"
    });
  };

  const calculatePercentage = (marks: number) => {
    return ((marks / TOTAL_POSSIBLE_MARKS) * 100).toFixed(2);
  };

  const downloadPDF = () => {
    if (students.length === 0) {
      toast({
        title: "No data to download",
        description: "Please add students and calculate rankings first",
        variant: "destructive"
      });
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

    toast({
      title: "PDF downloaded",
      description: "The rankings have been downloaded successfully"
    });
  };

  return (
    <div className="text-black min-h-screen bg-gray-50 p-4 md:p-8">
      <Card className="mx-auto max-w-7xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-3xl">
            <GraduationCap className="h-8 w-8" />
            Student Ranking System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end gap-4 mb-6">
            <Button onClick={handleAddStudent} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
            <Button onClick={calculateRanking} variant="secondary" className="gap-2">
              <Calculator className="h-4 w-4" />
              Calculate Ranking
            </Button>
            <Button 
              onClick={downloadPDF} 
              variant="outline" 
              className="gap-2 text-white"
              disabled={students.length === 0}
            >
              <Download className=" text-white h-4 w-4" />
              Download PDF
            </Button>
          </div>

          <div className="space-y-6">
            {students.map((student, studentIndex) => (
              <Card key={studentIndex}>
                <CardContent className="pt-6">
                  <div className="flex gap-4 mb-6">
                    <Input
                      placeholder="Student Name"
                      value={student.name}
                      onChange={(e) => handleNameChange(studentIndex, e.target.value)}
                      className="max-w-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeStudent(studentIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-4">Main Subjects</h3>
                      <div className="space-y-4">
                        {student.marks.map((subject, subjectIndex) => (
                          <div key={subjectIndex} className="flex items-center gap-4">
                            <span className="w-40 text-sm">{subject.subject}</span>
                            <Input
                             type="number"
                             placeholder={subject.UT === 0 ? "UT" : ""}
                            value={subject.UT || ""}
                              onChange={(e) => handleMarkChange(studentIndex, subjectIndex, "UT", Number(e.target.value) || 0)}
                              className="w-20"
                            />
                          <Input
                          type="number"
                          placeholder={subject.Final === 0 ? "Final" : ""}
                          value={subject.Final || ""}
                          onChange={(e) => handleMarkChange(studentIndex, subjectIndex, "Final", Number(e.target.value) || 0)}
                          className="w-20"/>

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
                            <Input
                              type="number"
                              placeholder="Marks"
                              value={student.additionalMarks[subjectIndex]}
                              onChange={(e) => handleAdditionalMarkChange(studentIndex, subjectIndex, Number(e.target.value))}
                              className="w-20"
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
                </CardContent>
              </Card>
            ))}
          </div>

          {students.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
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
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}