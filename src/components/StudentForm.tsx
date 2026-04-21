import React, { useState, useEffect } from 'react';
import type { Student } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { X } from 'lucide-react';

interface StudentFormProps {
  student?: Student;
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, 'id'>) => Promise<void>;
}

export const StudentForm: React.FC<StudentFormProps> = ({ student, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    classSection: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        rollNumber: student.rollNumber,
        classSection: student.classSection
      });
    } else {
      setFormData({ name: '', rollNumber: '', classSection: '' });
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{student ? 'Edit Student' : 'Add New Student'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5"/></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Student Name</label>
            <Input 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Roll Number</label>
            <Input 
              required 
              value={formData.rollNumber} 
              onChange={e => setFormData({...formData, rollNumber: e.target.value})} 
              placeholder="e.g. CS-101"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Class / Section</label>
            <Input 
              required 
              value={formData.classSection} 
              onChange={e => setFormData({...formData, classSection: e.target.value})} 
              placeholder="e.g. Grade 10 - A"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Student'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
