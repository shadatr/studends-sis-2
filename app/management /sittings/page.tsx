'use client';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  MajorCourseType,
  MajorRegType,
  AddCourseType,
  GetPermissionType,
  DepartmentRegType,
  MajorType,
  AssignPermissionType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BsXCircleFill } from 'react-icons/bs';

const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const major = useRef<HTMLInputElement>(null);
  const majorDep = useRef<HTMLSelectElement>(null);
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
  const [activeTab, setActiveTab] = useState<string>('Tab 1');
  const [majors, setMajors] = useState<MajorType[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<MajorRegType>();
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [majorCourses, setMajorCourses] = useState<MajorCourseType[]>([]);
  const [courses, setCourses] = useState<AddCourseType[]>([]);
  const [course, setCourse] = useState<number>();
  const [loadCourses, setLoadCourse] = useState(false);
  const [isOptional, SetIsOptional] = useState<string>('');
  const [allCourses, setAllCourses] = useState<AddCourseType[]>([]);
  const [allCourses2, setAllCourses2] = useState<AddCourseType[]>([]);
  const [credits2, setCredits2] = useState('');
  const [hours, setHours] = useState('');
  const [mid, setMid] = useState('');
  const [final, setFinal] = useState('');
  const [classWork, setClassWork] = useState('');
  const [newItemCourse, setNewItemCourse] = useState('');
  const [courseNumber, setCourseNumber] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      const resp = await axios.get('/api/major/getMajors');
      const message: MajorType[] = resp.data.message;
      setMajors(message);
      setMajors2(message);

      const response = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const message2: GetPermissionType[] = response.data.message;
      setPerms(message2);

      axios.get('/api/department/departmentRegister').then((resp) => {
        const message: DepartmentRegType[] = resp.data.message;
        setDepartments(message);
        setDepartments2(message);
      });

      axios.get(`/api/course/courseRegistration`).then(async (resp) => {
        const message: AddCourseType[] = resp.data.message;
        setCourses(message);
      });

      axios.get(`/api/course/courseRegistration`).then((resp) => {
        const message: AddCourseType[] = resp.data.message;
        setAllCourses(message);
        setAllCourses2(message);
      });
      if (user) {
        const response = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const messagePer: GetPermissionType[] = response.data.message;
        setPerms(messagePer);
      }
    };

    fetchPosts();
  }, [user, load, edit, edit2]);

  const handleChangeMajor = async () => {
    const resMajorCourses = await axios.get(
      `/api/course/courseMajorReg/${selectedMajor?.id}`
    );
    const messageMajorCour: MajorCourseType[] = await resMajorCourses.data
      .message;
    setMajorCourses(messageMajorCour);

    const res = await axios.get(`/api/course/courseRegistration`);
    const messageCour: AddCourseType[] = await res.data.message;
    setCourses(messageCour);
  };

  const handleRegisterCourse = () => {
    if (!(course && isOptional)) {
      toast.error('يجب ملئ جميع الحقول');
      return;
    }

    let duplicateFound = false;

    majorCourses.forEach((item) => {
      if (item.course_id == course) {
        duplicateFound = true;
        return;
      }
    });

    if (duplicateFound) {
      toast.error('هذه المادة مسجلة بالفعل');
      return;
    }

    const opt = isOptional == 'اختياري' ? true : false;

    if (course) {
      const data = {
        major_id: selectedMajor?.id,
        course_id: course,
        isOptional: opt,
      };

      axios
        .post(`/api/course/courseMajorReg/1`, data)
        .then((res) => {
          handleChangeMajor();
          toast.success(res.data.message);
          setLoadCourse(!loadCourses);
          const dataUsageHistory = {
            id: user?.id,
            type: 'admin',
            action: ' تعديل مواد تخصص' + major,
          };
          axios.post('/api/usageHistory', dataUsageHistory);
        })
        .catch((err) => {
          toast.error(err.response.data.message);
        });
    }
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleDeleteCourse = (item?: number) => {
    axios
      .post(`/api/course/majorCourses/1`, item)
      .then((res) => {
        handleChangeMajor();
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: `${selectedMajor?.major_name} تعديل مواد تخصص`,
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };
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

  const handleRegisterCourse2 = () => {
    if (!newItemCourse) {
      toast.error('يجب كتابة اسم المادة');
      return;
    }
    if (!(credits2 && hours && newItemCourse && mid && final && classWork)) {
      toast.error('يجب ملئ جميع الحقول');
      return;
    }

    const result = parseInt(mid) + parseInt(final) + parseInt(classWork);

    if (result != 100) {
      toast.error('توزيع الدرجات غير صحيح');
      return;
    }

    let duplicateFound = false;

    allCourses.forEach((item) => {
      if (
        item.course_name == newItemCourse ||
        item.course_number == courseNumber
      ) {
        duplicateFound = true;
        return;
      }
    });

    if (duplicateFound) {
      toast.error('هذه المادة مسجلة بالفعل');
      return;
    }

    const data = {
      course_name: newItemCourse,
      course_number: courseNumber,
      credits: parseInt(credits2),
      midterm: parseInt(mid),
      final: parseInt(final),
      class_work: parseInt(classWork),
      hours: parseInt(hours),
    };

    axios
      .post(`/api/course/courseRegistration`, data)
      .then((res) => {
        toast.success(res.data.message);
        setLoadCourse(!loadCourses);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: 'تعديل مواد الجامعة',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const handleInputChangeCourses = (
    e: string,
    field: keyof AddCourseType,
    id?: number
  ) => {
    const updatedData = allCourses2.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          [field]: e,
        };
      }
      return i;
    });
    setAllCourses2(updatedData);
    if (field == 'course_name') {
    }
  };

  const handleSubmit = () => {
    setEdit(false);
    setLoadCourse(!loadCourses);
    axios
      .post(`/api/course/editCourse`, allCourses2)
      .then((res) => {
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل مواد',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((error) => {
        toast.error(error.res);
      });
  };

  const selection = numbers.map((num, index) => (
    <option key={index}>{num}</option>
  ));

  return (
    <div className="flex flex-col absolute w-[80%]  items-center justify-center text-[16px]">
      <div className="text-sm flex flex-row ">
        <button
          onClick={() => handleTabClick('Tab 1')}
          className={
            activeTab === 'Tab 1'
              ? ' w-[200px] text-secondary flex bg-darkBlue p-2 justify-center'
              : ' w-[200px]  flex bg-grey p-2 justify-center'
          }
        >
          الاقسام و التخصصات
        </button>
        <button
          onClick={() => handleTabClick('Tab 2')}
          className={
            activeTab === 'Tab 2'
              ? ' w-[200px] flex bg-darkBlue text-secondary p-2 justify-center'
              : ' w-[200px] flex bg-grey p-2 justify-center'
          }
        >
          مواد الجامعة
        </button>
        <button
          onClick={() => handleTabClick('Tab 3')}
          className={
            activeTab === 'Tab 3'
              ? ' w-[200px] flex bg-darkBlue text-secondary p-2 justify-center'
              : ' w-[200px] flex bg-grey p-2 justify-center'
          }
        >
          مواد التخصصات
        </button>
      </div>
      {activeTab === 'Tab 1' &&
        perms.find((per) => per.permission_id == 10 && per.see) && (
          <>
            <div className="flex flex-col  items-center justify-center text-sm">
              <p className="flex text-md bg-lightBlue rounded-md p-4 w-[200px] justify-center m-5 items-center">
                اقسام
              </p>
              {perms.map((permItem, idx) => {
                if (permItem.permission_id === 10 && permItem.add) {
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
                    </>
                  );
                }
                return null;
              })}
              {perms.map((permItem, idx) => {
                if (permItem.permission_id === 10 && permItem.edit) {
                  return (
                    <button
                      className="m-2 bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
                      key={idx}
                      type="submit"
                      onClick={() =>
                        edit ? handleSubmitDepartment() : setEdit(!edit)
                      }
                    >
                      {edit2 ? 'ارسال' : 'تعديل'}
                    </button>
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
                            if (
                              permItem.permission_id === 10 &&
                              permItem.edit
                            ) {
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
                            if (
                              permItem.permission_id === 10 &&
                              permItem.edit
                            ) {
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
              {perms.map((item, idx) =>
                item.permission_id === 10 && item.add ? (
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
                      onChange={(e) => {
                        setNewMajorDep(e.target.value);
                      }}
                      className="p-4 text-sm bg-lightBlue "
                      defaultValue="اختر اسم الكلية"
                    >
                      <option disabled>اختر اسم الكلية</option>
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

              {perms.map((permItem, idx) => {
                if (permItem.permission_id === 10 && permItem.edit) {
                  return (
                    <button
                      className="m-2 bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
                      key={idx}
                      type="submit"
                      onClick={() =>
                        edit2 ? handleSubmitMajor() : setEdit2(!edit2)
                      }
                    >
                      {edit2 ? 'ارسال' : 'تعديل'}
                    </button>
                  );
                }
                return null;
              })}
              <table className="w-[1000px] ">
                <thead>
                  <tr>
                    {perms.map((permItem, idx) => {
                      if (permItem.permission_id === 10 && permItem.edit) {
                        return (
                          <th
                            className="py-2 px-4 bg-gray-200 text-gray-700"
                            key={idx}
                          ></th>
                        );
                      }
                      return null;
                    })}
                    <th className="py-2 px-4 bg-gray-200 text-gray-700">
                      كرديت
                    </th>
                    <th className="py-2 px-4 bg-gray-200 text-gray-700">
                      التخصص
                    </th>
                    <th className="py-2 px-4 bg-gray-200 text-gray-700">
                      الكلية
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {majors.length ? (
                    majors.map((item, index) => {
                      const item2 = majors2.find(
                        (item2) => item2.id == item.id
                      );
                      const dep = departments.find(
                        (item3) => item3.id == item.department_id
                      );
                      return edit2 ? (
                        <tr key={index + 2}>
                          {perms.map((permItem, idx) => {
                            if (
                              permItem.permission_id === 10 &&
                              permItem.edit
                            ) {
                              return (
                                <td
                                  className="border border-gray-300 px-4 py-2"
                                  key={idx + 8}
                                >
                                  <button
                                    onClick={() => {
                                      handleActivateMajor(
                                        item.id,
                                        !item.active
                                      );
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
                                  return (
                                    <option key={index + 5}>{item.name}</option>
                                  );
                                }
                              })}
                            </select>
                          </td>
                        </tr>
                      ) : (
                        <tr key={index + 4}>
                          {perms.map((permItem, idx) => {
                            if (
                              permItem.permission_id === 10 &&
                              permItem.edit
                            ) {
                              return (
                                <td
                                  className="border border-gray-300 px-4 py-2"
                                  key={idx}
                                >
                                  <button
                                    onClick={() => {
                                      handleActivateMajor(
                                        item.id,
                                        !item.active
                                      );
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
          </>
        )}
      {activeTab === 'Tab 2' &&
        perms.find((per) => per.permission_id == 6 && per.see) && (
          <>
            {perms.map((permItem, idx) => {
              if (permItem.permission_id === 6 && permItem.add) {
                return (
                  <>
                    <div
                      className="flex flex-row-reverse items-center justify-center  w-[100%] m-10 "
                      key={idx}
                    >
                      <input
                        dir="rtl"
                        placeholder="ادخل اسم المادة"
                        type="text"
                        className="w-[600px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                        onChange={(e) =>
                          setNewItemCourse(e.target.value.trim())
                        }
                      />
                      <input
                        dir="rtl"
                        placeholder="ادخل رقم المادة"
                        type="text"
                        className="w-[100px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                        onChange={(e) => setCourseNumber(e.target.value)}
                      />
                      <select
                        id="dep"
                        dir="rtl"
                        onChange={(e) => setCredits2(e.target.value)}
                        className="p-4 bg-lightBlue "
                        defaultValue="الكريدت"
                      >
                        <option disabled>الكريدت</option>
                        {selection}
                      </select>
                      <select
                        id="dep"
                        dir="rtl"
                        onChange={(e) => setHours(e.target.value)}
                        className="p-4 bg-lightBlue "
                        defaultValue="الساعات"
                      >
                        <option disabled>الساعات</option>
                        {selection}
                      </select>
                      <input
                        dir="rtl"
                        placeholder="نسبة الامتحان النصفي  "
                        type="number"
                        className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                        onChange={(e) => setMid(e.target.value)}
                      />
                      <input
                        dir="rtl"
                        placeholder="نسبة الامتحان النهائي  "
                        type="number"
                        className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                        onChange={(e) => setFinal(e.target.value)}
                      />
                      <input
                        dir="rtl"
                        placeholder=" نسبة اعمال السنة "
                        type="number"
                        className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                        onChange={(e) => setClassWork(e.target.value)}
                      />
                      <button
                        className="bg-darkBlue text-secondary p-3 w-[200px] rounded-[5px]"
                        type="submit"
                        onClick={handleRegisterCourse2}
                      >
                        سجل
                      </button>
                    </div>
                  </>
                );
              }
              return null;
            })}
            {perms.map((permItem, idx) => {
              if (permItem.permission_id === 6 && permItem.edit) {
                return (
                  <button
                    key={idx}
                    className="m-2 bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
                    type="submit"
                    onClick={() => (edit ? handleSubmit() : setEdit(!edit))}
                  >
                    {edit ? 'ارسال' : 'تعديل'}
                  </button>
                );
              }
              return null;
            })}

            <table className="w-[1100px]  ">
              <thead className="">
                <tr>
                  <th className="py-2 px-4 bg-gray-200 text-gray-700">
                    نسبة اعمال السنة{' '}
                  </th>
                  <th className="py-2 px-4 bg-gray-200 text-gray-700">
                    نسبة الامتحان النهائي{' '}
                  </th>
                  <th className="py-2 px-4 bg-gray-200 text-gray-700">
                    نسبة الامتحان النصفي{' '}
                  </th>
                  <th className="py-2 px-4 bg-gray-200 text-gray-700">
                    الكريدت
                  </th>
                  <th className="py-2 px-4 bg-gray-200 text-gray-700">
                    الساعات
                  </th>
                  <th className="py-2 px-4 bg-gray-200 text-gray-700">
                    اسم المادة
                  </th>
                  <th className="py-2 px-4 bg-gray-200 text-gray-700">
                    رقم المادة
                  </th>
                </tr>
              </thead>
              <tbody>
                {allCourses.map((item, index) => {
                  const item2 = allCourses2.find((i) => i.id == item.id);
                  return edit ? (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          dir="rtl"
                          type="number"
                          className="w-[70px] "
                          value={item2?.class_work}
                          onChange={(e) =>
                            handleInputChangeCourses(
                              e.target.value,
                              'class_work',
                              item.id
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          dir="rtl"
                          type="number"
                          value={item2?.final}
                          className="w-[70px] "
                          onChange={(e) =>
                            handleInputChangeCourses(
                              e.target.value,
                              'final',
                              item.id
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          dir="rtl"
                          type="number"
                          value={item2?.midterm}
                          className="w-[70px] "
                          onChange={(e) =>
                            handleInputChangeCourses(
                              e.target.value,
                              'midterm',
                              item.id
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          dir="rtl"
                          type="number"
                          value={item2?.credits}
                          className="w-[70px] "
                          onChange={(e) =>
                            handleInputChangeCourses(
                              e.target.value,
                              'credits',
                              item.id
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          dir="rtl"
                          type="number"
                          className="w-[70px] "
                          value={item2?.hours}
                          onChange={(e) =>
                            handleInputChangeCourses(
                              e.target.value,
                              'hours',
                              item.id
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          dir="rtl"
                          type="text"
                          value={item2?.course_name}
                          className="w-[150px] "
                          onChange={(e) =>
                            handleInputChangeCourses(
                              e.target.value,
                              'course_name',
                              item.id
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          dir="rtl"
                          type="text"
                          value={item2?.course_number}
                          className="w-[80px] "
                          onChange={(e) =>
                            handleInputChangeCourses(
                              e.target.value,
                              'course_number',
                              item.id
                            )
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.class_work}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.final}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.midterm}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.credits}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.hours}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Link
                          href={`/management/course/managementWork/section/${item.id}`}
                        >
                          {item.course_name}
                        </Link>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.course_number}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      {activeTab === 'Tab 3' &&
        perms.find((per) => per.permission_id == 7 && per.see) && (
          <>
            <div className="flex flex-row m-5">
              <button
                onClick={handleChangeMajor}
                className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white w-[150px]"
              >
                بحث
              </button>
              <select
                id="dep"
                dir="rtl"
                onChange={(e) => {
                  const maj = majors.find(
                    (i) => i.major_name === e.target.value
                  );
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
              if (permItem.permission_id == 7 && permItem.add) {
                return (
                  <div
                    className="flex flex-row-reverse items-center justify-center  w-[100%] m-10 "
                    key={idx}
                  >
                    <select
                      id="dep"
                      dir="rtl"
                      onChange={(e) => setCourse(parseInt(e.target.value, 10))}
                      className="p-4 bg-lightBlue"
                      defaultValue="المادة"
                    >
                      <option disabled>المادة</option>
                      {courses.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.course_name}
                        </option>
                      ))}
                    </select>

                    <select
                      id="dep"
                      dir="rtl"
                      onChange={(e) => SetIsOptional(e.target.value)}
                      className="p-4  bg-lightBlue "
                      defaultValue="اجباري/اختياري"
                    >
                      <option disabled> اجباري/اختياري</option>
                      <option>اختياري </option>
                      <option> اجباري</option>
                    </select>
                    <button
                      className="bg-darkBlue text-secondary p-3 w-[200px] rounded-[5px]"
                      type="submit"
                      onClick={handleRegisterCourse}
                    >
                      سجل
                    </button>
                  </div>
                );
              }
              return null;
            })}

            <table className="w-[800px]  ">
              <thead>
                <tr>
                  {perms.map((permItem, idx) => {
                    if (permItem.permission_id === 7 && permItem.Delete) {
                      return (
                        <th
                          key={idx + 7}
                          className="py-2 px-4 bg-gray-200 text-gray-700"
                        ></th>
                      );
                    }
                    return null;
                  })}
                  <th className="py-2 px-4 bg-gray-200 text-gray-700">
                    اجباري/اختياري
                  </th>
                  <th className="py-2 px-4 bg-gray-200 text-gray-700">
                    اسم المادة
                  </th>
                  <th className="py-2 px-4 bg-gray-200 text-gray-700">
                    رقم المادة
                  </th>
                </tr>
              </thead>
              <tbody>
                {majorCourses.map((item, index) => {
                  const selectedCourse = courses.find(
                    (course) => course.id == item.course_id
                  );
                  return (
                    <tr key={index}>
                      {perms.map((permItem, idx) => {
                        if (permItem.permission_id === 7 && permItem.Delete) {
                          return (
                            <td
                              className="border border-gray-300 px-4 py-2"
                              key={idx + 9}
                            >
                              <BsXCircleFill
                                onClick={() => handleDeleteCourse(item.id)}
                              />
                            </td>
                          );
                        }
                        return null;
                      })}
                      <td className="border border-gray-300 px-4 py-2">
                        {item.isOptional ? 'اختياري' : 'اجباري'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Link
                          href={`/management/course/managementWork/section/${item.course_id}`}
                        >
                          {selectedCourse?.course_name}
                        </Link>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {selectedCourse?.course_number}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
    </div>
  );
};

export default Page;
