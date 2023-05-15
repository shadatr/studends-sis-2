'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface Item {
  name: string;
  dr: string;
  hours: number;
  credit: number;
}

const courses: Item[] = [
  {
    name: 'اسم المادة',
    dr: 'د. اسم',
    hours: 6,
    credit: 3,
  },
  {
    name: 'اسم المادة',
    dr: 'د. اسم',
    hours: 6,
    credit: 3,
  },
  {
    name: 'اسم المادة',
    dr: 'د. اسم',
    hours: 6,
    credit: 3,
  },
  {
    name: 'اسم المادة',
    dr: 'د. اسم',
    hours: 6,
    credit: 3,
  },
  {
    name: 'اسم المادة',
    dr: 'د. اسم',
    hours: 6,
    credit: 3,
  },
];

const title: string[] = ['كرديت', 'عدد الساعات', 'الدكتور', 'اسم المادة'];

const Page = () => {
  useSession({required : true, onUnauthenticated() {
    redirect("/login/student");
  },});

  const info = courses.map((course, index) => (
    <tr key={index}>
      <td className="p-3 pr-6">{course.credit}</td>
      <td className="p-3 pr-6">{course.hours}</td>
      <td className="p-3 pr-6">{course.dr}</td>
      <td className="p-3 pr-6">{course.name}</td>
    </tr>
  ));
  const titles = title.map((item, index) => (
    <th key={index} className="p-3 pr-6 bg-darkBlue text-secondary">{item}</th>
  ));
  return (
    <table className=" w-[1000px] h-[400px] text-sm fixed top-[220px] right-[400px]">
      <tr>{titles}</tr>
      {info}
    </table>
  );
};

export default Page;
