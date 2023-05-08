import React from 'react'
import Link from "next/link";

interface Item {
  id: number;
  name: string;
  link: string;
}

const item: Item[] = [
  { id: 1, link:"Annoucments", name: "الإعلانات" },
  { id: 2, link:"StudentInfo",name: "بيانات الطالب" },
  { id: 3, link:"Courses",name: "المواد الدراسية" },
  { id: 4, link:"CourseProg",name: "جدول المحاضرات" },
  { id: 5, link:"Files",name: "الملفات" },
  { id: 6, link:"ExamProg",name: "جدول الامتحانات" },
  { id: 7, link:"ExamRes",name: "نتائج الامتحانات" },
  { id: 8, link:"Attendance",name: "الحضور" },
  { id: 9, link:"CourseReg",name: "تنزيل المواد" },
];

const Menu = () => {
    const items = item.map((i) => (
      <Link
        
        href={`/student/${i.link}`}
        className="flex justify-between hover:text-lightBlue hover:text-md items-center p-1   "
        key={i.id}
      >
        {i.name}
      </Link>
    ));
    
    return (
      <div className="flex items-center justify-end pt-[100px]">
        <h1 className="w-[232px] bg-darkBlue text-secondary text-sm flex flex-col h-[400px] justify-between items-center  ">
          {items}
        </h1>
      </div>
    );

}

export default Menu
