import React from 'react';
import Link from 'next/link';

import { MenuItemType } from '../types/types';

const item: MenuItemType[] = [
  { id: 1, link: 'announcements', name: 'الإعلانات' },
  { id: 3, link: 'courses', name: 'المواد الدراسية' },
  { id: 4, link: 'courseProg', name: 'جدول المحاضرات' },
  { id: 6, link: 'examProg', name: 'جدول الامتحانات' },
  { id: 7, link: 'examRes', name: 'نتائج الامتحانات' },
  { id: 9, link: 'headOfDepartmentWork', name: 'اعمال عميد الكلية' },
  { id: 10, link: 'advisorWork', name: 'اعمال الاشراف' },
];

function DoctorMenu() {
  

  return (
    <div className="flex justify-end items-center h-screen text-sm">
      <table className="w-[260px]  bg-darkBlue text-white">
        <tbody className="text-sm ">
          {item.map((item, index) => (
            <tr className="" key={index}>
              <td
                className="w-full px-3 py-5 flex items-center justify-center hover:text-cyan-300"
              >
                <Link href={`/doctor/${item.link}`}>{item.name}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

}

export default DoctorMenu;

