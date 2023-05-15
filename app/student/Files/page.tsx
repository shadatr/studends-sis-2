import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React from 'react';

interface Item {
  id: number;
  name: string;
}


const courseNames: Item[] = [
  { id: 1, name: "اسم المادة" },
  { id: 2, name: "اسم المادة" },
  { id: 3, name: "اسم المادة" },
  { id: 4, name: "اسم المادة" },
  { id: 5, name: "اسم المادة" },
  { id: 6, name: "اسم المادة" },
];


const Page = () => {
  useSession({required : true, onUnauthenticated() {
    redirect("/login/student");
  },});
  
  
    const courses = courseNames.map((course) => (
      <td  key={course.id} className="bg-lightBlue p-2">{course.name}</td>
    ));

    return (
      <table className="flex fixed flex-col w-[600px] text-sm right-[564px] top-[250px]">
        <th className="bg-darkBlue text-secondary p-2">اسم المادة</th>

        {courses}
      </table>
    );
};

export default Page;
