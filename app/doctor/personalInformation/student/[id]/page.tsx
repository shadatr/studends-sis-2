'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AssignPermissionType,
  GetPermissionStudentType,
  PersonalInfoHeaderType,
  RegisterStudent2Type,
  InfoDoctorType,
} from '@/app/types/types';
import { toast } from 'react-toastify';
import { BsXCircleFill } from 'react-icons/bs';
import Link from 'next/link';
import Transcript from '@/app/components/transcript';

const stuInfo: PersonalInfoHeaderType[] = [
  { header: 'الاسم' },
  { header: 'اللقب' },
  { header: 'تاريخ الميلاد' },
  { header: 'التخصص' },
  { header: 'الفصل الدراسي' },
  { header: 'عنوان السكن' },
  { header: 'رقم الهاتف' },
  { header: 'الايميل' },
  { header: 'تاريخ التسجيل' },
  { header: 'المشرف' },
];

const Page = ({ params }: { params: { id: number } }) => {
  const [useMyData, setMydata] = useState<RegisterStudent2Type[]>([]);
  const [checkList, setCheckList] = useState<AssignPermissionType[]>([]);
  const [checked, setChecked] = useState<number[]>([]); // Change to an array
  const [perms, setPerms] = useState<GetPermissionStudentType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [doctors, setDoctors] = useState<InfoDoctorType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/allPermission/student');
        const message: AssignPermissionType[] = response.data.message;
        setCheckList(message);
        console.log(message);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      const response = await axios.get(
        `/api/allPermission/student/selectedPerms/${params.id}`
      );
      const message: GetPermissionStudentType[] = response.data.message;
      setPerms(message);
      console.log(message);

      axios.get(`/api/personalInfo/student/${params.id}`).then((resp) => {
        const message: RegisterStudent2Type[] = resp.data.message;
        setMydata(message);
      });

      axios.get('/api/getAll/getDoctorsHeadOfDep').then((res) => {
        console.log(res.data);
        const message: InfoDoctorType[] = res.data.message;
        setDoctors(message);
      });
    };
    fetchPosts();
  }, [refresh, params.id]);

  const handleCheck = (item: AssignPermissionType) => {
    const checkedIndex = checked.indexOf(item.id);
    if (checkedIndex === -1) {
      setChecked([...checked, item.id]);
    } else {
      const updatedChecked = [...checked];
      updatedChecked.splice(checkedIndex, 1);
      setChecked(updatedChecked);
    }
  };

  const selected: AssignPermissionType[] = perms.flatMap((item) =>
    checkList
      .filter((item2) => item.permission_id == item2.id)
      .map((item2) => ({ name: item2.name, id: item2.id, active: item.active }))
  );
  const handleDelete = (per_id: number, admin_id: number) => {
    const data = { permission_id: per_id, student_id: admin_id };
    axios.post('/api/allPermission/student/deletePerm', data).then((resp) => {
      toast.success(resp.data.message);
      setRefresh(!refresh);
    });
  };

  const handleActivate = (parmId: number, id: number, active: boolean) => {
    const data = { student_id: id, permission_id: parmId, active: active };
    axios
      .post(`/api/allPermission/student/selectedPerms/${params.id}`, data)
      .then((res) => {
        toast.success(res.data.message);
        setRefresh(!refresh);
      });
  };

  const handleSubmit = () => {
    checked.map((item) => {
      const data1 = {
        student_id: params.id,
        permission_id: item,
        active: true,
      };
      axios.post('/api/allPermission/student/addPerms', data1);
      setRefresh(!refresh);
    });
  };

  return (
    <div className="absolute flex justify-center items-center w-[80%] flex-col m-10">
      <div className="flex flex-row ">
        <Link
          className="flex bg-blue-500 hover:bg-blue-600 p-2 m-5 text-white rounded-md w-[200px] justify-center items-center"
          href={`/doctor/personalInformation/student/${params.id}/CoursesAndGrades`}
        >
          مواد و درجات الطالب
        </Link>
      </div>
      <table className="flex-row-reverse flex text-sm  border-collapse">
        <thead>
          <tr className="">
            {stuInfo.map((title, index) => (
              <th
                className="flex p-2 justify-end bg-darkBlue text-secondary"
                key={index}
              >
                {title.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="">
          {useMyData.map((item, index) => (
            <tr key={index}>
              <td className="flex w-[700px] p-2 justify-end">{item.name}</td>
              <td className="flex w-[700px] p-2 justify-end">{item.surname}</td>
              <td className="flex w-[700px] p-2 justify-end">
                {item.birth_date}
              </td>
              <td className="flex w-[700px] p-2 justify-end">{item.major}</td>
              <td className="flex w-[700px] p-2 justify-end">
                {item.semester}
              </td>
              <td className="flex w-[700px] p-2 justify-end">{item.address}</td>
              <td className="flex w-[700px] p-2 justify-end">{item.phone}</td>
              <td className="flex w-[700px] p-2 justify-end">{item.email}</td>
              <td className="flex w-[700px] p-2 justify-end">
                {item.enrollment_date}
              </td>
              <td className="flex w-[700px] p-2 justify-end">
                {item.advisor
                  ? doctors.find((doc) => item.advisor == doc.id)?.name
                  : 'لا يوجد'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <table className="border-collapse mt-8 w-[800px]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">حذف</th>
              <th className="border border-gray-300 px-4 py-2">ايقاف/تفعيل</th>
              <th className="border border-gray-300 px-4 py-2">اسم الصلاحية</th>
            </tr>
          </thead>
          <tbody>
            {selected.map((user, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="border-none h-full px-4 py-2 flex justify-end items-center">
                  <BsXCircleFill
                    onClick={() => handleDelete(user.id, params.id)}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => {
                      handleActivate(user.id, params.id, !user.active);
                    }}
                    className={`w-[50px] text-white py-1 px-2 rounded ${
                      user.active
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {user.active ? 'ايقاف' : 'تفعيل'}
                  </button>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="border-collapse mt-8 w-[500px]">
          <tbody>
            <tr>
              <td className="text-secondary bg-darkBlue">اختر الصلاحيات</td>
            </tr>
            {checkList.map((item, index) => (
              <tr key={index}>
                <td className="bg-lightBlue flex justify-between">
                  <input
                    className="p-2 ml-9"
                    value={item.name}
                    type="checkbox"
                    onChange={() => handleCheck(item)} // Pass the item to handleCheck
                    checked={checked.includes(item.id)} // Check if the item is in the checked list
                  />
                  <label className="pr-5">{item.name}</label>
                </td>
              </tr>
            ))}
            <tr>
              <td className="text-secondary bg-darkBlue flex justify-center items-center">
                <button onClick={handleSubmit}>اضافة</button>
              </td>
            </tr>
          </tbody>
        </table>
        <Transcript user={params.id} />
      </div>
    </div>
  );
};

export default Page;
