'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

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
const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // TODO if user isn't a doctor, throw an error, can be simplified mostly
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }

  const user = session.data?.user;


  return (
    <div className="flex w-[80%] absolute justify-center items-center mt-20">
      <table className=" text-sm  flex flex-row-reverse border border-gray-300 ">
        <thead>
          <tr className="flex flex-col bg-darkBlue text-secondary">
            {stuInfo.map((title, index) => (
              <th className="border border-gray-300 px-4 py-2" key={index}>
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="flex flex-col border border-gray-300 w-[600px] ">
            <td className="border border-gray-300 px-4 py-2 ">{user?.name}</td>
            <td className="border border-gray-300 px-4 py-2">{user?.surname}</td>
            <td className="border border-gray-300 px-4 py-2">{user?.birth_date}</td>
            <td className="border border-gray-300 px-4 py-2">{user?.major}</td>
            <td className="border border-gray-300 px-4 py-2">{user?.address}</td>
            <td className="border border-gray-300 px-4 py-2">{user?.phone}</td>
            <td className="border border-gray-300 px-4 py-2">{user?.email}</td>
            <td className="border border-gray-300 px-4 py-2">{user?.enrollment_date}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Page;
