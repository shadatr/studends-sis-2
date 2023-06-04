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

import MyModel from '../../../../components/dialog';

const page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }
  const user = session.data?.user;

  const major = useRef<HTMLInputElement>(null);
  const majorDep = useRef<HTMLSelectElement>(null);
  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [loadMajor, setLoadMajor] = useState(false);
  const [newItemMajor, setNewItemMajor] = useState('');
  const [newMajorDep, setNewMajorDep] = useState('');

  const department = useRef<HTMLInputElement>(null);
  const [departments, setDepartments] = useState<DepartmentRegType[]>([]);
  const [loadDepartments, setLoadDep] = useState(false);
  const [newItemDep, setNewItemDep] = useState('');
  const [perms, setPerms] = useState<GetPermissionType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/allPermission/selectedPerms/${user?.id}`
      );
      const message: GetPermissionType[] = response.data.message;
      setPerms(message);
      console.log(message);
    };

    fetchPosts();
  }, [user?.id]);

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
        setLoadDep(!loadDepartments);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setNewItemDep('');
  };

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get('/api/department/departmentRegister').then((resp) => {
        console.log(resp.data);
        const message: DepartmentRegType[] = resp.data.message;
        setDepartments(message);
      });
    };
    fetchPosts();
  }, [loadDepartments]);

  const departmetItems = departments.map((deptItem, index) => (
    <tr key={index} className="flex flex-row w-full">
      <td
        className="flex flex-row w-full p-1 items-center justify-between"
        key={index}
      >
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
      <td className="flex flex-row w-1/7 pr-2 pl-2">{index + 1}</td>
    </tr>
  ));

  const departmentOptions = departments.map((item, index) => (
    <option key={index}>{item.name}</option>
  ));

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
        setLoadMajor(!loadMajor);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setNewItemMajor('');
    setNewMajorDep('');
  };

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get('/api/major/majorReg').then((resp) => {
        console.log(resp.data);
        const message: MajorRegType[] = resp.data.message;
        setMajors(message);
      });
    };
    fetchPosts();
  }, [loadMajor]);

  const handleDeleteMajor = (major_name: string) => {
    const data = { item_name: major_name };
    axios.post('/api/major/majorDelete', data).then((resp) => {
      toast.success(resp.data.message);
      setLoadMajor(!loadMajor);
    });
  };

  const majorItems = majors.map((item, index) => (
    <tr key={index} className="flex flex-row w-full">
      <td className="flex flex-row w-full p-1 items-center justify-between">
        <MyModel
          name={item.major_name}
          depOrMaj="التخصص"
          deleteModle={() =>
            perms.map((permItem) => {
              if (permItem.permission_id === 7 && permItem.active) {
                handleDeleteMajor(item.major_name);
              }
            })
          }
        />
        <Link href={`/management/managementwork/major/${item.id}`}>{item.major_name}</Link>
      </td>
      <td className="flex flex-row w-1/5 items-center justify-center pr-2 pl-2">
        {item.tb_departments?.name}
      </td>
      <td className="flex flex-row w-1/7 pr-2 pl-2">{index + 1}</td>
    </tr>
  ));

  return (
    <div className="absolute flex flex-col right-[150px]">
      <div className="flex flex-col  items-center justify-center text-sm">
        {perms.map((item, idx) =>
          item.permission_id === 8 && item.active ? (
            <div
              key={idx}
              className="flex flex-row-reverse items-center justify-center  text-sm mt-10 w-[1000px]"
            >
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
                className="w-[600px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
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
          ) : (
            ' '
          )
        )}

        <p className="mt-[50px] text-lg">اقسام</p>
        <table className="w-[1000px] flex flex-col h-[200px] overflow-y-auto">
          <tbody>{departmetItems}</tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-center text-sm p-10">
        {perms.map((item, idx) =>
          item.permission_id === 7 && item.active ? (
            <div
              key={idx}
              className="flex flex-row-reverse items-center justify-center w-screen text-sm mt-10"
            >
              <label
                htmlFor=""
                lang="ar"
                className="p-3 bg-darkBlue text-secondary"
              >
                سجل تخصص
              </label>
              <input
                ref={major}
                dir="rtl"
                placeholder="ادخل اسم التخصص"
                type="text"
                className="w-[600px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
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
                {departmentOptions}
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

        <p className="mt-[50px] text-lg">تخصصات</p>
        <table className="w-[1000px] flex flex-col">
          <tbody>{majorItems}</tbody>
        </table>
      </div>
    </div>
  );
};

export default page;
