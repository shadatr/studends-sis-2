export type MenuItemType = {
  id: number;
  name: string;
  link: string;
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


export type PersonalInfoHeaderType = {
  header: string;
};

export type PersonalInfoType = {
  enrollment_date: string;
  id: number;
  name: string;
  surname: string;
  address: string;
  phone: number;
  email: string;
  birth_date: number;
  semester: number;
  major: number;
  advisor?: number;
  active?: boolean;
  head_of_deparment_id?: number;
  graduated?: boolean;
  graduation_year?: string;
  can_graduate: boolean;
  number: number;
  graduate_advisor_approval: boolean;
  final_gpa: number;
  department_id?: number;
};

export type MajorRegType = {
  id?: number;
  major_name: string;
  department_id?: number;
  active: boolean;
  credits_needed?: number;
  tb_departments?: {
    name: string;
    id: number;
  };
};

export type MajorType = {
  id?: number;
  major_name: string;
  credits_needed: number;
  active: boolean
};


export type DepartmentRegType = {
  credits_needed: number;
  id?: number;
  name: string;
  active: boolean;
  major_id: number;
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
  department_id: number;
  major_id: number;
};

export type MajorCourseType = {
  id: number;
  major_id: number;
  course_id: number;
  department_id: number;
  isOptional: boolean;
};

export type MajorEnrollmentType = {
  major_id: number;
  student_id: number;
};

export type DoctorsWithDepartmentsType = {
  id: number;
  name: string;
  surname: string;
  enrollment_date: string;
  email: string;
  major: string;
  active: boolean;
  head_of_department_id: number;
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

export type GetPermissionType = {
  id: number;
  permission_id: number;
  admin_id: number;
  edit?: boolean;
  add?: boolean;
  see?: boolean;
  Delete?: boolean;
  approve?: boolean;
};

export type GetPermissionStudentType = {
  permission_id: number;
  student_id: number;
  active: boolean;
};

export type GetPermissionDoctorType = {
  permission_id?: number;
  doctor_id?: number;
  active: boolean;
  edit?: boolean;
  add?: boolean;
  see?: boolean;
  Delete?: boolean;
  approve?: boolean;
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
  publish_grades?: boolean;
  semester: string;
  day: string;
  starts_at: number;
  ends_at: number;
  location: string;
  active: boolean;
};

export type ClassesInfoType = {
  class: {
    id?: number;
    doctor_id?: number;
    section_id?: number;
    publish_grades?: boolean;
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
  }[]
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
    publish_grades?: boolean;
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
    publish_grades?: boolean;
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
    publish_grades?: boolean;
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
  department: {
    credits_needed: number;
    id?: number;
    name: string;
    active: boolean;
    major_id: number;
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
  section: {
    id?: number;
    name?: string;
    class_id?: number;
    students_num: number;
  }[];
  class: {
    id: number;
    doctor_id?: number;
    section_id?: number;
    publish_grades?: boolean;
    semester: string;
    day: string;
    starts_at: number;
    ends_at: number;
    location: string;
    active: boolean;
  }[];
};



export type PrerequisiteCourseType = {
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
  active:boolean;
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
  credits:number;
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
  id?: string;
  AA: string;
  BA: string;
  BB: string;
  CB: string;
  CC: string;
  DC: string;
  DD: string;
  FD: string;
  FF: string;
};

export type UsageHistoryType = {
  id: number;
  user_id: number;
  action: string;
  type: string;
  date: string;
};
