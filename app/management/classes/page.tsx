'use client';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  MajorCourseType,
  SectionType,
  DayOfWeekType,
  CheckedType,
  ClassesInfoType,
  MajorRegType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const hoursNames: CheckedType[] = [
  { id: 8, name: '8:00' },
  { id: 9, name: '9:00' },
  { id: 10, name: '10:00' },
  { id: 11, name: '11:00' },
  { id: 12, name: '12:00' },
  { id: 13, name: '1:00' },
  { id: 14, name: '2:00' },
  { id: 15, name: '3:00' },
  { id: 16, name: '4:00' },
  { id: 17, name: '5:00' },
  { id: 18, name: '6:00' },
  { id: 19, name: '7:00' },
];

const days: DayOfWeekType[] = [
  { name: 'الجمعة', day: 'friday' },
  { name: 'الخميس', day: 'thursday' },
  { name: 'الاربعاء', day: 'wednesday' },
  { name: 'الثلثاء', day: 'tuesday' },
  { name: 'الاثنين', day: 'monday' },
];

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [classes, setClasses] = useState<ClassesInfoType[]>([]);
  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<MajorRegType>();

  useEffect(() => {
    const fetchPosts = async () => {
      const resp = await axios.get('/api/major/getMajors');
      const message: MajorRegType[] = resp.data.message;
      setMajors(message);
    };
    fetchPosts();
  }, []);

  const handleSubmit = async () => {
    const resMajorCourses = await axios.get(
      `/api/course/courseMajorReg/${selectedMajor?.id}`
    );
    const messageMajorCour: MajorCourseType[] = await resMajorCourses.data
      .message;

    const sectionsPromises = messageMajorCour.map(async (course) => {
      const responseReq = await axios.get(
        `/api/getAll/getAllSections/${course.course_id}`
      );
      const { message: secMessage }: { message: SectionType[] } =
        responseReq.data;
      return secMessage;
    });
    const sectionData = await Promise.all(sectionsPromises);
    const sections = sectionData.flat();

    const classPromises = sections.map(async (section) => {
      const responseReq = await axios.get(
        `/api/getAll/getAllClassInfo/${section.id}`
      );
      const { message: classMessage }: { message: ClassesInfoType[] } =
        responseReq.data;
      console.log(classMessage);
      return classMessage;
    });

    const classData = await Promise.all(classPromises);
    const classes = classData.flat();

    setClasses(classes);
  };

  const printableContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printableContentRef.current,
  });

  return (
    <div className="flex flex-col absolute w-[80%]  items-center justify-center text-[16px]">
      <Link
        className="px-4 py-2 bg-green-500 text-white ml-5 rounded-md"
        href={`/management/course/allClasses/${selectedMajor?.id}`}
      >
        جميع محاضرات السنوات الماضية
      </Link>
      <button
        onClick={handlePrint}
        className="flex bg-green-500 hover:bg-green-600 p-2 m-5 text-white rounded-md w-[200px] justify-center items-center"
      >
        طباعة جدول المحاضرات
      </button>
      <div className="flex flex-row m-5">
        <button
          onClick={handleSubmit}
          className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white w-[150px]"
        >
          بحث
        </button>
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
      {selectedMajor && (
        <div ref={printableContentRef}>
          <table className="w-[1100px]">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  الموقع
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  موعد الانتهاء
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  موعد البدأ
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  اليوم
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  الفصل الدراسي
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  الدكتور
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  المجموعة
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  المادة
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  رقم المادة
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((Class, index) => {
                const findDay = days.find((day) => day.day == Class.class?.day);
                const findStartTime = hoursNames.find(
                  (hour) => hour.id == Class.class?.starts_at
                );
                const findEndTime = hoursNames.find(
                  (hour) => hour.id == Class.class?.ends_at
                );
                return (
                  <tr key={index + 1}>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.class?.location}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {findEndTime?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {findStartTime?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {findDay?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.class?.semester}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.doctor?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        href={`/management/course/managementWork/class/${Class.class.section_id}`}
                      >
                        {Class.section?.name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        href={`/management/course/managementWork/class/${Class.class.section_id}`}
                      >
                        {Class.course?.course_name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.course?.course_number}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Page;
