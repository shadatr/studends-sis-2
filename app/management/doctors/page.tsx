'use client';
import { DoctorsWithDepartmentsType } from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const Page = () => {
  const [doctors, setDoctors] = useState<DoctorsWithDepartmentsType[]>([]);

  useEffect(() => {
    axios.get('/api/getAllDoctors').then((res) => {
      console.log(res.data);
      const message: DoctorsWithDepartmentsType[] = res.data.message;
      setDoctors(message);
    });
  });

  return (
    <div>
      <div className='w-[80%] flex flex-col fixed justify-end'>

      <Link className='btn_base mt-20 w-[200px] mb-3' href={'/management/doctors/register'}>اضافة عضو</Link>
      <table className="border-collapse w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">اسم</th>
            <th className="border border-gray-300 px-4 py-2">لقب</th>
            <th className="border border-gray-300 px-4 py-2">تاريخ الانشاء</th>
            <th className="border border-gray-300 px-4 py-2">رئيس قسم</th>
            </tr>
        </thead>
        <tbody>
          {doctors.map((user, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
              <td className="border border-gray-300 px-4 py-2">{user.name}</td>
              <td className="border border-gray-300 px-4 py-2">{user.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                {user.doctorSince}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {user.department? user.department.name : (
                  <button className='bg-green-500 hover:bg-green-600 px-5 py-1 rounded-md text-white'>تعين</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

    </div>
  );
};

export default Page;
