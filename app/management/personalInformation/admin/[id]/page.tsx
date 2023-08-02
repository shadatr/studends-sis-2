/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  AssignPermissionType,
  GetPermissionType,
  PersonalInfoHeaderType,
  PersonalInfoType,
  MajorType,
  AdminMajorType,
} from '@/app/types/types';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { BsXCircleFill } from 'react-icons/bs';

const doctorInfo: PersonalInfoHeaderType[] = [
  { header: 'الاسم' },
  { header: 'اللقب' },
  { header: 'تاريخ الميلاد' },
  { header: 'عنوان السكن' },
  { header: 'رقم الهاتف' },
  { header: 'الايميل' },
  { header: 'تاريخ التسجيل' },
];

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [useMyData, useSetMydata] = useState<PersonalInfoType[]>([]);
  const [newData, setNewData] = useState<PersonalInfoType[]>([]);
  const [checkList, setCheckList] = useState<AssignPermissionType[]>([]);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [adminPerms, setAdminPerms] = useState<GetPermissionType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [edit, setEdit] = useState(false);
  const [majors, setMajors] = useState<MajorType[]>([]);
  const [adminMajors, setAdminMajors] = useState<AdminMajorType[]>([]);

  const major = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/allPermission/admin');
        const message: AssignPermissionType[] = response.data.message;
        setCheckList(message);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      const resp = await axios.get('/api/major/majorReg');
      const message2: MajorType[] = resp.data.message;
      setMajors(message2);

      const response = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const message: GetPermissionType[] = response.data.message;
      setPerms(message);

      const responsePer = await axios.get(
        `/api/allPermission/admin/selectedPerms/${params.id}`
      );
      const messagePer: GetPermissionType[] = responsePer.data.message;
      setAdminPerms(messagePer);

      const responsePer2 = await axios.get(
        `/api/allPermission/admin/adminMajors/${params.id}`
      );
      const messagePer2: AdminMajorType[] = responsePer2.data.message;
      setAdminMajors(messagePer2);

      axios.get(`/api/personalInfo/manager/${params.id}`).then((resp) => {
        const message: PersonalInfoType[] = resp.data.message;
        useSetMydata(message);
        setNewData(message);
      });
    };
    fetchPosts();
  }, [params.id, refresh, edit, user]);

  const handleAddMajor = () => {
    const data = {
      admin_id: params.id,
      major_id: major.current?.value,
    };
    axios
      .post(`/api/allPermission/admin/adminMajors/${user?.id}`, data)
      .then(() => toast.success('تم الاضافة بنجاح'))
      .catch(() => toast.error('حدث خطا'));
    setRefresh(!refresh);
  };

  const handleDeleteMajor = (item?: number) => {
    axios
      .post(`/api/allPermission/admin/deleteMajor`, item)
      .then(() => toast.success('تم الحذف'))
      .catch(() => toast.error('حدث خطا'));
    setRefresh(!refresh);
  };

  const handleChangePerms = (
    per: keyof GetPermissionType,
    value: boolean,
    id: number,
    permId: number
  ) => {
    const updatedPerms = adminPerms.map((perm) => {
      if (perm.id == id && perm.permission_id == permId) {
        return {
          ...perm,
          [per]: value,
        };
      }
      return perm;
    });
    axios
      .post(`/api/allPermission/admin/selectedPerms/${params.id}`, updatedPerms)
      .then((res) => {
        if (res.data.message === 'تم تغيير حالة صلاحية الموظف بنجاح') {
          toast.success(res.data.message);
          setRefresh(!refresh);
          const dataUsageHistory = {
            id: user?.id,
            type: 'admin',
            action: ' تغيير صلاحية موظف',
          };
          axios.post('/api/usageHistory', dataUsageHistory);
        } else {
          toast.error('فشل في تغيير صلاحية الموظف.');
        }
      })
      .catch((error) => {
        toast.error('حدث خطأ أثناء تحديث صلاحية الموظف.');
        console.error(error);
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
    setEdit(false);
    axios
      .post(`/api/personalInfo/edit/${params.id}/editAdmin`, newData)
      .then(() => {
        toast.success('تم تحديث البيانات بنجاح');
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل معلومات موظف',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch(() => {
        toast.error('حدث خطأ أثناء تحديث البيانات');
      });
  };

  return (
    <div className="flex absolute text-sm w-[80%] justify-center items-center flex-col m-10">
      {perms.map((permItemm, idx) => {
        if (permItemm.permission_id === 4 && permItemm.edit) {
          return (
            <div key={idx}>
              <button
                className="m-5 bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
                type="submit"
                onClick={() => (edit ? handleSubmitInfo() : setEdit(!edit))}
              >
                {edit ? 'ارسال' : 'تعديل'}
              </button>
            </div>
          );
        }
        return null;
      })}
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
      <div className="w-[800px] flex flex-col justify-center items-center relative m-5">
        <div className=" flex flex-row mb-4 w-[400px]">
          <button
            onClick={handleAddMajor}
            className="  px-4 w-[100px] bg-green-600 text-white rounded-l-md focus:outline-none hover:bg-green-500"
          >
            اضافة
          </button>
          <select
            dir="rtl"
            ref={major}
            defaultValue="اختر التخصص"
            className="p-2 pr-8 bg-gray-100 border border-gray-300 w-[300px] rounded-md focus:outline-none focus:ring focus:border-blue-300"
          >
            <option disabled>اختر التخصص</option>
            {majors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.major_name}
              </option>
            ))}
          </select>
        </div>

        {/* For the list of majors */}
        <div
          className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          style={{ maxWidth: '800px' }}
        >
          {adminMajors.map((m) => (
            <div
              key={m.id}
              className="flex justify-between items-center px-4 py-2 bg-white rounded-md shadow-md border border-gray-300"
            >
              <h1>{majors.find((maj) => maj.id == m.major_id)?.major_name}</h1>
              <BsXCircleFill
                className="text-red-600 cursor-pointer"
                onClick={() => handleDeleteMajor(m.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {perms.map((permItemm, idx) => {
        if (permItemm.permission_id === 5 && permItemm.edit) {
          return (
            <div key={idx}>
              <table className="border-collapse mt-8 w-[800px]">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">اطلاع</th>
                    <th className="border border-gray-300 px-4 py-2">اضافة</th>
                    <th className="border border-gray-300 px-4 py-2">موافقة</th>
                    <th className="border border-gray-300 px-4 py-2">حذف</th>
                    <th className="border border-gray-300 px-4 py-2">تعديل</th>
                    <th className="border border-gray-300 px-4 py-2">
                      اسم الصلاحية
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {adminPerms.map((permItem, index) => {
                    const selectedPer = checkList.find(
                      (item) => item.id == permItem.permission_id
                    );

                    return (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-gray-100' : ''}
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          {![5, 15, 17, 14].includes(
                            permItem.permission_id
                          ) && (
                            <button
                              onClick={() =>
                                handleChangePerms(
                                  'see',
                                  !permItem.see,
                                  permItem.id,
                                  permItem.permission_id
                                )
                              }
                              className={`w-[50px]  text-white py-1 px-2 rounded ${
                                permItem.see
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {permItem.see ? 'ايقاف' : 'تفعيل'}
                            </button>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {![5, 13, 14, 15, 16, 11, 17].includes(
                            permItem.permission_id
                          ) && (
                            <button
                              onClick={() =>
                                handleChangePerms(
                                  'add',
                                  !permItem.add,
                                  permItem.id,
                                  permItem.permission_id
                                )
                              }
                              className={`w-[50px]  text-white py-1 px-2 rounded ${
                                permItem.add
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {permItem.add ? 'ايقاف' : 'تفعيل'}
                            </button>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {[17, 12, 11].includes(permItem.permission_id) && (
                            <button
                              onClick={() =>
                                handleChangePerms(
                                  'approve',
                                  !permItem.approve,
                                  permItem.id,
                                  permItem.permission_id
                                )
                              }
                              className={`w-[50px]  text-white py-1 px-2 rounded ${
                                permItem.approve
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {permItem.approve ? 'ايقاف' : 'تفعيل'}
                            </button>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {[3, 7, 9, 12, 8].includes(
                            permItem.permission_id
                          ) && (
                            <button
                              onClick={() =>
                                handleChangePerms(
                                  'Delete',
                                  !permItem.Delete,
                                  permItem.id,
                                  permItem.permission_id
                                )
                              }
                              className={`w-[50px]  text-white py-1 px-2 rounded ${
                                permItem.Delete
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {permItem.Delete ? 'ايقاف' : 'تفعيل'}
                            </button>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {![3, 7, 9, 12, 16].includes(
                            permItem.permission_id
                          ) && (
                            <button
                              onClick={() =>
                                handleChangePerms(
                                  'edit',
                                  !permItem.edit,
                                  permItem.id,
                                  permItem.permission_id
                                )
                              }
                              className={`w-[50px]  text-white py-1 px-2 rounded ${
                                permItem.edit
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {permItem.edit ? 'ايقاف' : 'تفعيل'}
                            </button>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {selectedPer?.name}
                        </td>
                      </tr>
                    );
                  })}
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
