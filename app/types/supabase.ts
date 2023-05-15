// eslint-disable-next-line @typescript-eslint/naming-convention
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export type DatabaseType = {
  public: {
    Tables: {
      tb_admin_perms: {
        Row: {
          admin_id: number | null
          created_at: string | null
          id: number
          permission_id: number | null
        }
        Insert: {
          admin_id?: number | null
          created_at?: string | null
          id?: number
          permission_id?: number | null
        }
        Update: {
          admin_id?: number | null
          created_at?: string | null
          id?: number
          permission_id?: number | null
        }
      }
      tb_admins: {
        Row: {
          active: boolean | null
          address: string | null
          admin: boolean | null
          birth_date: number | null
          created_at: string | null
          email: string | null
          enrollment_date: string | null
          id: number
          name: string | null
          password: string | null
          phone: number | null
          surname: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          admin?: boolean | null
          birth_date?: number | null
          created_at?: string | null
          email?: string | null
          enrollment_date?: string | null
          id?: number
          name?: string | null
          password?: string | null
          phone?: number | null
          surname?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          admin?: boolean | null
          birth_date?: number | null
          created_at?: string | null
          email?: string | null
          enrollment_date?: string | null
          id?: number
          name?: string | null
          password?: string | null
          phone?: number | null
          surname?: string | null
        }
      }
      tb_all_permissions: {
        Row: {
          created_at: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string | null
        }
      }
      tb_announcements: {
        Row: {
          admin_id: number | null
          announcement_text: string | null
          created_at: string | null
          general: boolean | null
          id: number
          posted_for_class_id: number | null
        }
        Insert: {
          admin_id?: number | null
          announcement_text?: string | null
          created_at?: string | null
          general?: boolean | null
          id?: number
          posted_for_class_id?: number | null
        }
        Update: {
          admin_id?: number | null
          announcement_text?: string | null
          created_at?: string | null
          general?: boolean | null
          id?: number
          posted_for_class_id?: number | null
        }
      }
      tb_classes: {
        Row: {
          class_work: number | null
          created_at: string | null
          doctor_id: number | null
          duration: number | null
          exams: number | null
          id: number
          location: number | null
          section_id: number | null
          start_time: number | null
        }
        Insert: {
          class_work?: number | null
          created_at?: string | null
          doctor_id?: number | null
          duration?: number | null
          exams?: number | null
          id?: number
          location?: number | null
          section_id?: number | null
          start_time?: number | null
        }
        Update: {
          class_work?: number | null
          created_at?: string | null
          doctor_id?: number | null
          duration?: number | null
          exams?: number | null
          id?: number
          location?: number | null
          section_id?: number | null
          start_time?: number | null
        }
      }
      tb_course_enrollment: {
        Row: {
          class_id: number | null
          created_at: string | null
          final_grade: number | null
          id: number
          semester: number | null
          student_id: number | null
        }
        Insert: {
          class_id?: number | null
          created_at?: string | null
          final_grade?: number | null
          id?: number
          semester?: number | null
          student_id?: number | null
        }
        Update: {
          class_id?: number | null
          created_at?: string | null
          final_grade?: number | null
          id?: number
          semester?: number | null
          student_id?: number | null
        }
      }
      tb_courses: {
        Row: {
          course_name: number | null
          created_at: string | null
          credits: number | null
          hours: number | null
          id: number
          major_id: number | null
          min_semester: number | null
          passing_percents: number | null
        }
        Insert: {
          course_name?: number | null
          created_at?: string | null
          credits?: number | null
          hours?: number | null
          id?: number
          major_id?: number | null
          min_semester?: number | null
          passing_percents?: number | null
        }
        Update: {
          course_name?: number | null
          created_at?: string | null
          credits?: number | null
          hours?: number | null
          id?: number
          major_id?: number | null
          min_semester?: number | null
          passing_percents?: number | null
        }
      }
      tb_departments: {
        Row: {
          created_at: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string | null
        }
      }
      tb_doctors: {
        Row: {
          active: boolean | null
          address: string | null
          birth_date: number | null
          created_at: string | null
          email: string | null
          enrollment_date: string | null
          id: number
          name: string | null
          password: string | null
          phone: number | null
          speciality: string | null
          surname: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          birth_date?: number | null
          created_at?: string | null
          email?: string | null
          enrollment_date?: string | null
          id?: number
          name?: string | null
          password?: string | null
          phone?: number | null
          speciality?: string | null
          surname?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          birth_date?: number | null
          created_at?: string | null
          email?: string | null
          enrollment_date?: string | null
          id?: number
          name?: string | null
          password?: string | null
          phone?: number | null
          speciality?: string | null
          surname?: string | null
        }
      }
      tb_grades: {
        Row: {
          created_at: string | null
          garded_for_id: number | null
          id: number
          student_id: number | null
        }
        Insert: {
          created_at?: string | null
          garded_for_id?: number | null
          id?: number
          student_id?: number | null
        }
        Update: {
          created_at?: string | null
          garded_for_id?: number | null
          id?: number
          student_id?: number | null
        }
      }
      tb_grades_dist: {
        Row: {
          class_id: number | null
          created_at: string | null
          full_grade: number | null
          grade: number | null
          id: number
          name: string | null
        }
        Insert: {
          class_id?: number | null
          created_at?: string | null
          full_grade?: number | null
          grade?: number | null
          id?: number
          name?: string | null
        }
        Update: {
          class_id?: number | null
          created_at?: string | null
          full_grade?: number | null
          grade?: number | null
          id?: number
          name?: string | null
        }
      }
      tb_login_creds: {
        Row: {
          created_at: string | null
          email: string | null
          id: number
          password: string | null
          type: number | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: number
          password?: string | null
          type?: number | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: number
          password?: string | null
          type?: number | null
          user_id?: number | null
        }
      }
      tb_major_enrollments: {
        Row: {
          created_at: string | null
          id: number
          major_id: number | null
          student_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          major_id?: number | null
          student_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          major_id?: number | null
          student_id?: number | null
        }
      }
      tb_majors: {
        Row: {
          created_at: string | null
          credits_needes: number | null
          department_id: number | null
          id: number
          major_name: string | null
          total_semesters: number | null
        }
        Insert: {
          created_at?: string | null
          credits_needes?: number | null
          department_id?: number | null
          id?: number
          major_name?: string | null
          total_semesters?: number | null
        }
        Update: {
          created_at?: string | null
          credits_needes?: number | null
          department_id?: number | null
          id?: number
          major_name?: string | null
          total_semesters?: number | null
        }
      }
      tb_prerequisite_course: {
        Row: {
          course_id: number | null
          created_at: string | null
          id: number
          prerequisite_course_id: number | null
        }
        Insert: {
          course_id?: number | null
          created_at?: string | null
          id?: number
          prerequisite_course_id?: number | null
        }
        Update: {
          course_id?: number | null
          created_at?: string | null
          id?: number
          prerequisite_course_id?: number | null
        }
      }
      tb_section: {
        Row: {
          course_id: number | null
          created_at: string | null
          id: number
          name: string | null
        }
        Insert: {
          course_id?: number | null
          created_at?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          course_id?: number | null
          created_at?: string | null
          id?: number
          name?: string | null
        }
      }
      tb_semester_grades: {
        Row: {
          course_id: number | null
          created_at: string | null
          enrollment_id: number | null
          id: number
          letter_grade: string | null
          professor_id: number | null
          semester_time: number | null
        }
        Insert: {
          course_id?: number | null
          created_at?: string | null
          enrollment_id?: number | null
          id?: number
          letter_grade?: string | null
          professor_id?: number | null
          semester_time?: number | null
        }
        Update: {
          course_id?: number | null
          created_at?: string | null
          enrollment_id?: number | null
          id?: number
          letter_grade?: string | null
          professor_id?: number | null
          semester_time?: number | null
        }
      }
      tb_students: {
        Row: {
          active: boolean | null
          address: string | null
          birth_date: number | null
          created_at: string | null
          email: string
          enrollment_date: string
          id: number
          major: string | null
          name: string
          password: string
          phone: number | null
          semester: number | null
          surname: string
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          birth_date?: number | null
          created_at?: string | null
          email: string
          enrollment_date?: string
          id?: number
          major?: string | null
          name: string
          password: string
          phone?: number | null
          semester?: number | null
          surname: string
        }
        Update: {
          active?: boolean | null
          address?: string | null
          birth_date?: number | null
          created_at?: string | null
          email?: string
          enrollment_date?: string
          id?: number
          major?: string | null
          name?: string
          password?: string
          phone?: number | null
          semester?: number | null
          surname?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
