'use client';
import { AdminStaffType, GetPermissionType } from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useSession } from 'next-auth/react';



const Page = () => {

  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }
  const user = session.data?.user;


  const [refresh, setRefresh] = useState(false);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/allPermission/selectedPerms/${user?.id}`
      );
      const message: GetPermissionType[] = response.data.message;
      setPerms(message);
      console.log(message);
    };

    fetchPosts();
  }, [user?.id]);


  const [staff, setStaff] = useState<AdminStaffType[]>([]);
  useEffect(() => {
    axios.get('/api/getAllStaff').then((res) => {
      const message: AdminStaffType[] = res.data.message;
      setStaff(message);
    });
  }, [refresh]);

  const handleActivate = (adminId: number, active: boolean) => {
    const data = { adminId,  active };
    axios.post('/api/active/staffActive', data).then((res) => {
      toast.success(res.data.message);
      setRefresh(!refresh);
    });
  };

  return (
  <div className="flex absolute flex-col w-[80%]">
    {perms.map((item, index) =>
        item.permission_id== 11 && item.active? (<Link
        key={index}
      className="bg-green-500 hover:bg-green-600 p-1 rounded-md text-white mt-20 justify-center flex w-[15%] text-sm items-center"
      href="/management/managers/register"
    >
      سجل موظف جديد
    </Link>): " " )}
    
    <table className="border-collapse mt-8">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 px-4 py-2">ايقاف/تفعيل</th>
          <th className="border border-gray-300 px-4 py-2">
            المعلومات الشخصية
          </th>
          <th className="border border-gray-300 px-4 py-2">مدير النظام</th>
          <th className="border border-gray-300 px-4 py-2">تاريخ الانشاء</th>
          <th className="border border-gray-300 px-4 py-2">لقب</th>
          <th className="border border-gray-300 px-4 py-2">اسم</th>
        </tr>
      </thead>
      <tbody>
        {staff.map((user, index) => (
          <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
            <td className="border border-gray-300 px-4 py-2">
              {perms.map((item, idx) => {
                if (item.permission_id === 3 && item.active) {
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        handleActivate(user.id, !user.active);
                      }}
                      className={`text-white py-1 px-2 rounded ${
                        user.active
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {user.active ? 'ايقاف' : 'تفعيل'}
                    </button>
                  );
                } else if (item.permission_id === 3 && item.active== false) {
                  return user.active ? 'موقف' : 'مفعل';
                }
              })}
            </td>

            <td className="border border-gray-300 px-4 py-2">
              <Link
                href={`/management/personalInformation/admin/${user.id}`}
                className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md justify-center items-center"
              >
                الملف الشخصي
              </Link>
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {user.admin ? 'Yes' : 'No'}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {user.createdAt}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {user.surname}
            </td>
            <td className="border border-gray-300 px-4 py-2">{user.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
};

export default Page;
