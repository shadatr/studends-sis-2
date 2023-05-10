import React from "react";
import Link from "next/link";

interface Item {
  id: number;
  name: string;
  link: string;
}

const item: Item[] = [
  { id: 1, link: "announcments", name: "الإعلانات" },
  { id: 2, link: "studentInfo", name: "بيانات الطالب" },
  { id: 3, link: "courses", name: "المواد الدراسية" },
  { id: 4, link: "courseProg", name: "جدول المحاضرات" },
  { id: 5, link: "files", name: "الملفات" },
  { id: 6, link: "examProg", name: "جدول الامتحانات" },
  { id: 7, link: "examRes", name: "نتائج الامتحانات" },
  { id: 8, link: "attendance", name: "الحضور" },
  { id: 9, link: "courseReg", name: "تنزيل المواد" },
];

function Menu() {
  const data = item.map((i) => (
    <tr key={i.id}>
      <td className="flex p-2 items-center justify-center hover:text-[23px] hover:text-cyan-300">
        <Link
          href={`/student/${i.link}`}
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

export default Menu;