'use client';
import {
  DepartmentRegType,
  GetPermissionType,
  MajorType,
} from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const Page = () => {
  const session = useSession({ required: true });

  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const major = useRef<HTMLInputElement>(null);
  const majorDep = useRef<HTMLSelectElement>(null);
  const [majors, setMajors] = useState<MajorType[]>([]);
  const [majors2, setMajors2] = useState<MajorType[]>([]);
  const [load, setLoad] = useState(false);
  const [newItemMajor, setNewItemMajor] = useState('');
  const [newMajorDep, setNewMajorDep] = useState('');
  const [credits, setCredits] = useState('');
  const [edit, setEdit] = useState(false);
  const [edit2, setEdit2] = useState(false);
  const department = useRef<HTMLInputElement>(null);
  const [departments, setDepartments] = useState<DepartmentRegType[]>([]);
  const [departments2, setDepartments2] = useState<DepartmentRegType[]>([]);
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
      }
    };

    fetchPosts();
  }, [user, user?.id, load]);

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get('/api/department/departmentRegister').then((resp) => {
        const message: DepartmentRegType[] = resp.data.message;
        setDepartments(message);
        setDepartments2(message);

        axios.get('/api/major/majorReg').then((resp) => {
          const message: MajorType[] = resp.data.message;
          setMajors(message);
          setMajors2(message);
        });
      });
    };

    fetchPosts();
  }, [load, edit, edit2]);

  const handleRegisterDep = () => {
    if (!newItemDep) {
      toast.error('يجب كتابة اسم المادة');
      return;
    }
    const data = { name: newItemDep };
    axios
      .post('/api/department/departmentRegister', data)
      .then((res) => {
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل الاقسام',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
        toast.success(res.data.message);
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
    if (!newItemMajor || !newMajorDep || !credits) {
      toast.error('يجب  ملئ جميع البيانات');
      return;
    }
    const data: MajorType = {
      major_name: newItemMajor,
      department_id: depId[0],
      credits_needed: parseInt(credits),
      active: true,
    };
    axios
      .post('/api/major/majorReg', data)
      .then((res) => {
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل التخصصات',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setNewItemMajor('');
    setLoad(!load);
  };

  const handleInputChangeDepartment = (
    e: string,
    field: keyof DepartmentRegType,
    id?: number
  ) => {
    const updatedData = departments2.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          [field]: e,
        };
      }
      return i;
    });
    setDepartments2(updatedData);
  };

  const handleInputChangeMajor = (
    e: string,
    field: keyof MajorType,
    id?: number
  ) => {
    const updatedmajors = majors2.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          [field]: e,
        };
      }
      return i;
    });

    setMajors2(updatedmajors);
  };

  const handleInputChangeMajorDep = (
    e: string,
    field: keyof MajorType,
    id?: number
  ) => {
    const value = departments.find((item) => item.name === e);
    const updatedData = majors2.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          [field]: value?.id,
        };
      }
      return i;
    });

    setMajors2(updatedData);
  };

  const handleSubmitMajor = () => {
    setEdit2(false);
    axios
      .post(`/api/major/editMajor`, majors2)
      .then(() => {
        toast.success('تم تحديث البيانات بنجاح');
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل التخصصات',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch(() => {
        toast.error('حدث خطأ أثناء تحديث البيانات');
      });
  };

  const handleSubmitDepartment = () => {
    setEdit(false);
    axios
      .post(`/api/department/editDepartment`, departments2)
      .then((res) => {
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل الاقسام',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((error) => {
        toast.error(error.res);
      });
  };

  const handleActivateMajor = (majorId?: number, active?: boolean) => {
    const data = { majorId, active };
    axios.post('/api/major/getMajors', data).then((res) => {
      const dataUsageHistory = {
        id: user?.id,
        type: 'admin',
        action: ' تعديل التخصصات',
      };
      axios.post('/api/usageHistory', dataUsageHistory);
      toast.success(res.data.message);
      setLoad(!load);
    });
  };

  const handleActivateDepartment = (depId?: number, active?: boolean) => {
    const data = { depId, active };
    axios.post('/api/department/activeDepartment', data).then((res) => {
      const dataUsageHistory = {
        id: user?.id,
        type: 'admin',
        action: ' تعديل الاقسام',
      };
      axios.post('/api/usageHistory', dataUsageHistory);
      toast.success(res.data.message);
      setLoad(!load);
    });
  };

  return (
    <div className="absolute flex flex-col w-[80%] items-center justify-center">
      <div className="flex flex-col  items-center justify-center text-sm">
        <p className="flex text-md bg-lightBlue rounded-md p-4 w-[200px] justify-center m-5 items-center">
          اقسام
        </p>
        {perms.map((permItem, idx) => {
          if (permItem.permission_id === 7 && permItem.active) {
            return (
              <>
                <div
                  key={idx}
                  className="flex flex-row-reverse items-center justify-center  text-sm m-10 w-[1000px]"
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
                <button
                  className="m-2 bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
                  type="submit"
                  onClick={() =>
                    edit ? handleSubmitDepartment() : setEdit(!edit)
                  }
                >
                  {edit ? 'ارسال' : 'تعديل'}
                </button>
              </>
            );
          }
          return null;
        })}
        <table className="w-[1000px] ">
          <tbody>
            {departments.length ? (
              departments.map((deptItem, index) => {
                const item2 = departments2.find(
                  (item2) => item2.id == deptItem.id
                );
                return edit ? (
                  <tr key={index}>
                    {perms.map((permItem, idx) => {
                      if (permItem.permission_id === 7 && permItem.active) {
                        return (
                          <td
                            className="border border-gray-300 px-4 py-2"
                            key={idx}
                          >
                            <button
                              onClick={() => {
                                handleActivateDepartment(
                                  deptItem.id,
                                  !deptItem.active
                                );
                              }}
                              className={`text-white py-1 px-2 rounded ${
                                deptItem.active
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {deptItem.active ? 'ايقاف' : 'تفعيل'}
                            </button>
                          </td>
                        );
                      }
                      return null;
                    })}
                    <td className="border border-gray-300 px-4 py-2 ">
                      <input
                        className=" w-[700px] text-right "
                        dir="rtl"
                        type="text"
                        value={item2?.name}
                        onChange={(e) =>
                          handleInputChangeDepartment(
                            e.target.value,
                            'name',
                            deptItem.id
                          )
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={index}>
                    {perms.map((permItem, idx) => {
                      if (permItem.permission_id === 7 && permItem.active) {
                        return (
                          <td
                            className="border border-gray-300 px-4 py-2"
                            key={idx}
                          >
                            <button
                              onClick={() => {
                                handleActivateDepartment(
                                  deptItem.id,
                                  !deptItem.active
                                );
                              }}
                              className={`text-white py-1 px-2 rounded ${
                                deptItem.active
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {deptItem.active ? 'ايقاف' : 'تفعيل'}
                            </button>
                          </td>
                        );
                      }
                      return null;
                    })}
                    <td className="border border-gray-300 px-4 py-2 ">
                      {deptItem.name}
                    </td>
                  </tr>
                );
              })
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
        <Link
          className="bg-blue-700  hover:bg-blue-600 px-5 py-2 rounded-md text-white"
          href={`/management/facultiesAndMajors/majorExamProg`}
        >
          جدول الامتحانات لجميع المواد
        </Link>
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
              <input
                ref={major}
                dir="rtl"
                placeholder=" كرديت "
                type="text"
                className="w-[100px] border border-gray-300 px-4 py-2 rounded-[5px]"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
              />
              <select
                id="dep"
                dir="rtl"
                ref={majorDep}
                onChange={(e) => {setNewMajorDep(e.target.value); }}
                className="p-4 text-sm bg-lightBlue "
                defaultValue="اختر اسم الكلية"
              >
                <option disabled>
                  اختر اسم الكلية
                </option>
                {departments.map((item, index) => {
                  if (item.active) {
                    return <option key={index}>{item.name}</option>;
                  }
                })}
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
        <button
          className="m-2 bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
          type="submit"
          onClick={() => (edit2 ? handleSubmitMajor() : setEdit2(!edit2))}
        >
          {edit2 ? 'ارسال' : 'تعديل'}
        </button>

        <table className="w-[1000px] ">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-gray-200 text-gray-700"></th>
              <th className="py-2 px-4 bg-gray-200 text-gray-700"></th>
              <th className="py-2 px-4 bg-gray-200 text-gray-700">كرديت</th>
              <th className="py-2 px-4 bg-gray-200 text-gray-700">التخصص</th>
              <th className="py-2 px-4 bg-gray-200 text-gray-700">الكلية</th>
            </tr>
          </thead>
          <tbody>
            {majors.length ? (
              majors.map((item, index) => {
                const item2 = majors2.find((item2) => item2.id == item.id);
                const dep = departments.find(
                  (item3) => item3.id == item.department_id
                );
                return edit2 ? (
                  <tr key={index + 2}>
                    {perms.map((permItem, idx) => {
                      if (permItem.permission_id === 7 && permItem.active) {
                        return (
                          <td
                            className="border border-gray-300 px-4 py-2"
                            key={idx + 8}
                          >
                            <button
                              onClick={() => {
                                handleActivateMajor(item.id, !item.active);
                              }}
                              className={`text-white py-1 px-2 rounded ${
                                item.active
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {item.active ? 'ايقاف' : 'تفعيل'}
                            </button>
                          </td>
                        );
                      }
                      return null;
                    })}
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
                    <td className="border border-gray-300">
                      <input
                        dir="rtl"
                        type="number"
                        value={item2?.credits_needed}
                        onChange={(e) =>
                          handleInputChangeMajor(
                            e.target.value,
                            'credits_needed',
                            item.id
                          )
                        }
                      />
                    </td>
                    <td className="border border-gray-300 ">
                      <input
                        dir="rtl"
                        type="text"
                        value={item2?.major_name}
                        onChange={(e) =>
                          handleInputChangeMajor(
                            e.target.value,
                            'major_name',
                            item.id
                          )
                        }
                      />
                    </td>
                    <td className="border border-gray-300  w-1/6">
                      <select
                        id="dep"
                        dir="rtl"
                        ref={majorDep}
                        onChange={(e) =>
                          handleInputChangeMajorDep(
                            e.target.value,
                            'department_id',
                            item.id
                          )
                        }
                        className="p-2 text-sm bg-lightBlue "
                        defaultValue="اختر اسم الكلية"
                      >
                        <option disabled>اختر اسم الكلية</option>
                        {departments.map((item, index) => {
                          if (item.active) {
                            return <option key={index + 5}>{item.name}</option>;
                          }
                        })}
                      </select>
                    </td>
                  </tr>
                ) : (
                  <tr key={index + 4}>
                    {perms.map((permItem, idx) => {
                      if (permItem.permission_id === 7 && permItem.active) {
                        return (
                          <td
                            className="border border-gray-300 px-4 py-2"
                            key={idx}
                          >
                            <button
                              onClick={() => {
                                handleActivateMajor(item.id, !item.active);
                              }}
                              className={`text-white py-1 px-2 rounded ${
                                item.active
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {item.active ? 'ايقاف' : 'تفعيل'}
                            </button>
                          </td>
                        );
                      }
                      return null;
                    })}
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
                      {item.credits_needed}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.major_name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 w-1/6">
                      {dep?.name}
                    </td>
                  </tr>
                );
              })
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

export default Page;
