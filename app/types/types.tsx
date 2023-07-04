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
  id?: number;
  name?: string;
  surname?: string;
  birth_date?: string;
  email?: string;
  password?: string;
  major?: number;
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
  major: number;
  phone: string;
  address: string;
  enrollment_date: string;
  semester: number;
  advisor?: number;
};

export type AnnouncmentsMangType = {
  id?: number;
  general: boolean;
  announcement_text: string;
  posted_for_class_id?: number;
  doctor_id?: number;
  admin_id?: number;
};

export type AnnouncmentsType = {
  id: number;
  general: boolean;
  announcement_text: string;
  posted_for_class_id?: number;
  doctor_id?: number;
  admin_id?: number;
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
  major: string;
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
  major: number;
  advisor?: string;
  active?: boolean;
  head_of_deparment_id?: number;
  graduated?: boolean;
  graduation_year?: string;
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
  createdAt: string | null;
  active: boolean;
};

export type SearchIntityType = {
  searchType: 'student' | 'doctor' | 'admin';
  searchBy: string;
};



export type AddCourseType = {
  id: number;
  course_number: string;
  course_name: string;
  hours?: string;
  credits?: number;
  passing_percentage?: number;
  pass?: boolean;
  class_work?: number;
  midterm?: number;
  final?: number;
};

export type MajorCourseType = {
  id: number;
  major_id: number;
  course_id: number;
  isOptional: boolean
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
  major: string;
  active: boolean;
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
  active?: boolean;
};

export type AssignCourseType = {
  id: number;
  name: string;
};

export type GetPermissionType={
  id: number;
  permission_id: number;
  admin_id: number;
  active: boolean;
}

export type GetPermissionStudentType = {
  permission_id: number;
  student_id: number;
  active: boolean;
};

export type GetPermissionDoctorType = {
  permission_id?: number;
  doctor_id?: number;
  active?: boolean;
};

export type CheckedType={
  id:number;
  name: string;
}

export type SectionType = {
  id?: number;
  name?: string;
  course_id?: number;
  students_num: number;
};

export type Section2Type = {
  class_id?:number,
  id?: number;
  name?: string;
  course_id?: number;
  students_num: number;
};

export type ClassesType = {
  id?: number;
  doctor_id?: number;
  section_id?: number;
  mid_publish?: boolean;
  final_publish?: boolean;
  class_work_publish?: boolean;
  result_publish?: boolean;
  semester: string;
  day: string;
  starts_at: number;
  ends_at: number;
  location: string;
};

export type ClassesInfoType = {
  class: {
    id?: number;
    doctor_id?: number;
    section_id?: number;
    mid_publish?: boolean;
    final_publish?: boolean;
    class_work_publish?: boolean;
    result_publish?: boolean;
    semester: string;
    day: string;
    starts_at: number;
    ends_at: number;
    location: string;
  };
  section: {
    id?: number;
    name?: string;
    course_id?: number;
    students_num: number;
  };
  course: {
    id: number;
    course_number: string;
    course_name: string;
    hours?: string;
    credits?: number;
    passing_percentage?: number;
    pass?: boolean;
    class_work?: number;
    midterm?: number;
    final?: number;
  };
  doctor: {
    id: number;
    name: string;
    surname: string;
    address: string;
    phone: number;
    email: string;
    birth_date: number;
    semester: number;
    enrollment_date?: number;
    major: number;
    advisor?: string;
    active?: boolean;
    head_of_deparment_id?: number;
  };
};

export type StudentClassType = {
  id?: number;
  student_id: number;
  class_id?: number;
  semester?: number;
  class_work?: number;
  midterm: number;
  final?: number;
  pass?: boolean;
  result?: number;
  can_repeat?: boolean;
  approved?: boolean;
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
  id: number;
  course_number: string;
  course_name: string;
  hours?: string;
  credits?: number;
  passing_percentage?: number;
  pass?: boolean;
  class_work?: number;
  midterm?: number;
  final?: number;
  tb_majors?: {
    major_name?: string;
    id?: number;
    total_semester: number;
    department_id: number;
    credits_needed: number;
  };
};


export type CourseInfoType = {
  prerequisites: {
    id: number;
    course_id: number;
    prerequisite_course_id: number;
  }[];
  class: {
    id: number;
    doctor_id?: number;
    section_id?: number;
    mid_publish?: boolean;
    final_publish?: boolean;
    class_work_publish?: boolean;
    result_publish?: boolean;
    semester: string;
    day: string;
    starts_at: number;
    ends_at: number;
    location: string;
    active: boolean;
  }[];
  course: {
    id: number;
    course_number: string;
    course_name: string;
    hours?: string;
    credits?: number;
    passing_percentage?: number;
    pass?: boolean;
    class_work?: number;
    midterm?: number;
    final?: number;
  };
  courseEnrollements: {
    id?: number;
    student_id: number;
    class_id?: number;
    semester?: number;
    class_work?: number;
    midterm: number;
    final?: number;
    pass?: boolean;
    result?: number;
    can_repeat?: boolean;
    approved?: boolean;
  }[];
  section: {
    id?: number;
    name?: string;
    course_id?: number;
    students_num: number;
  }[];
  majorCourse: {
    id: number;
    major_id: number;
    course_id: number;
    isOptional: boolean;
  };
  doctor: {
    id: number;
    name: string;
    surname: string;
    address: string;
    phone: number;
    email: string;
    birth_date: number;
    enrollment_date?: number;
    major: number;
    advisor?: string;
    active?: boolean;
    head_of_deparment_id?: number;
  }[];
};

