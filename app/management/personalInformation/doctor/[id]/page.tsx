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
import { BsXCircleFill } from 'react-icons/bs';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }
  const [useMyData, useSetMydata] = useState<PersonalInfoType[]>([]);
  const [newData, setNewData] = useState<PersonalInfoType[]>([]);
  const [checkList, setCheckList] = useState<AssignPermissionType[]>([]);
  const [checked, setChecked] = useState<number[]>([]); // Change to an array
  const [perms, setPerms] = useState<GetPermissionDoctorType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [edit, setEdit] = useState(false);


  useEffect(() => {
    const fetchPosts = async () => {
        const responsePer = await axios.get(`/api/allPermission/${"doctor"}`);
        const messagePer: AssignPermissionType[] = responsePer.data.message;
        setCheckList(messagePer);
        
        axios.get(`/api/personalInfo/doctor/${params.id}`).then((resp) => {
          const message: PersonalInfoType[] = resp.data.message;
          useSetMydata(message);
          setNewData(message);
        });
        axios.get(`/api/personalInfo/doctor/${params.id}`).then((resp) => {
          console.log(resp.data);
          const message: PersonalInfoType[] = resp.data.message;
          useSetMydata(message);
        });

        const response = await axios.get(
          `/api/allPermission/doctor/selectedPerms/${params.id}`
        );
        const message: GetPermissionDoctorType[] = response.data.message;
        setPerms(message);
        console.log(message);
    };
    fetchPosts();
  }, [refresh, edit, params.id]);

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
      const data1 = { doctor_id: params.id, permission_id: item, active: true };
      axios.post('/api/allPermission/doctor/addPerm', data1);
      setRefresh(!refresh);
    });
  };


   const handleInputChange = (e: string, field: keyof PersonalInfoType) => {
     const updatedData = newData.map((data) => {
       console.log('Submitted gradesssss:', newData);
       return {
         ...data,
         [field]: e,
       };
     });

     setNewData(updatedData);
   };

   const handleSubmitInfo = () => {
     setEdit(false);
     console.log('Submitted grades:', newData);
     axios
       .post(`/api/personalInfo/edit/${params.id}/editDoctor`, newData)
       .then(() => {
         toast.success('تم تحديث البيانات بنجاح');
       })
       .catch((error) => {
         console.error(error);
         toast.error('حدث خطأ أثناء تحديث البيانات');
       });
   };


  return (
    <div className="flex absolute text-sm w-[80%] justify-center items-center flex-col m-10">
      <div>
        <Link
          className="m-5 bg-green-800 hover:bg-green-600  text-secondary p-3 rounded-md w-[200px]"
          href={`/management/doctors/students/${params.id}`}
        >
          الاشراف علي الطلاب
        </Link>
        <Link
          className="m-5 bg-green-800 hover:bg-green-600  text-secondary p-3 rounded-md w-[200px]"
          href={`/management/personalInformation/doctor/${params.id}/coursesAndCourseProg`}
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
              <th className="border border-gray-300 px-4 py-2">حذف </th>
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
              <div className="bg-lightBlue flex justify-between  " key={index}>
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
