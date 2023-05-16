'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

import { PersonalInfoHeaderType, PersonalInfoType } from '../../types/types';

const stuInfo: PersonalInfoHeaderType[] = [
  { header: 'الاسم' },
  { header: 'اللقب' },
  { header: 'تاريخ الميلاد' },
  { header: 'عنوان السكن' },
  { header: 'رقم الهاتف' },
  { header: 'الايميل' },
  { header: 'تاريخ التسجيل' },
];

const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }
  
  const [useMyData, useSetMydata] = useState<PersonalInfoType[]>([]);
  // handling authentication
  useEffect(() => {
    const fetchPosts = async () => {
      axios.get(`/api/personalInfo/9/manager`).then((resp) => {
        console.log(resp.data);
        const message: PersonalInfoType[] = resp.data.message;
        useSetMydata(message);
      });
    };

    fetchPosts();
  }, []);
  const titles = stuInfo.map((title, index) => (
    <td className="flex justify-center p-2 items-center text-right" key={index}>
      {title.header}
    </td>
  ));
  const data = useMyData.map((item, index) => (
    <tr key={1} className="flex flex-col">
      <td className="p-2" key={index}>
        {item.name}
      </td>
      <td className="p-2" key={index}>
        {item.surname}
      </td>
      <td className="p-2" key={index}>
        {item.birth_date}
      </td>
      <td className="p-2" key={index}>
        {item.address}
      </td>
      <td className="p-2" key={index}>
        {item.phone}
      </td>
      <td className="p-2" key={index}>
        {item.email}
      </td>
      <td className="p-2" key={index}>
        {item.enrollment_date}
      </td>
    </tr>
  ));

  return (
    <table className="fixed flex text-sm w-[800px] top-[300px] right-[500px]">
      <tr className="w-full">{data}</tr>
      <tr className="w-1/4 bg-darkBlue text-secondary">{titles}</tr>
    </table>
  );
};

export default Page;
