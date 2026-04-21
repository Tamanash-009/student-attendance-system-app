import type { AttendanceRecord, AttendanceStats } from '../types';
import { supabase } from '../lib/supabase';
import { studentService } from './studentService';

const TABLE_NAME = 'attendance_records';

export const attendanceService = {
  getAll: async (): Promise<AttendanceRecord[]> => {
    const { data, error } = await supabase.from(TABLE_NAME).select('*');
    if (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
    return data as AttendanceRecord[];
  },

  getByDate: async (date: string): Promise<AttendanceRecord[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('date', date);
    if (error) {
      console.error('Error fetching attendance by date:', error);
      return [];
    }
    return data as AttendanceRecord[];
  },

  markAttendance: async (studentId: string, date: string, status: 'Present' | 'Absent'): Promise<AttendanceRecord> => {
    const record: AttendanceRecord = { studentId, date, status };
    
    // UPSERT logical approach based on composite primary key or match
    // Supabase allows standard upsert if there's a primary key constraint
    // For simplicity, we delete existing then insert
    await supabase.from(TABLE_NAME)
      .delete()
      .match({ studentId, date });
      
    const { error } = await supabase.from(TABLE_NAME).insert([record]);
    
    if (error) throw error;
    return record;
  },

  markMultiple: async (records: AttendanceRecord[]): Promise<void> => {
    for (const record of records) {
      await supabase.from(TABLE_NAME).delete().match({ studentId: record.studentId, date: record.date });
    }
    const { error } = await supabase.from(TABLE_NAME).insert(records);
    if (error) throw error;
  },

  getStats: async (): Promise<AttendanceStats> => {
    const [students, allRecords] = await Promise.all([
      studentService.getAll(),
      attendanceService.getAll()
    ]);
    
    const totalStudents = students.length;
    let presentCount = 0;
    let absentCount = 0;

    allRecords.forEach(record => {
      if (record.status === 'Present') presentCount++;
      if (record.status === 'Absent') absentCount++;
    });

    const totalMarked = presentCount + absentCount;
    const attendancePercentage = totalMarked === 0 ? 0 : Math.round((presentCount / totalMarked) * 100);

    return {
      totalStudents,
      presentCount,
      absentCount,
      attendancePercentage
    };
  }
};
