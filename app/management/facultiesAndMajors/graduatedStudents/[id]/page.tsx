'use client';
import { GetPermissionType, PersonalInfoType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;
  const [refresh, setRefresh] = useState(false);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [students, setStudents] = useState<PersonalInfoType[]>([]);
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const message: GetPermissionType[] = response.data.message;
      setPerms(message);

    };

    fetchPosts();
  }, [user, refresh, params]);

  const handleActivate = (studentId: number, active: boolean) => {
    const data = { studentId, active };
    axios.post('/api/active/studentActive', data).then((res) => {
      toast.success(res.data.message);
      setRefresh(!refresh);
    });
  };

  const handleSubmit=()=>{
    axios
      .get(`/api/major/graduatedStudents/${params.id}/${semester}-${year}`)
      .then((resp) => {
        const message: PersonalInfoType[] = resp.data.message;
        setStudents(message);
      });
  };

  return (
    <div className="flex absolute flex-col justify-center items-center w-[80%]">
      <div className="flex flex-row m-5">
        <button
          onClick={handleSubmit}
          className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white w-[150px]"
        >
          بحث
        </button>
        <input
          dir="rtl"
          placeholder=" السنة"
          type="text"
          className="w-20 px-4 py-1 bg-gray-200 border-2 border-black rounded-md ml-4"
          onChange={(e) => setYear(e.target.value)}
        />
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setSemester(e.target.value)}
          className="px-4 py-1 bg-gray-200 border-2 border-black rounded-md ml-4"
          defaultValue="الفصل"
        >
          <option disabled>الفصل</option>
          <option>خريف</option>
          <option>ربيع</option>
        </select>
      </div>
      <table className="border-collapse mt-8 w-[1100px]">
        <thead>
          <tr className="bg-gray-200">
            {perms.map((permItem, idx) => {
              if (permItem.permission_id === 5 && permItem.active) {
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
          {students ? (
            students.map((user, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                {perms.map((permItem, idx) => {
                  if (permItem.permission_id === 5 && permItem.active) {
                    return (
                      <td
                        className="border border-gray-300 px-4 py-2"
                        key={idx}
                      >
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
                <td className="border border-gray-300 px-4 py-2">
                  {user.name}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border border-gray-300 px-4 py-2">لا يوجد طلاب</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Page;