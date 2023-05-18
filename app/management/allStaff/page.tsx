'use client';
import { AdminStaffType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }

  const [refresh, setRefresh] = useState(false);

  const [staff, setStaff] = useState<AdminStaffType[]>([]);
  useEffect(() => {
    // * interesting one
    // document.title = 'الموظفين';
    axios.get('/api/getAllStaff').then((res) => {
      const message: AdminStaffType[] = res.data.message;
      setStaff(message);
    });
  }, [refresh]);

  const handleactivate = (adminId: number, active: boolean) => {
    const data = { adminId, active };
    axios.post('/api/staffActive', data).then((res) => {
      toast.success(res.data.message);
      setRefresh(!refresh);
    });
  };

  return (
    <table className="border-collapse w-[80%] fixed mt-20">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 px-4 py-2">اسم</th>
          <th className="border border-gray-300 px-4 py-2">لقب</th>
          <th className="border border-gray-300 px-4 py-2">تاريخ الانشاء</th>
          <th className="border border-gray-300 px-4 py-2">مدير النظام</th>
          <th className="border border-gray-300 px-4 py-2">تعديل الصلاحيات</th>
          <th className="border border-gray-300 px-4 py-2">ايقاف/تفعيل</th>
        </tr>
      </thead>
      <tbody>
        {staff.map((user, index) => (
          <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
            <td className="border border-gray-300 px-4 py-2">{user.name}</td>
            <td className="border border-gray-300 px-4 py-2">{user.surname}</td>
            <td className="border border-gray-300 px-4 py-2">
              {user.createdAt}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {user.admin ? 'Yes' : 'No'}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              <button className="btn_base hover:bg-blue-900 text-white py-1 px-2 rounded">
                تعديل الصلاحيات
              </button>
            </td>
            <td className="border border-gray-300 px-4 py-2">
              <button
                onClick={() => {
                  handleactivate(user.id, !user.active);
                }}
                className={`text-white py-1 px-2 rounded ${
                  user.active
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {user.active ? 'ايقاف' : 'تفعيل'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Page;
