import React, { useState, useEffect, useRef } from 'react';
import type { Student } from '../types';
import { studentService } from '../services/studentService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { StudentForm } from '../components/StudentForm';
import { Plus, Search, Upload, Pencil, Trash2 } from 'lucide-react';
import * as Papa from 'papaparse';

export const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const data = await studentService.getAll();
    setStudents(data);
  };

  const handleSaveStudent = async (studentData: Omit<Student, 'id'>) => {
    if (editingStudent) {
      await studentService.update(editingStudent.id, studentData);
    } else {
      await studentService.add(studentData);
    }
    await loadStudents();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      await studentService.delete(id);
      await loadStudents();
    }
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const newStudents = results.data.map((row: any) => ({
          name: row.name || row.Name || '',
          rollNumber: row.rollNumber || row.RollNumber || row.roll_number || '',
          classSection: row.classSection || row.Class || row.Section || 'N/A'
        })).filter((s) => s.name && s.rollNumber);

        if (newStudents.length > 0) {
          await studentService.addMany(newStudents);
          await loadStudents();
          alert(`Imported ${newStudents.length} students successfully.`);
        } else {
          alert('No valid student data found. Ensure headers: name, rollNumber, classSection');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground mt-1">Manage your student directory.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => { setEditingStudent(undefined); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search students..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-md border border-border overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary text-secondary-foreground font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Class/Section</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{student.name}</td>
                    <td className="px-4 py-3">{student.rollNumber}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {student.classSection}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(student)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(student.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <StudentForm 
        isOpen={formOpen} 
        student={editingStudent}
        onClose={() => setFormOpen(false)} 
        onSave={handleSaveStudent} 
      />
    </div>
  );
};
