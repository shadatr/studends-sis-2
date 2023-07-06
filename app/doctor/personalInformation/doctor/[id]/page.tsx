/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AssignPermissionType,
  GetPermissionDoctorType,
  PersonalInfoHeaderType,
  PersonalInfoType,
} from '@/app/types/types';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

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
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }
  const [useMyData, useSetMydata] = useState<PersonalInfoType[]>([]);
  const [newData, setNewData] = useState<PersonalInfoType[]>([]);
  const [checkList, setCheckList] = useState<AssignPermissionType[]>([]);
  const [perms, setPerms] = useState<GetPermissionDoctorType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      const responsePer = await axios.get(`/api/allPermission/${'doctor'}`);
      const messagePer: AssignPermissionType[] = responsePer.data.message;
      setCheckList(messagePer);

      axios.get(`/api/personalInfo/doctor/${params.id}`).then((resp) => {
        const message: PersonalInfoType[] = resp.data.message;
        useSetMydata(message);
        setNewData(message);
      });
      axios.get(`/api/personalInfo/doctor/${params.id}`).then((resp) => {
        const message: PersonalInfoType[] = resp.data.message;
        useSetMydata(message);
      });

      const response = await axios.get(
        `/api/allPermission/doctor/selectedPerms/${params.id}`
      );
      const message: GetPermissionDoctorType[] = response.data.message;
      setPerms(message);
    };
    fetchPosts();
  }, [refresh, edit, params.id]);



  const selected: AssignPermissionType[] = perms.flatMap((item) =>
    checkList
      .filter((item2) => item.permission_id == item2.id)
      .map((item2) => ({ name: item2.name, id: item2.id, active: item.active }))
  );

  const handleActivate = (id: number, parmId: number, active: boolean) => {
    const data = { id, parmId, active };
    axios
      .post(`/api/allPermission/doctor/selectedPerms/${params.id}`, data)
      .then((res) => {
        toast.success(res.data.message);
        setRefresh(!refresh);
      });
  };


  const handleInputChange = (e: string, field: keyof PersonalInfoType) => {
    const updatedData = newData.map((data) => {
      return {
        ...data,
        [field]: e,
      };
    });
    setNewData(updatedData);
  };

  const handleSubmitInfo = () => {
    setEdit(!edit);
    axios
      .post(`/api/personalInfo/edit/${params.id}/editDoctor`, newData)
      .then(() => {
        toast.success('تم تحديث البيانات بنجاح');
      })
      .catch(() => {
        toast.error('حدث خطأ أثناء تحديث البيانات');
      });
  };

  return (
    <div className="flex absolute text-sm w-[80%] justify-center items-center flex-col m-10">
      <div>
        <Link
          className="m-5 bg-green-800 hover:bg-green-600  text-secondary p-3 rounded-md w-[200px]"
          href={`/doctor/headOfDepartmentWork/doctors/students/${params.id}`}
        >
          الاشراف علي الطلاب
        </Link>
        <Link
          className="m-5 bg-green-800 hover:bg-green-600  text-secondary p-3 rounded-md w-[200px]"
          href={`doctor/headOfDepartmentWork/doctors/courseProg/${params.id}`}
        >
          المواد و جدول المحاضرات
        </Link>
        <button
          className="m-5 bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
          type="submit"
          onClick={() => (edit ? handleSubmitInfo() : setEdit(!edit))}
        >
          {edit ? 'ارسال' : 'تعديل'}
        </button>
      </div>
      <table className="flex-row-reverse flex text-sm  border-collapse">
        <thead>
          <tr className="">
            {doctorInfo.map((title, index) => (
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
          {edit
            ? newData.map((item2) =>
                useMyData.map((item, index) => (
                  <tr key={index}>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.name}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'name')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.surname}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'surname')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.birth_date}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'birth_date')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.major}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'major')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.address}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'address')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.phone}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'phone')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.email}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'email')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.enrollment_date}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'enrollment_date')
                        }
                      />
                    </td>
                  </tr>
                ))
              )
            : useMyData.map((item, index) => (
                <tr key={index}>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.name}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.surname}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.birth_date}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.major}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.address}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.phone}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.email}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.enrollment_date}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
      <div>
        <table className="border-collapse mt-8 w-[800px]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">ايقاف/تفعيل</th>
              <th className="border border-gray-300 px-4 py-2">اسم الصلاحية</th>
            </tr>
          </thead>
          <tbody>
            {selected.map((user, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => {
                      handleActivate(user.id, params.id, !user.active);
                    }}
                    className={`w-[50px]  text-white py-1 px-2 rounded ${
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
      </div>
    </div>
  );
};

export default page;
