'use client';
import Link from 'next/link';
import { VscThreeBars } from 'react-icons/vsc';
import React, { useState } from 'react';

import { MenuItemType } from '../types/types';

const item: MenuItemType[] = [
  { id: 1, link: 'announcements', name: 'الإعلانات' },
  { id: 3, link: 'courses-and-grades', name: 'المواد و الدرجات' },
  { id: 4, link: 'courseProg', name: 'جدول المحاضرات' },
  { id: 6, link: 'examProg', name: 'جدول الامتحانات' },
  { id: 9, link: 'head-of-department-work', name: 'اعمال عميد الكلية' },
  { id: 10, link: 'advisorWork', name: 'اعمال الاشراف' },
];
function DoctorMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* First div - Visible on sm screens */}
      <div >
        <div className="lg:flex lg:right-0 items-center  lg:absolute text-sm sm:hidden lg:mt-20">
          <table className="w-[260px] bg-darkBlue text-white">
            <tbody className="text-sm">
              {item.map((item, index) => (
                <tr className="" key={index}>
                  <td className="w-full px-3 py-5 flex items-center justify-center hover:text-cyan-300">
                    <Link href={`/doctor/${item.link}`} key={index}>
                      {item.name}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="relative lg:hidden">
        <div className="absolute top-0 right-0 p-4">
          <button onClick={toggleDropdown} className="p-3">
            <VscThreeBars />
          </button>
          {isOpen && (
            <div className="absolute top-0 right-0 mt-12 py-2 bg-white border rounded shadow-lg text-[13px] w-[150px]">
              {item.map((item, index) => (
                <Link
                  key={index}
                  onClick={() => setIsOpen(false)}
                  href={`/doctor/${item.link}`}
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorMenu;
