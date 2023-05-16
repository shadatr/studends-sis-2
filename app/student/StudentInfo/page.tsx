'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

const stuInfo = [
  'الاسم',
  'اللقب',
  'تاريخ الميلاد',
  'التخصص',
  'الفصل الدراسي',
  'عنوان السكن',
  'رقم الهاتف',
  'الايميل',
  'تاريخ التسجيل',
  'المشرف',
];

const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a student, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    throw new Error('Unauthorized');
  }

  const user = session.data?.user;

  const titles = stuInfo.map((title, index) => (
    <td className="flex justify-center p-2 items-center text-right" key={index}>
      {title}
    </td>
  ));
  const data = (
    <tr key={1} className="flex flex-col">
      <td className="p-2">{user?.name ? user?.name : 'غير محدد'}</td>
      <td className="p-2">{user?.surname ? user?.surname : 'غير محدد'}</td>
      <td className="p-2">
        {user?.birth_date ? user?.birth_date : 'غير محدد'}
      </td>
      <td className="p-2">to be integrated</td>
      <td className="p-2">{user?.semester ? user.semester : 'غير محدد'}</td>
      <td className="p-2">{user?.address ? user?.address : 'غير محدد'}</td>
      <td className="p-2">{user?.phone ? user?.phone : 'غير محدد'}</td>
      <td className="p-2">{user?.email ? user?.email : 'غير محدد'}</td>
      <td className="p-2">
        {user?.enrollment_date ? user?.enrollment_date : 'غير محدد'}
      </td>
      <td className="p-2">to be integrated</td>
    </tr>
  );

  return (
    <table className="fixed flex text-sm w-[800px] top-[200px] right-[500px]">
      <tr className="w-full">{data}</tr>
      <tr className="w-1/4 bg-darkBlue text-secondary">{titles}</tr>
    </table>
  );
};

export default Page;
