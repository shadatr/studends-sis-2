import React from "react";
import Link from "next/link";

interface Item {
  id: number;
  name: string;
  link: string;
}

const item: Item[] = [
  { id: 1, link: "annoucments", name: "الإعلانات" },
  { id: 2, link: "studentInfo", name: "بيانات الطالب" },
  { id: 3, link: "courses", name: "المواد الدراسية" },
  { id: 4, link: "courseProg", name: "جدول المحاضرات" },
  { id: 5, link: "files", name: "الملفات" },
  { id: 6, link: "examProg", name: "جدول الامتحانات" },
  { id: 7, link: "examRes", name: "نتائج الامتحانات" },
  { id: 8, link: "attendance", name: "الحضور" },
  { id: 9, link: "courseReg", name: "تنزيل المواد" },
];

const Menu = () => {
  const items = item.map((i) => (
    <Link
      href={`/student/${i.link}`}
      className="flex justify-between items-center p-1   "
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
};

export default Menu;
