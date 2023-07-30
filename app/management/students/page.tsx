'use client';

import React, { useEffect, useState } from 'react';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {
  MajorRegType,
  GetPermissionType,
  PersonalInfoType,
} from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SearchBar from '@/app/components/searchBar';
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';

const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [selectedMajor, setSelectedMajor] = useState<string>();
  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [students, setStudents] = useState<PersonalInfoType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const responsePer = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const messagePer: GetPermissionType[] = responsePer.data.message;
      setPerms(messagePer);


      axios.get('/api/major/getMajors').then((resp) => {
        const message: MajorRegType[] = resp.data.message;
        setMajors(message);
      });

      
    };
    fetchPosts();
  }, [user, refresh]);

  const handleMajor = () => {
    if (selectedMajor != 'جميع الطلاب' && selectedMajor) {
      axios
        .get(`/api/major/majorStudents/${parseInt(selectedMajor)}}`)
        .then((resp) => {
          const message: PersonalInfoType[] = resp.data.message;
          setStudents(message);
        });
    } else {
      axios.get('/api/getAll/student').then((resp) => {
        const message: PersonalInfoType[] = resp.data.message;
        setStudents(message);
      });
    }
  };

  const handleActivate = (studentId: number, active: boolean) => {
    const data = { studentId, active };
    axios.post('/api/active/studentActive', data).then((res) => {
      const dataUsageHistory = {
        id: user?.id,
        type: 'admin',
        action: ' تغيير حالة الطلبة',
      };
      axios.post('/api/usageHistory', dataUsageHistory);
      toast.success(res.data.message);
      setRefresh(!refresh);
    });
  };

  return (
    <div className="flex absolute flex-col justify-center items-center w-[80%] mt-10">
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 1 && permItem.see) {
          return (
            <div key={idx}>
              {perms.map((permItem, idx) => {
                if (permItem.permission_id === 1 && permItem.add) {
                  return (
                    <div
                      className="flex flex-row items-center justify-between w-[900px] text-sm"
                      key={idx}
                    >
                      <Link
                        className="bg-green-700 hover:bg-green-600 px-5 py-1 rounded-md text-white"
                        href={'/management/students/register'}
                      >
                        سجل طالب جديد
                      </Link>
                    </div>
                  );
                }
                return null;
              })}
              <SearchBar />
              <button
                onClick={handleMajor}
                className="bg-green-700 m-2 hover:bg-green-600 lg:p-3 sm:p-1 rounded-md text-white lg:w-[150px] sm:w-[60px]"
              >
                بحث
              </button>
              <select
                id="dep"
                dir="rtl"
                onChange={(e) => {
                  setSelectedMajor(e.target.value);
                }}
                className="lg:px-2 sm:p-1  bg-gray-200 border-2 border-black rounded-md ml-4 lg:w-[200px] sm:w-[100px]"
              >
                <option>اختر التخصص</option>
                <option>جميع الطلاب</option>
                {majors.map((item) => (
                  <option key={item.id}>{item.major_name}</option>
                ))}
              </select>
              {selectedMajor && selectedMajor != 'جميع الطلاب' && (
                <Link
                  className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white lg:w-[200px] sm:w-[80px]"
                  href={`/management/students/graduatedStudents/${parseInt(
                    selectedMajor
                  )}`}
                >
                  الخرجين
                </Link>
              )}

              <table className="border-collapse mt-8 w-[1100px]">
                <thead>
                  <tr className="bg-gray-200">
                    {perms.map((permItem, idx) => {
                      if (permItem.permission_id === 1 && permItem.edit) {
                        return (
                          <th
                            key={idx}
                            className="border border-gray-300 px-4 py-2"
                          >
                            ايقاف/تفعيل
                          </th>
                        );
                      }
                      return null;
                    })}
                    <th className="border border-gray-300 px-4 py-2">
                      المعلومات الشخصية
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      تاريخ الانشاء
                    </th>
                    <th className="border border-gray-300 px-4 py-2">لقب</th>
                    <th className="border border-gray-300 px-4 py-2">اسم</th>
                    <th className="border border-gray-300 px-4 py-2">
                      رقم الطالب
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      {' '}
                      التخصص
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students ? (
                    students.map((user, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-gray-100' : ''}
                      >
                        {perms.map((permItem, idx) => {
                          if (permItem.permission_id === 1 && permItem.edit) {
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
                        <td className="border border-gray-300 px-4 py-2">
                          {user.number}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {majors.find((m) => m.id == user.major)?.major_name}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        لا يوجد طلاب
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default Page;
