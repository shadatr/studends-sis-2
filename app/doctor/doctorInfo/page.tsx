'use client';

import { useSession } from 'next-auth/react';

import { PersonalInfoHeaderType } from '../../types/types';

const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // TODO if user isn't a doctor, throw an error, can be simplified mostly
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }
  const stuInfo = [
    'الاسم',
    'اللقب',
    'تاريخ الميلاد',
    'التخصص',
    'عنوان السكن',
    'رقم الهاتف',
    'الايميل',
    'تاريخ التسجيل',
  ];

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
      <td className="p-2">
        {user?.speciality ? user?.speciality : 'غير محدد'}
      </td>
      <td className="p-2">{user?.address ? user?.address : 'غير محدد'}</td>
      <td className="p-2">{user?.phone ? user?.phone : 'غير محدد'}</td>
      <td className="p-2">{user?.email ? user?.email : 'غير محدد'}</td>
      <td className="p-2">{user?.enrollment_date}</td>
    </tr>
  );

  return (
    <table className="fixed flex text-sm w-[800px] top-[280px] right-[500px]">
      <tr className="w-full">{data}</tr>
      <tr className="w-1/4 bg-darkBlue text-secondary">{titles}</tr>
    </table>
  );
};

export default Page;
