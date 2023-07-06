/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import {
  AddCourseType,
  AssignPermissionType,
  LetterGradesType,
  LettersType,
  MajorRegType,
  PersonalInfoType,
  StudenCourseType,
  TranscriptType,
  GetPermissionType,
  StudenCourseGPAType,
  MajorCourseType,
} from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';

const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [edit, setEdit] = useState(false);
  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [active, setActive] = useState<boolean>();
  const [allCourses, setAllCourses] = useState<AddCourseType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Tab 1');
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const course = useRef<HTMLInputElement>(null);
  const [loadCourses, setLoadCourse] = useState(false);
  const [credits, setCredits] = useState('');
  const [hours, setHours] = useState('');
  const [mid, setMid] = useState('');
  const [final, setFinal] = useState('');
  const [classWork, setClassWork] = useState('');
  const [newItemCourse, setNewItemCourse] = useState('');
  const [passingGrade, setPassingGrade] = useState('');
  const [courseNumber, setCourseNumber] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      const resp = await axios.get('/api/major/majorReg');
      const message: MajorRegType[] = resp.data.message;
      setMajors(message);

      axios.get(`/api/course/courseRegistration`).then((resp) => {
        const message: AddCourseType[] = resp.data.message;
        setAllCourses(message);
      });

      const response = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const messagePer: GetPermissionType[] = response.data.message;
      setPerms(messagePer);



      const responseActive = await axios.get('/api/allPermission/courseRegPer');
      const messageActive: AssignPermissionType[] = responseActive.data.message;
      setActive(messageActive[0].active);
    };
    fetchPosts();
  }, [active, edit, refresh, user, loadCourses]);



 
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleRegisterCourse = () => {
    if (!newItemCourse) {
      toast.error('يجب كتابة اسم المادة');
      return;
    }

    if (
      !(
        credits &&
        hours &&
        passingGrade &&
        newItemCourse &&
        mid &&
        final &&
        classWork
      )
    ) {
      toast.error('يجب ملئ جميع الحقول');
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
      credits: parseInt(credits),
      midterm: parseInt(mid),
      final: parseInt(final),
      class_work: parseInt(classWork),
      hours: parseInt(hours),
      passing_percentage: parseInt(passingGrade),
    };

    axios
      .post(`/api/course/courseRegistration`, data)
      .then((res) => {
        toast.success(res.data.message);
        setLoadCourse(!loadCourses);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const selection = numbers.map((num, index) => (
    <option key={index}>{num}</option>
  ));

  return (
    <div className="absolute flex flex-col w-[80%] items-center justify-center">
      <div className="text-sm flex flex-row ">
        <button
          onClick={() => handleTabClick('Tab 1')}
          className={
            activeTab === 'Tab 1'
              ? ' w-[300px] text-secondary flex bg-darkBlue p-2 justify-center'
              : ' w-[300px]  flex bg-grey p-2 justify-center'
          }
        >
          المواد
        </button>
        <button
          onClick={() => handleTabClick('Tab 2')}
          className={
            activeTab === 'Tab 2'
              ? ' w-[300px] flex bg-darkBlue text-secondary p-2 justify-center'
              : ' w-[300px] flex bg-grey p-2 justify-center'
          }
        >
          التخصصات
        </button>
      </div>
      {activeTab === 'Tab 1' && (
        <>
          {perms.map((permItem, idx) => {
            if (permItem.permission_id === 6 && permItem.active) {
              return (
                <div
                  className="flex flex-row-reverse items-center justify-center  w-[100%] m-10 "
                  key={idx}
                >
                  <input
                    ref={course}
                    dir="rtl"
                    placeholder="ادخل اسم المادة"
                    type="text"
                    className="w-[600px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                    onChange={(e) => setNewItemCourse(e.target.value)}
                  />
                  <input
                    ref={course}
                    dir="rtl"
                    placeholder="ادخل رقم المادة"
                    type="text"
                    className="w-[100px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                    onChange={(e) => setCourseNumber(e.target.value)}
                  />
                  <select
                    id="dep"
                    dir="rtl"
                    onChange={(e) => setCredits(e.target.value)}
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
                    ref={course}
                    dir="rtl"
                    placeholder="نسبة الامتحان النصفي  "
                    type="text"
                    className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                    onChange={(e) => setMid(e.target.value)}
                  />
                  <input
                    ref={course}
                    dir="rtl"
                    placeholder="نسبة الامتحان النهائي  "
                    type="text"
                    className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                    onChange={(e) => setFinal(e.target.value)}
                  />
                  <input
                    ref={course}
                    dir="rtl"
                    placeholder=" نسبة اعمال السنة "
                    type="text"
                    className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                    onChange={(e) => setClassWork(e.target.value)}
                  />

                  <input
                    ref={course}
                    dir="rtl"
                    placeholder="درجة النجاح"
                    type="text"
                    className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                    onChange={(e) => setPassingGrade(e.target.value)}
                  />
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

          <table className="w-[1100px]  ">
            <thead className="">
              <tr>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  درجة النجاح
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  نسبة اعمال السنة{' '}
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  نسبة الامتحان النهائي{' '}
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  نسبة الامتحان النصفي{' '}
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">الكريدت</th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">الساعات</th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  اسم المادة
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  رقم المادة
                </th>
              </tr>
            </thead>
            <tbody>
              {allCourses.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.passing_percentage}
                  </td>
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
              ))}
            </tbody>
          </table>
        </>
      )}
      
      {activeTab === 'Tab 2' && (
        <>
          <p className="flex text-md bg-lightBlue rounded-md p-4 w-[200px] justify-center m-5 items-center">
            تخصصات
          </p>
          <table className="w-[1000px] flex flex-col">
            <thead className="bg-darkBlue text-secondary">
              <tr className="flex flex-row w-full">
                <th className="flex flex-row w-full p-1 items-center justify-end pr-2 pl-2">
                  التخصصات
                </th>
                <th className="flex flex-row  w-1/4  p-1 items-center justify-end pr-2 pl-2">
                  الكليات
                </th>
                <th className="flex flex-row w-1/8 p-1 items-center justify-end pr-2 pl-2">
                  {' 0'}
                </th>
              </tr>
            </thead>
            <tbody>
              {majors.map((item, index) => (
                <tr key={index} className="flex flex-row w-full">
                  <td className="flex flex-row w-full p-1 items-center justify-end pr-2 pl-2">
                    <Link href={`/management/course/${item.id}`}>
                      {item.major_name}
                    </Link>
                  </td>
                  <td className="flex flex-row w-1/4 p-1 items-center justify-end pr-2 pl-2">
                    {item.tb_departments?.name}
                  </td>
                  <td className="flex flex-row w-1/8 p-1 items-center justify-end pr-2 pl-2">
                    {index + 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default page;
