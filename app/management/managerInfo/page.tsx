'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';



const stuInfo = [
  'الاسم',
  'اللقب',
  'تاريخ الميلاد',
  'عنوان السكن',
  'رقم الهاتف',
  'الايميل',
  'تاريخ التسجيل',
];

const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;


  const titles = stuInfo.map((title, index) => (
    <td className="flex justify-center p-2 items-center text-right" key={index} >
      {title}
    </td>
  ));
  const data = (
    <tr key={1} className="flex flex-col">
      <td className="p-2" >
        {user?.name ? user.name : 'غير محدد'}
      </td>
      <td className="p-2" >
        {user?.surname ? user.surname : 'غير محدد'}
      </td>
      <td className="p-2" >
        {user?.birth_date ? user.birth_date : 'غير محدد'}
      </td>
      <td className="p-2" >
        {user?.address ? user.address : 'غير محدد'}
      </td>
      <td className="p-2" >
        {user?.phone ? user.phone : 'غير محدد'}
      </td>
      <td className="p-2" >
        {user?.email ? user.email : 'غير محدد'}
      </td>
      <td className="p-2" >
        {user?.enrollment_date ? user.enrollment_date : 'غير محدد'}
      </td>
    </tr>
  );

  return (
    <table className="fixed flex text-sm w-[800px] top-[300px] right-[500px]">
      <tr className="w-full">{data}</tr>
      <tr className="w-1/4 bg-darkBlue text-secondary">{titles}</tr>
    </table>
  );
};

export default Page;
