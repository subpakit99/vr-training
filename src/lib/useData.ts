"use client";
import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "./supabase";

export type CourseCategory = 'ความปลอดภัย' | 'ทักษะงาน' | 'ปฐมนิเทศ';
export type Department = 'เตรียมไม้' | 'แปรรูปไม้สด' | 'คลังสินค้า' | 'สำนักงาน';

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  is_compulsory: boolean;
  hours: number;
  expiry_years: number;
}

export interface Employee {
  id: string;
  fullName: string;
  department: Department;
  position: string;
}

export interface TrainingRecord {
  id: number;
  empId: string;
  courseId: string;
  date: string;
  trainer: string;
  score: number;
}

interface UseDataResult {
  courses: Course[];
  employees: Employee[];
  records: TrainingRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useData(): UseDataResult {
  const [courses, setCourses] = useState<Course[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cRes, eRes, rRes] = await Promise.all([
        supabaseClient.from("courses").select("*").order("id"),
        supabaseClient.from("employees").select("*").order("id"),
        supabaseClient.from("training_records").select("*").order("date", { ascending: false }),
      ]);
      if (cRes.error) throw cRes.error;
      if (eRes.error) throw eRes.error;
      if (rRes.error) throw rRes.error;

      setCourses((cRes.data || []) as Course[]);
      setEmployees(
        (eRes.data || []).map((e: { id: string; full_name: string; department: string; position: string }) => ({
          id: e.id,
          fullName: e.full_name,
          department: e.department as Department,
          position: e.position,
        }))
      );
      setRecords(
        (rRes.data || []).map((r: { id: number; emp_id: string; course_id: string; date: string; trainer: string; score: number }) => ({
          id: r.id,
          empId: r.emp_id,
          courseId: r.course_id,
          date: r.date,
          trainer: r.trainer,
          score: r.score,
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { courses, employees, records, loading, error, refetch: fetchAll };
}

export async function saveCourse(course: Course, isEdit: boolean) {
  if (isEdit) {
    return supabaseClient.from("courses").update(course).eq("id", course.id);
  }
  return supabaseClient.from("courses").insert(course);
}

export async function deleteCourse(id: string) {
  return supabaseClient.from("courses").delete().eq("id", id);
}

export async function saveEmployee(emp: Employee, isEdit: boolean) {
  const dbRow = {
    id: emp.id,
    full_name: emp.fullName,
    department: emp.department,
    position: emp.position,
  };
  if (isEdit) {
    return supabaseClient.from("employees").update(dbRow).eq("id", emp.id);
  }
  return supabaseClient.from("employees").insert(dbRow);
}

export async function deleteEmployee(id: string) {
  return supabaseClient.from("employees").delete().eq("id", id);
}

export async function saveTrainingRecord(rec: Omit<TrainingRecord, "id"> & { id?: number }, isEdit: boolean) {
  const dbRow = {
    emp_id: rec.empId,
    course_id: rec.courseId,
    date: rec.date,
    trainer: rec.trainer,
    score: rec.score,
  };
  if (isEdit && rec.id !== undefined) {
    return supabaseClient.from("training_records").update(dbRow).eq("id", rec.id);
  }
  return supabaseClient.from("training_records").insert(dbRow);
}

export async function deleteTrainingRecord(id: number) {
  return supabaseClient.from("training_records").delete().eq("id", id);
}
