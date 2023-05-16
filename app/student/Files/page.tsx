'use client';
import { useSession } from 'next-auth/react';
import React from 'react';

interface Item {
  id: number;
  name: string;
}

const courseNames: Item[] = [
  { id: 1, name: 'اسم المادة' },
  { id: 2, name: 'اسم المادة' },
  { id: 3, name: 'اسم المادة' },
  { id: 4, name: 'اسم المادة' },
  { id: 5, name: 'اسم المادة' },
  { id: 6, name: 'اسم المادة' },
];

const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a student, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    throw new Error('Unauthorized');
  }
  const courses = courseNames.map((course) => (
    <td key={course.id} className="bg-lightBlue p-2">
      {course.name}
    </td>
  ));

  return (
    <table className="flex fixed flex-col w-[600px] text-sm right-[564px] top-[250px]">
      <th className="bg-darkBlue text-secondary p-2">اسم المادة</th>

      {courses}
    </table>
  );
};

export default Page;
