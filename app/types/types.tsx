
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
}

export type RegisterStudentType = {
  name: string;
  surname: string;
  birth_date : string;
  email: string;
  password: string;
  major?: string;
  phone?: string;
  address?: string;
  enrollment_date? : string;
}


export type AnnouncmentsMangType = {
  general: boolean;
  announcement_text: string;
  posted_for_class_id?: number;
  doctor_id?: number;
  admin_id?: number;
};



export type AnnouncementType ={
  id: number;
  created_at: string;
  subject: string;
}


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
  advisor: string;
};

export type MajorRegType = {
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
  id?:number;
  name: string;
};

export type AdminStaffType = {
  id: number;
  name: string;
  surname: string;
  admin : boolean;
  createdAt : string | null;
  active : boolean;
};