export type StudenCourseType = {
  class: {
    id: number;
    doctor_id?: number;
    section_id?: number;
    mid_publish?: boolean;
    final_publish?: boolean;
    class_work_publish?: boolean;
    result_publish?: boolean;
    semester: string;
    day: string;
    starts_at: number;
    ends_at: number;
    location: string;
    active: boolean;
  };
  course: {
    id: number;
    course_number: string;
    course_name: string;
    hours?: string;
    credits?: number;
    passing_percentage?: number;
    pass?: boolean;
    class_work?: number;
    midterm?: number;
    final?: number;
  };
  courseEnrollements: {
    id: number;
    student_id: number;
    class_id?: number;
    semester?: number;
    class_work?: number;
    midterm: number;
    final?: number;
    pass?: boolean;
    result?: number;
    can_repeat?: boolean;
    approved?: boolean;
  };
  section: {
    id: number;
    name: string;
    course_id: number;
    students_num: number;
  };
  doctor: {
    id: number;
    name: string;
    surname: string;
    address: string;
    phone: number;
    email: string;
    birth_date: number;
    enrollment_date?: number;
    major: number;
    advisor?: string;
    active?: boolean;
    head_of_deparment_id?: number;
  };
};

export type StudenCourseGPAType = {
  class: {
    id: number;
    doctor_id?: number;
    section_id?: number;
    mid_publish?: boolean;
    final_publish?: boolean;
    class_work_publish?: boolean;
    result_publish?: boolean;
    semester: string;
    day: string;
    starts_at: number;
    ends_at: number;
    location: string;
    active: boolean;
  };
  course: {
    id: number;
    course_number: string;
    course_name: string;
    hours?: string;
    credits?: number;
    passing_percentage?: number;
    pass?: boolean;
    class_work?: number;
    midterm?: number;
    final?: number;
  };
  courseEnrollements: {
    id: number;
    student_id: number;
    class_id?: number;
    semester?: number;
    class_work?: number;
    midterm: number;
    final?: number;
    pass?: boolean;
    result?: number;
    can_repeat?: boolean;
    approved?: boolean;
  };
  section: {
    id: number;
    name: string;
    course_id: number;
    students_num: number;
  };
  doctor: {
    id: number;
    name: string;
    surname: string;
    address: string;
    phone: number;
    email: string;
    birth_date: number;
    enrollment_date?: number;
    major: number;
    advisor?: string;
    active?: boolean;
    head_of_deparment_id?: number;
  };
  student?: {
    id: number;
    name: string;
    surname: string;
    address: string;
    phone: number;
    email: string;
    birth_date: number;
    semester: number;
    enrollment_date?: number;
    major: number;
    advisor?: string;
    active?: boolean;
    head_of_deparment_id?: number;
    graduated: boolean;
    graduation_year?: string;
    credits?: number;
  };
  major: {
    id: number;
    major_name: string;
    semesters?: number;
    department_id?: number;
    credits_needed?: number;
  };
};


export type ClassEnrollmentsType = {
  course: {
    id: number;
    course_number: string;
    course_name: string;
    hours?: string;
    credits?: number;
    passing_percentage?: number;
    pass?: boolean;
    class_work?: number;
    midterm?: number;
    final?: number;
  }[];
  courseEnrollements: {
    id: number;
    student_id: number;
    class_id?: number;
    semester?: number;
    class_work?: number;
    midterm: number;
    final?: number;
    pass?: boolean;
    result?: number;
    can_repeat?: boolean;
    approved?: boolean;
  }[];
};



export type PrerequisiteCourseType = {
  prerequisite_course: any;
  id?: number;
  course_id?: number;
  prerequisite_course_id?: number;
};

export type AssignAdvisorType = {
  id: number;
  advisor: number;
};

export type InfoDoctorType = {
  id:number;
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

export type StudentCourseType = {
  course: AddCourseType;
  courseEnroll: StudentClassType;
  section?: SectionType;
  class?: ClassesType;
};

export type StudentCourse2Type = {
  doctor_name?: string;
  course?: {
    id: number;
    course_number: string;
    course_name: string;
    hours?: string;
    credits?: number;
    passing_percentage?: number;
    pass?: boolean;
    class_work?: number;
    midterm?: number;
    final?: number;
  };
  section?: {
    id?: number;
    name?: string;
    class_id?: number;
    students_num: number;
  };
};

export type DoctorCourse2Type = {
  course_name?: string;
  section?: {
    id?: number;
    name?: string;
    course_id?: number;
    students_num: number;
    class_id?:number;
  };
};

export type TranscriptType = {
  id: number;
  student_id: number;
  semester: string;
  studentSemester: number;
  gpa: number;
};

export type DayOfWeekType = {
  name: string;
  day: string;
};


export type ExamProgramType = {
  id?: number;
  course_id: number;
  date: string;
  hour: number;
  duration: number;
  location: string;
};

export type LetterGradesType = {
  id: number;
  course_enrollment_id?: number;
  letter_grade?: string;
  points?:number;
  repeated?: boolean;
};

export type LettersType = {
    id?: number;
    AA: number;
    BA: number;
    BB: number;
    CB: number;
    CC: number;
    DC: number;
    DD: number;
    FD: number;
    FF: number;
};