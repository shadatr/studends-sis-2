'use client';
import { AdminStaffType, GetPermissionType } from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import SearchBar from '@/app/components/searchBar';
import { redirect } from 'next/navigation';

const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [refresh, setRefresh] = useState(false);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [staff, setStaff] = useState<AdminStaffType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const message: GetPermissionType[] = response.data.message;
      setPerms(message);

      axios.get('/api/getAll/getAllStaff').then((res) => {
        const message: AdminStaffType[] = res.data.message;
        setStaff(message);
      });
    };

    fetchPosts();
  }, [user?.id, refresh]);

  const handleActivate = (adminId: number, active: boolean) => {
    const data = { adminId, active };
    axios.post('/api/active/staffActive', data).then((res) => {
      toast.success(res.data.message);
      setRefresh(!refresh);
    });
  };

  return (
    <div className="flex absolute flex-col w-[80%] justify-center items-center">
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 3 && permItem.active) {
          return (
            <Link
              key={idx}
              className="bg-green-500 hover:bg-green-600 p-1 rounded-md text-white mt-20 justify-center flex w-[15%] text-sm items-center"
              href="/management/managers/register"
            >
              سجل موظف جديد
            </Link>
          );
        }
        return null;
      })}
      <SearchBar />
      <table className="border-collapse mt-8 w-[1000px]">
        <thead>
          <tr className="bg-gray-200">
            {perms.map((permItem, idx) => {
              if (permItem.permission_id === 3 && permItem.active) {
                return (
                  <th key={idx} className="border border-gray-300 px-4 py-2">
                    ايقاف/تفعيل
                  </th>
                );
              }
              return null;
            })}
            <th className="border border-gray-300 px-4 py-2">
              المعلومات الشخصية
            </th>
            <th className="border border-gray-300 px-4 py-2">تاريخ الانشاء</th>
            <th className="border border-gray-300 px-4 py-2">لقب</th>
            <th className="border border-gray-300 px-4 py-2">اسم</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((user, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
              {perms.map((permItem, idx) => {
                if (permItem.permission_id === 3 && permItem.active) {
                  return (
                    <td className="border border-gray-300 px-4 py-2" key={idx}>
                      <button
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
                    </td>
                  );
                }
                return null;
              })}
              <td className="border border-gray-300 px-4 py-2">
                <Link
                  href={`/management/personalInformation/admin/${user.id}`}
                  className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md justify-center items-center"
                >
                  الملف الشخصي
                </Link>
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
