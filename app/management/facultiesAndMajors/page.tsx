/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import {
  DepartmentRegType,
  GetPermissionType,
  MajorRegType,
} from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import MyModel from '../../components/dialog';

const page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const major = useRef<HTMLInputElement>(null);
  const majorDep = useRef<HTMLSelectElement>(null);
  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [load, setLoad] = useState(false);
  const [newItemMajor, setNewItemMajor] = useState('');
  const [newMajorDep, setNewMajorDep] = useState('');

  const department = useRef<HTMLInputElement>(null);
  const [departments, setDepartments] = useState<DepartmentRegType[]>([]);
  const [newItemDep, setNewItemDep] = useState('');
  const [perms, setPerms] = useState<GetPermissionType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        const response = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const message: GetPermissionType[] = response.data.message;
        setPerms(message);
        console.log(message);

        axios.get('/api/department/departmentRegister').then((resp) => {
          console.log(resp.data);
          const message: DepartmentRegType[] = resp.data.message;
          setDepartments(message);

          axios.get('/api/major/majorReg').then((resp) => {
            console.log(resp.data);
            const message: MajorRegType[] = resp.data.message;
            setMajors(message);
          });
        });
      }
    };

    fetchPosts();
  }, [user, user?.id,load]);

  const handleRegisterDep = () => {
    if (!newItemDep) {
      toast.error('يجب كتابة اسم المادة');
      return;
    }
    const data: DepartmentRegType = { name: newItemDep };
    axios
      .post('/api/department/departmentRegister', data)
      .then((res) => {
        console.log(res.data);
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setNewItemDep('');
    setLoad(!load);

  };

  const selectedDep = departments.filter((item) => item.name == newMajorDep);
  const depId = selectedDep.map((i) => i.id);

  const handleRegisterMajor = () => {
    if (!newItemMajor || !newMajorDep) {
      toast.error('يجب كتابة ملئ جميع البيانات');
      return;
    }
    const data: MajorRegType = {
      major_name: newItemMajor,
      department_id: depId[0],
    };
    axios
      .post('/api/major/majorReg', data)
      .then((res) => {
        console.log(res.data.message);
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setNewItemMajor('');
    setNewMajorDep('');
    setLoad(!load);
  };

 
  const handleDeleteMajor = (major_name: string) => {
    const data = { item_name: major_name };
    axios.post('/api/major/majorDelete', data).then((resp) => {
      toast.success(resp.data.message);
      setLoad(!load);

    });
  };

  return (
    <div className="absolute flex flex-col w-[80%] items-center justify-center">
      <div className="flex flex-col  items-center justify-center text-sm">
        <p className="flex text-md bg-lightBlue rounded-md p-4 w-[200px] justify-center m-5 items-center">
          اقسام
        </p>
        <div className="flex flex-row-reverse items-center justify-center  text-sm m-10 w-[1000px]">
          <label
            htmlFor=""
            lang="ar"
            className="p-3 bg-darkBlue text-secondary w-[200px]"
          >
            سجل كلية
          </label>
          <input
            ref={department}
            dir="rtl"
            placeholder="ادخل اسم الكلية"
            type="text"
            className="w-[600px] border border-gray-300 px-4 py-2 rounded-[5px]"
            value={newItemDep}
            onChange={(e) => setNewItemDep(e.target.value)}
          />
          <button
            className="bg-darkBlue text-secondary p-3 w-[200px] rounded-[5px]"
            type="submit"
            onClick={handleRegisterDep}
          >
            سجل
          </button>
        </div>

        <table className="w-[1000px] ">
          <tbody>
            {departments.length ? (
              departments.map((deptItem, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2" key={index}>
                    {perms.map((permItem, idx) => {
                      if (permItem.permission_id === 8 && permItem.active) {
                        return (
                          <MyModel
                            key={idx}
                            depOrMaj="الكلية"
                            name={deptItem.name}
                            deleteModle={() => handleDeleteMajor(deptItem.name)}
                          />
                        );
                      }
                      return null;
                    })}
                    {deptItem.name}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  لا يوجد اقسام حاليا
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-center text-sm p-10">
        <p className="flex text-md bg-lightBlue rounded-md p-4 w-[200px] justify-center m-5 items-center">
          تخصصات
        </p>
        {perms.map((item, idx) =>
          item.permission_id === 7 && item.active ? (
            <div
              key={idx}
              className="flex flex-row-reverse items-center justify-center  text-sm m-10 w-[1000px]"
            >
              <label
                htmlFor=""
                lang="ar"
                className="p-3 bg-darkBlue text-secondary w-[150px]"
              >
                سجل تخصص
              </label>
              <input
                ref={major}
                dir="rtl"
                placeholder="ادخل اسم التخصص"
                type="text"
                className="w-[600px] border border-gray-300 px-4 py-2 rounded-[5px]"
                value={newItemMajor}
                onChange={(e) => setNewItemMajor(e.target.value)}
              />
              <select
                id="dep"
                dir="rtl"
                ref={majorDep}
                onChange={(e) => {
                  {
                    setNewMajorDep(e.target.value);
                  }
                }}
                className="p-4 text-sm bg-lightBlue "
              >
                <option selected disabled>
                  اختر اسم الكلية
                </option>
                {departments.map((item, index) => (
                  <option key={index} >{item.name}</option>
                ))}
              </select>

              <button
                className="bg-darkBlue text-secondary p-3 w-[200px] "
                type="submit"
                onClick={handleRegisterMajor}
              >
                سجل
              </button>
            </div>
          ) : (
            ''
          )
        )}

        <table className="w-[1000px] ">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-gray-200 text-gray-700"></th>
              <th className="py-2 px-4 bg-gray-200 text-gray-700">التخصص</th>
              <th className="py-2 px-4 bg-gray-200 text-gray-700">الكلية</th>
            </tr>
          </thead>
          <tbody>
            {majors.length ? (
              majors.map((item, index) => (
                <tr key={index} className="">
                  <td className="border border-gray-300 px-4 py-2 w-1/3">
                    <Link
                      className="bg-blue-700  hover:bg-blue-600 px-5 py-2 m-1 rounded-md text-white"
                      href={`/management/facultiesAndMajors/majorStudents/${item.id}`}
                    >
                      الطلاب
                    </Link>
                    <Link
                      className="bg-blue-700  hover:bg-blue-600 px-5 py-2 rounded-md text-white"
                      href={`/management/facultiesAndMajors/majorExamProg/${item.id}`}
                    >
                      جدول الامتحانات
                    </Link>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.major_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 w-1/6">
                    {item.tb_departments?.name}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  لا يوجد تخصصات حاليا
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default page;
