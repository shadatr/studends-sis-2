import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React from 'react';

interface Item {
  id: number;
  h1: string;
  h2: string;
}

const stuInfo: Item[] = [
  { id: 1, h1: 'الاسم', h2: 'الاسم' },
  { id: 2, h1: 'تاريخ الميلاد', h2: '03.11.2000' },
  { id: 3, h1: 'التخصص', h2: 'التخصص' },
  { id: 4, h1: 'رقم الطالب', h2: '456' },
  { id: 5, h1: 'عنوان السكن', h2: 'طرابلس' },
  { id: 6, h1: 'رقم الهاتف', h2: '345787' },
  { id: 7, h1: 'الايميل', h2: 'الايميل' },
  { id: 8, h1: 'الفصل الدراسي', h2: '4' },
  { id: 9, h1: 'تاريخ التسجيل', h2: '03.11.2000' },
];

const Page = () => {
  useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login/student');
    },
  });
  const info = stuInfo.map((user) => (
    <tr key={user.id}>
      <td className="bg-grey p-2">{user.h2}</td>
      <td className="bg-lightBlue p-2">{user.h1}</td>
    </tr>
  ));

  return (
    <table className=" w-[1000px] fixed right-[350px] top-[200px] text-sm ">
      {info}
    </table>
  );
};

export default Page;
