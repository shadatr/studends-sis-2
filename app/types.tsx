import { type } from "os";

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
  department?: string;
  phone?: string;
  address?: string;
  enrollment_date? : string;
}

export type AnnouncmentsItemType= {
  id: number;
  subject: string;

}

export type AnnouncmentsMangType = {
  id:number
  subject: string;
  type: string;
};


export type AnnouncementType ={
  id: number;
  created_at: string;
  subject: string;
}

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
  department: string;
  advisor: string;
};