import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, CheckCircle2, XCircle } from 'lucide-react';
import * as Papa from 'papaparse';

import type { Student, AttendanceRecord } from '../types';
import { studentService } from '../services/studentService';
import { attendanceService } from '../services/attendanceService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Attendance = () => {
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});
  const [filter, setFilter] = useState<'All' | 'Present' | 'Absent'>('All');

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    const [allStudents, dateRecords] = await Promise.all([
      studentService.getAll(),
      attendanceService.getByDate(date)
    ]);
    
    setStudents(allStudents);
    
    const recordMap: Record<string, AttendanceRecord> = {};
    dateRecords.forEach(r => {
      recordMap[r.studentId] = r;
    });
    setRecords(recordMap);
  };

  const markAttendance = async (studentId: string, status: 'Present' | 'Absent') => {
    const newRecord = await attendanceService.markAttendance(studentId, date, status);
    setRecords(prev => ({
      ...prev,
      [studentId]: newRecord
    }));
  };

  const markAll = async (status: 'Present' | 'Absent') => {
    const newRecords: AttendanceRecord[] = students.map(s => ({
      studentId: s.id,
      date,
      status
    }));
    await attendanceService.markMultiple(newRecords);
    await loadData();
  };

  const handleExportCSV = () => {
    const dataToExport = students.map(s => ({
      Name: s.name,
      RollNumber: s.rollNumber,
      Class: s.classSection,
      Date: date,
      Status: records[s.id]?.status || 'Not Marked'
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `attendance_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => {
    if (filter === 'All') return true;
    const status = records[s.id]?.status;
    if (filter === 'Present') return status === 'Present';
    if (filter === 'Absent') return status === 'Absent';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground mt-1">Mark daily attendance for students.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex bg-muted p-1 rounded-md">
            {['All', 'Present', 'Absent'].map(f => (
              <button
                key={f}
                className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-all ${
                  filter === f ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setFilter(f as any)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => markAll('Present')} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark All Present
            </Button>
            <Button variant="outline" size="sm" onClick={() => markAll('Absent')} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">
              <XCircle className="w-4 h-4 mr-2" /> Mark All Absent
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-border overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary text-secondary-foreground font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No students found for this filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const status = records[student.id]?.status;
                  return (
                    <tr key={student.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{student.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{student.rollNumber}</td>
                      <td className="px-4 py-3 text-center">
                        {status === 'Present' && (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                            Present
                          </span>
                        )}
                        {status === 'Absent' && (
                          <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-500">
                            Absent
                          </span>
                        )}
                        {!status && (
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                            Not Marked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant={status === 'Present' ? 'default' : 'outline'}
                          className={status === 'Present' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                          onClick={() => markAttendance(student.id, 'Present')}
                        >
                          Present
                        </Button>
                        <Button 
                          size="sm" 
                          variant={status === 'Absent' ? 'destructive' : 'outline'}
                          onClick={() => markAttendance(student.id, 'Absent')}
                        >
                          Absent
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
