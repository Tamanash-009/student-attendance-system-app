export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  classSection: string;
}

export interface AttendanceRecord {
  studentId: string;
  date: string; // YYYY-MM-DD format
  status: 'Present' | 'Absent';
}

export interface AttendanceStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
}
