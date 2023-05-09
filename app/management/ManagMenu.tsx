import React from 'react'
import { menuItem } from '../types';
import Table from "../table";
import { ColumnDefinitionType } from "@/app/types";

const item: menuItem[] = [
  { id: 1, link: "annoucments", name: "الإعلانات" },
  { id: 2, link: "employeeInfo", name: "بيانات الموظف" },
  { id: 3, link: "students", name: "الطلاب" },
  { id: 4, link: "doctors", name: " اعضاء هيئة التدريس" },
  { id: 5, link: "empolyees", name: "موظفين الادارة" },
  { id: 6, link: "courseReg", name: "تنزيل المواد" },
];



const columns: ColumnDefinitionType<menuItem, keyof menuItem>[] = [
  {
    key: "name",
    header: "",
  },
];

function ManagMenu() {
    return (
        <div>
            <Table columns={columns} data={item} />
        </div>
    );
}

export default ManagMenu
