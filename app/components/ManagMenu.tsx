import React from 'react';
import Link from 'next/link';

import { MenuItemType } from '../types/types';


const item: MenuItemType[] = [
  { id: 1, link: 'announcements', name: 'الإعلانات' },
  { id: 2, link: 'students', name: 'الطلاب' },
  { id: 3, link: 'doctors', name: ' اعضاء هيئة التدريس' },
  { id: 4, link: 'managers', name: 'موظفين الادارة' },
  { id: 5, link: 'courseReg', name: 'تنزيل المواد' },
];


function ManagMenu() {
  const data = item.map((i) => (
    <tr key={i.id}>
      <td className="flex p-5 items-center justify-center hover:text-[23px] hover:text-cyan-300">
        <Link
          href={`/management/${i.link}`}
          className="flex justify-between items-center p-1   "
          key={i.id}
        >
          {i.name}
        </Link>
      </td>
    </tr>
  ));

    return (
      <div className="  flex justify-end  text-sm ">
        <table className=" text-sm flex flex-col mt-[150px] w-[260px] bg-darkBlue text-white ">
          {data}
        </table>
      </div>
    );
}

export default ManagMenu;
