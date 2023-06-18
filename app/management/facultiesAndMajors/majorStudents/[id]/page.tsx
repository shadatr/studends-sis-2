'use client';
import { GetPermissionType, PersonalInfoType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }

  const user = session.data?.user;
  const [refresh, setRefresh] = useState(false);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);

    const [students, setStudents] = useState<PersonalInfoType[]>([]);

    useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const message: GetPermissionType[] = response.data.message;
      setPerms(message);
      console.log(message);
    };

    fetchPosts();
  }, [user?.id]);

  const handleActivate = (studentId: number, active: boolean) => {
    const data = { studentId, active };
    axios.post('/api/active/studentActive', data).then((res) => {
      toast.success(res.data.message);
      setRefresh(!refresh);
    });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get(`/api/list/${params.id}/student`).then((resp) => {
        console.log(resp.data);
        const message: PersonalInfoType[] = resp.data.message;
        setStudents(message);
      });
    };
    fetchPosts();
  }, [params.id, refresh]);


  const noStudents = (
    <div className='h-full flex justify-center items-center w-full'>
      <h1 className="flex flex-row justify-center items-center text-2xl">
        لا يوجد طلاب
      </h1>
    </div>
  );
  return (
  <div className="flex absolute flex-col w-[80%]">
    <table className="border-collapse mt-8">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 px-4 py-2">ايقاف/تفعيل</th>
          <th className="border border-gray-300 px-4 py-2">
            المعلومات الشخصية
          </th>
          <th className="border border-gray-300 px-4 py-2">تاريخ الانشاء</th>
          <th className="border border-gray-300 px-4 py-2">لقب</th>
          <th className="border border-gray-300 px-4 py-2">اسم</th>
        </tr>
      </thead>
      {students? (<tbody>
        {students.map((user, index) => (
          <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
            <td className="border border-gray-300 px-4 py-2">
              {perms.map((item, idx) => {
                if (item.permission_id === 5 && item.active) {
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
                } else if (item.permission_id == 5 && item.active== false) {
                  return user.active ? 'موقف' : 'مفعل';
                }
              })}
            </td>

            <td className="border border-gray-300 px-4 py-2">
              <Link
                href={`/management/personalInformation/student/${user.id}`}
                className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md justify-center items-center"
              >
                الملف الشخصي
              </Link>
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {user.enrollment_date}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {user.surname}
            </td>
            <td className="border border-gray-300 px-4 py-2">{user.name}</td>
          </tr>
        ))}
      </tbody>): noStudents}
      
    </table>
  </div>
);
};


export default Page;


