/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PersonalInfoHeaderType, PersonalInfoType } from '@/app/types/types';

const doctorInfo: PersonalInfoHeaderType[] = [
  { header: 'الاسم' },
  { header: 'اللقب' },
  { header: 'تاريخ الميلاد' },
  { header: 'التخصص' },
  { header: 'عنوان السكن' },
  { header: 'رقم الهاتف' },
  { header: 'الايميل' },
  { header: 'تاريخ التسجيل' },
];

const page = ({ params }: { params: { id: number } }) => {
  const [useMyData, useSetMydata] = useState<PersonalInfoType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get(`/api/personalInfo/${params.id}/doctor`).then((resp) => {
        console.log(resp.data);
        const message: PersonalInfoType[] = resp.data.message;
        useSetMydata(message);
      });
    };

    fetchPosts();
  }, [params.id]);
  const titles = doctorInfo.map((title, index) => (
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
        {item.major}
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
    <table className="flex absolute text-sm w-[800px] top-[200px] right-[500px]">
      <tr className="w-full">{data}</tr>
      <tr className="w-1/4 bg-darkBlue text-secondary">{titles}</tr>
    </table>
  );
};

export default page;
