import type { Student } from '../types';
import { supabase } from '../lib/supabase';

const TABLE_NAME = 'students';

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    const { data, error } = await supabase.from(TABLE_NAME).select('*');
    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }
    return data as Student[];
  },

  add: async (student: Omit<Student, 'id'>): Promise<Student> => {
    const newStudent: Student = {
      ...student,
      id: crypto.randomUUID(),
    };
    const { error } = await supabase.from(TABLE_NAME).insert([newStudent]);
    if (error) {
      console.error('Error adding student:', error);
      throw error;
    }
    return newStudent;
  },
  
  addMany: async (newStudents: Omit<Student, 'id'>[]): Promise<Student[]> => {
    const added: Student[] = newStudents.map(s => ({ ...s, id: crypto.randomUUID() }));
    const { error } = await supabase.from(TABLE_NAME).insert(added);
    if (error) {
      console.error('Error adding multiple students:', error);
      throw error;
    }
    return added;
  },

  update: async (id: string, updates: Partial<Student>): Promise<Student> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }
    return data as Student;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
    if (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },
};
