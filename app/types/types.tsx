export type TablePropsType<T, K extends keyof T> = {
  data: Array<T>;
  columns: Array<ColumnDefinitionType<T, K>>;
};

export type ColumnDefinitionType<T, K extends keyof T> = {
  key: K;
  header: string;
  width?: number;
};

export type TableRowsPropsType<T, K extends keyof T> = {
  data: Array<T>;
  columns: Array<ColumnDefinitionType<T, K>>;
};

export type TableHeaderPropsType<T, K extends keyof T> = {
  columns: Array<ColumnDefinitionType<T, K>>;
};

export type MenuItemType = {
  id: number;
  name: string;
  link: string;
};

export type RegisterStudentType = {
  name: string;
  surname: string;
  birth_date: string;
  email: string;
  password: string;
  major?: string;
  phone?: string;
  address?: string;
  enrollment_date?: string;
  advisor?: string;
};
export type RegisterStudent2Type = {
  id: number;
  name: string;
  surname: string;
  birth_date: string;
  email: string;
  password: string;
  major?: string;
  phone?: string;
  address?: string;
  enrollment_date?: string;
  advisor?: string;
};

export type AnnouncmentsMangType = {
  general: boolean;
  announcement_text: string;
  posted_for_class_id?: number;
  doctor_id?: number;
  admin_id?: number;
};

export type AnnouncementType = {
  id: number;
  created_at: string;
  subject: string;
};

export type RegisterdoctorType = {
  name: string;
  surname: string;
  birth_date: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  enrollment_date?: string;
  speciality: string;
};

export type RegisterManagerType = {
  name: string;
  surname: string;
  birth_date: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  enrollment_date?: string;
};

export type PersonalInfoHeaderType = {
  header: string;
};

export type PersonalInfoType = {
  id: number;
  name: string;
  surname: string;
  address: string;
  phone: number;
  email: string;
  birth_date: number;
  semester: number;
  enrollment_date?: number;
  major: string;
  advisor?: string;
  active?: boolean;
  head_of_deparment_id?: number;
};

export type MajorRegType = {
  id?: number;
  major_name: string;
  semesters?: number;
  department_id?: number;
  credits_needed?: number;
  tb_departments?: {
    name: string;
    id: number;
  };
};

export type MajorReg2Type = {
  id: number;
  major_name: string;
  semesters?: number;
  department_id?: number;
  credits_needed?: number;
  tb_departments?: {
    name: string;
    id: number;
  };
};

export type DepartmentRegType = {
  id?: number;
  name: string;
};

export type AdminStaffType = {
  id: number;
  name: string;
  surname: string;
  admin: boolean;
  createdAt: string | null;
  active: boolean;
};

export type SearchIntityType = {
  searchType: 'student' | 'doctor' | 'admin';
  searchBy: string;
};

export type AddCourseType = {
  id?: number;
  course_name: string;
  major_id?: number;
  min_semester?: number;
  hours?: number;
  credits?: number;
  passing_percentage?: number;
};

export type AddCourse2Type = {
  id: number;
  course_name: string;
  major_id?: number;
  min_semester?: number;
  hours?: string;
  credits?: string;
  passing_percentage?: string;
};

export type MajorEnrollmentType = {
  major_id: number;
  student_id: number;
};

export type DoctorsWithDepartmentsType = {
  id: number;
  name: string;
  surname: string;
  doctorSince: string;
  email: string;
  department: {
      created_at: string | null;
      id: number;
      name: string | null;
  } | undefined;
};


export type AssignDepartmentType = {
  doctor_id: number;
  department_id: number | null;
};

export type AssignPermissionType = {
  id:number;
  name: string;
  active: boolean;
};

export type GetPermissionType={
  permission_id: number;
  admin_id: number;
  active: boolean;
}

export type CheckedType={
  id:number;
  name: string;
}

export type SectionType = {
  id?: number;
  name?: string;
  course_id?: number;
};

export type ClassesType = {
  id?: number;
  doctor_id?: number;
  section_id?: number;
  location?: string;
  start_time?: number;
  duration?: number;
  class_work?: number;
  midterm?: number;
  final?: number;
};

export type StudentClassType = {
  id?: number;
  student_id: number;
  class_id?: number;
  semester?: number;
  class_work?: string;
  midterm: string;
  final?: string;
  [key: string]: any;
};

export type ExamType={
  exam?:string;
  student_id?:number;
  grade?:string
}

export type MajorType = {
  id: number;
  major_name: string;
  semesters?: number;
  department_id?: number;
  credits_needed?: number;
};

export type TabType = {
  id: number;
  title: string;
  content: string;
};

export type CourseType = {
  id?: number;
  course_name: string;
  major_id?: number;
  credits?: number;
  hours?: number;
  passing_percentage?: number;
  min_semester?: number;
  tb_majors?: {
    major_name?: string;
    id?: number;
    total_semester: number;
    department_id: number;
    credits_needed: number;
  };
};

export type PrerequisiteCourseType = {
  id?: number;
  course_id?: number;
  prerequisite_course_id?: number;
};