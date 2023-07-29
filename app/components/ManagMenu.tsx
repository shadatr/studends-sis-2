import React from 'react';
import Link from 'next/link';

import { MenuItemType } from '../types/types';

const item: MenuItemType[] = [
  { id: 1, link: 'announcements', name: 'الإعلانات' },
  { id: 2, link: 'students', name: 'الطلاب' },
  { id: 3, link: 'doctors', name: ' اعضاء هيئة التدريس' },
  { id: 4, link: 'managers', name: 'موظفين الادارة' },
  { id: 7, link: 'semesterManagement', name: 'ادارة الفصل الدراسي ' },
  { id: 9, link: 'reports', name: 'التقارير' },
];

function ManagMenu() {
  return (
    <div className="flex justify-end items-center h-screen text-sm">
      <table className="w-[260px]  bg-darkBlue text-white">
        <tbody>
          {item.map((item, index) => (
            <tr className="flex flex-col" key={index}>
              <td className="w-full h-[60px] p-3 flex items-center justify-center hover:text-cyan-300">
                <Link href={`/management/${item.link}`}>{item.name}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManagMenu;
