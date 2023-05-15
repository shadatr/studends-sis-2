import React from 'react';
import { ColumnDefinitionType , MenuItemType } from "@/app/types/types";

import Table from "../table";

const item: MenuItemType[] = [
  { id: 1, link: "annoucments", name: "الإعلانات" },
  { id: 2, link: "employeeInfo", name: "بيانات الموظف" },
  { id: 3, link: "students", name: "الطلاب" },
  { id: 4, link: "doctors", name: " اعضاء هيئة التدريس" },
  { id: 5, link: "empolyees", name: "موظفين الادارة" },
  { id: 6, link: "courseReg", name: "تنزيل المواد" },
];



const columns: ColumnDefinitionType<MenuItemType, keyof MenuItemType>[] = [
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

export default ManagMenu;
