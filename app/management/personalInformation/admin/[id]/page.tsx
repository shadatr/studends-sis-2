/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AssignPermissionType,
  GetPermissionType,
  PersonalInfoHeaderType,
  PersonalInfoType,
} from '@/app/types/types';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

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
 

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/allPermission/admin');
        const message: AssignPermissionType[] = response.data.message;
        setCheckList(message);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

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

      axios.get(`/api/personalInfo/manager/${params.id}`).then((resp) => {
        const message: PersonalInfoType[] = resp.data.message;
        useSetMydata(message);
        setNewData(message);
      });
    };
    fetchPosts();
  }, [params.id, refresh, edit,user]);



  const handleActivate = (id: number, parmId: number, active: boolean) => {
    const data = { id, parmId, active };
    axios
      .post(`/api/allPermission/admin/selectedPerms/${params.id}`, data)
      .then((res) => {
        toast.success(res.data.message);
        setRefresh(!refresh);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تغيير صلاحية موظف',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
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
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 3 && permItem.active) {
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
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 1 && permItem.active) {
          return (
            <div key={idx}>
              <table className="border-collapse mt-8 w-[800px]">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">
                      ايقاف/تفعيل
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      اسم الصلاحية
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {adminPerms.map((per, index) =>{ 
                  const selectedPer=checkList.find((item)=> item.id==per.permission_id);
                  return (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-gray-100' : ''}
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() => {
                            handleActivate(per.permission_id, params.id, !per.active);
                          }}
                          className={`w-[50px]  text-white py-1 px-2 rounded ${
                            per.active
                              ? 'bg-red-500 hover:bg-red-600'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {per.active ? 'ايقاف' : 'تفعيل'}
                        </button>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {selectedPer?.name}
                      </td>
                    </tr>
                  );})}
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
