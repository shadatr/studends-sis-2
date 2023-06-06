/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AssignPermissionType, GetPermissionType, PersonalInfoHeaderType, PersonalInfoType } from '@/app/types/types';
import { toast } from 'react-toastify';
import { BsXCircleFill } from 'react-icons/bs';

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
  const [useMyData, useSetMydata] = useState<PersonalInfoType[]>([]);
  const [checkList, setCheckList] = useState<AssignPermissionType[]>([]);
  const [checked, setChecked] = useState<number[]>([]); // Change to an array
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/admin/allPermission/admin');
        const message: AssignPermissionType[] = response.data.message;
        setCheckList(message);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchPosts();
  }, [refresh]);

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

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/allPermission/doctor/selectedPerms/${params.id}`
      );
      const message: GetPermissionType[] = response.data.message;
      setPerms(message);
      console.log(message);
    };

    fetchPosts();
  }, [params.id, refresh]);

  const selected: AssignPermissionType[] = perms.flatMap((item) =>
    checkList
      .filter((item2) => item.permission_id == item2.id)
      .map((item2) => ({ name: item2.name, id: item2.id, active: item.active }))
  );
  const handleDelete = (per_id: number, admin_id: number) => {
    const data = { item_per_id: per_id, item_admin_id: admin_id };
    axios.post('/api/allPermission/doctor/deletePerm', data).then((resp) => {
      toast.success(resp.data.message);
      setRefresh(!refresh);
    });
  };

  const handleActivate = (id: number, parmId: number, active: boolean) => {
    const data = { id, parmId, active };
    axios
      .post(`/api/allPermission/doctor/selectedPerms/${params.id}`, data)
      .then((res) => {
        toast.success(res.data.message);
        setRefresh(!refresh);
      });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    checked.map((item) => {
      const data1 = { admin_id: params.id, permission_id: item, active: true };
      axios.post('/api/allPermission/doctor', data1);
      setRefresh(!refresh);
    });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get(`/api/personalInfo/doctor/${params.id}`).then((resp) => {
        const message: PersonalInfoType[] = resp.data.message;
        useSetMydata(message);
      });
    };

    fetchPosts();
  }, [params.id]);

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get(`/api/personalInfo/doctor/${params.id}`).then((resp) => {
        console.log(resp.data);
        const message: PersonalInfoType[] = resp.data.message;
        useSetMydata(message);
      });
    };

    fetchPosts();
  }, [params.id]);
  const titles = doctorInfo.map((title, index) => (
    <td className="flex justify-center p-2 items-center text-right" key={index}>
      {title.header}
    </td>
  ));
  const data = useMyData.map((item, index) => (
    <tr key={1} className="flex flex-col">
      <td className="p-2" key={index}>
        {item.name}
      </td>
      <td className="p-2" key={index}>
        {item.surname}
      </td>
      <td className="p-2" key={index}>
        {item.birth_date}
      </td>
      <td className="p-2" key={index}>
        {item.major}
      </td>
      <td className="p-2" key={index}>
        {item.address}
      </td>
      <td className="p-2" key={index}>
        {item.phone}
      </td>
      <td className="p-2" key={index}>
        {item.email}
      </td>
      <td className="p-2" key={index}>
        {item.enrollment_date}
      </td>
    </tr>
  ));

  return (
    <div>
      <table className="flex absolute text-sm w-[800px] top-[200px] right-[500px]">
        <tr className="w-full">{data}</tr>
        <tr className="w-1/4 bg-darkBlue text-secondary">{titles}</tr>
      </table>
          <div >
            <table className="border-collapse mt-8 w-[800px]">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">حذف </th>
                  <th className="border border-gray-300 px-4 py-2">
                    ايقاف/تفعيل
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    اسم الصلاحية
                  </th>
                </tr>
              </thead>
              <tbody>
                {selected.map((user, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-100' : ''}
                  >
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
            <form onSubmit={handleSubmit} className="p-10 w-[400px] ">
              <h1 className="flex w-full  text-sm justify-center items-center bg-darkBlue text-secondary">
                اختر الصلاحيات
              </h1>
              <div className="p-1 rounded-md">
                {checkList.map((item, index) => (
                  <div
                    className="bg-lightBlue flex justify-between  "
                    key={index}
                  >
                    <input
                      className="p-2 ml-9"
                      value={item.name}
                      type="checkbox"
                      onChange={() => handleCheck(item)} // Pass the item to handleCheck
                      checked={checked.includes(item.id)} // Check if the item is in the checked list
                    />
                    <label className="pr-5">{item.name}</label>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="flex w-full  text-sm justify-center items-center bg-darkBlue text-secondary"
              >
                اضافة
              </button>
            </form>
          </div>
    </div>
  );
};

export default page;
