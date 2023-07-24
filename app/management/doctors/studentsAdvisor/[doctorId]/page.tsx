'use client';
import React, { useEffect, useState } from 'react';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {
  MajorRegType,
  InfoDoctorType,
  GetPermissionType,
  PersonalInfoType,
} from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';

const Page = ({ params }: { params: { doctorId: number } }) => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [doctors, setDoctors] = useState<InfoDoctorType[]>([]);
  const [students, setStudents] = useState<PersonalInfoType[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<MajorRegType>();

  const user = session.data?.user;

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get('/api/major/getMajors').then((resp) => {
        console.log(resp.data);
        const message: MajorRegType[] = resp.data.message;
        setMajors(message);

      });
      axios
        .get(`/api/advisor/assignAdvisor/${params.doctorId}`)
        .then(async (resp) => {
          const message: PersonalInfoType[] = resp.data.message;
          setStudents(message);
        });
    };
    fetchPosts();
  }, []);

  const handleSearch = async () => {
    const response = await axios.get(
      `/api/allPermission/admin/selectedPerms/${user?.id}`
    );
    const message: GetPermissionType[] = response.data.message;
    setPerms(message);

    axios.get(`/api/major/majorStudents/${selectedMajor?.id}`).then((resp) => {
      const message: PersonalInfoType[] = resp.data.message;
      setStudents(message);
    });

    axios.get('/api/getAll/doctor').then((res) => {
      console.log(res.data);
      const message: InfoDoctorType[] = res.data.message;
      setDoctors(message);
    });
  };

  const handleSubmit = () => {
    checked.map((item) => {
      const data = {
        id: item,
        advisor: params.doctorId,
      };
      axios
        .post('/api/advisor/assignAdvisor/1', data)
        .then((res) => {
          toast.success(res.data.message);
          handleSearch();
          const dataUsageHistory = {
            id: user?.id,
            type: 'admin',
            action:
              ' تعديل الاشراف لدكتور' +
              doctors.find((doc) => params.doctorId == doc.id)?.name,
          };
          axios.post('/api/usageHistory', dataUsageHistory);
        })
        .catch((err) => {
          toast.error(err.response.data.message);
        });
    });
  };

  const handleCheck = (item: PersonalInfoType) => {
    const checkedIndex = checked.indexOf(item.id);
    if (checkedIndex === -1) {
      setChecked([...checked, item.id]);
    } else {
      const updatedChecked = [...checked];
      updatedChecked.splice(checkedIndex, 1);
      setChecked(updatedChecked);
    }
  };

  return (
    <div className="flex absolute flex-col w-[80%]">
      <div className="flex flex-row m-5">
        <button
          onClick={handleSearch}
          className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white w-[150px]"
        >
          بحث
        </button>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => {
            const maj = majors.find((i) => i.major_name === e.target.value);
            setSelectedMajor(maj);
          }}
          className="px-2  bg-gray-200 border-2 border-black rounded-md ml-4 w-[200px]"
        >
          <option>اختر التخصص</option>
          {majors.map((item) => (
            <option key={item.id}>{item.major_name}</option>
          ))}
        </select>
      </div>
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 2 && permItem.edit) {
          return (
            <button
              key={idx}
              onClick={handleSubmit}
              className="w-[200px] text-sm bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md flex justify-center items-center m-5"
            >
              عين الدكتور كمشرف
            </button>
          );
        }
        return null;
      })}
      <table className="border-collapse mt-8">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">اختر</th>
            <th className="border border-gray-300 px-4 py-2">المشرف</th>
            <th className="border border-gray-300 px-4 py-2">
              المعلومات الشخصية
            </th>
            <th className="border border-gray-300 px-4 py-2"> التخصص</th>
            <th className="border border-gray-300 px-4 py-2">لقب</th>
            <th className="border border-gray-300 px-4 py-2">اسم</th>
          </tr>
        </thead>
        {students ? (
          <tbody>
            {students.map((student, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    className="p-2 ml-9"
                    type="checkbox"
                    onChange={() => handleCheck(student)}
                    checked={checked.includes(student.id)}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.advisor
                    ? doctors.find((doc) => student.advisor == doc.id)?.name
                    : 'لا يوجد'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <Link
                    href={`/management/personalInformation/student/${student.id}`}
                    className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md justify-center items-center"
                  >
                    الملف الشخصي
                  </Link>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.major}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.surname}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.name}
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          <div className="h-full flex justify-center items-center w-full">
            <h1 className="flex flex-row justify-center items-center text-2xl">
              لا يوجد طلاب
            </h1>
          </div>
        )}
      </table>
    </div>
  );
};

export default Page;
