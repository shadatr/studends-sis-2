'use client';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  MajorCourseType,
  MajorRegType,
  AddCourseType,
  GetPermissionType,
  MajorType,
  DepartmentRegType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BsXCircleFill } from 'react-icons/bs';


const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const major = useRef<HTMLInputElement>(null);
  const [select, setSelect] = useState(false);
  const [majors, setMajors] = useState<MajorType[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<MajorRegType>();
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [majorCourses, setMajorCourses] = useState<MajorCourseType[]>([]);
  const [courses, setCourses] = useState<AddCourseType[]>([]);
  const [course, setCourse] = useState<number>();
  const [loadCourses, setLoadCourse] = useState(false);
  const [isOptional, SetIsOptional] = useState<string>('');
  const [departments, setDepartments] = useState<DepartmentRegType[]>([]);
    const department = useRef<HTMLSelectElement>(null);


  useEffect(() => {
    const fetchPosts = async () => {
      const resp = await axios.get('/api/major/getMajors');
      const message: MajorType[] = resp.data.message;
      setMajors(message);

      axios.get('/api/department/departmentRegister').then((resp) => {
        const message: DepartmentRegType[] = resp.data.message;
        setDepartments(message);
      });

      const response = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const message2: GetPermissionType[] = response.data.message;
      setPerms(message2);

      axios.get(`/api/course/courseRegistration`).then(async (resp) => {
        const message: AddCourseType[] = resp.data.message;
        setCourses(message);
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
  }, [user]);

  const handleChangeMajor = async () => {
    const resMajorCourses = await axios.get(
      `/api/course/courseMajorReg/${selectedMajor?.id}/${department.current?.value}`
    );
    const messageMajorCour: MajorCourseType[] = await resMajorCourses.data
      .message;
    setMajorCourses(messageMajorCour);

    const res = await axios.get(`/api/course/courseRegistration`);
    const messageCour: AddCourseType[] = await res.data.message;
    setCourses(messageCour);
    setSelect(true);
  };

  const handleRegisterCourse = () => {
    if (!(course && isOptional &&department!=null)) {
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
        department_id: department.current?.value
          ? parseInt(department.current.value)
          : 0,
        major_id: selectedMajor?.id,
        course_id: course,
        isOptional: opt,
      };

      console.log(data);

      axios
        .post(`/api/course/courseMajorReg/1/1`, data)
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


  return (
    <div className="flex flex-col absolute w-[80%]  items-center justify-center text-[16px]">
      {perms.find((per) => per.permission_id == 7 && per.see) && (
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
              ref={department}
              className="px-2  bg-gray-200 border-2 border-black rounded-md ml-4 w-[200px]"
              defaultValue="القسم"
            >
              <option disabled>القسم</option>
              {departments
                .filter((d) => selectedMajor?.id==d.major_id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
            <select
              id="dep"
              dir="rtl"
              onChange={(e) => {
                const maj = majors.find((i) => i.major_name === e.target.value);
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
            if (
              permItem.permission_id == 7 &&
              permItem.add &&
              selectedMajor &&
              select
            ) {
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
                        {item.course_name}-
                        {majors.find((m) => m.id == item.major_id)?.major_name}
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
