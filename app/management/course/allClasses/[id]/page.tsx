'use client';
import axios from 'axios';
import React, { useState } from 'react';
import {
  MajorCourseType,
  SectionType,
  DayOfWeekType,
  CheckedType,
  ClassesInfoType,
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

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }
  const [classes, setClasses] = useState<ClassesInfoType[]>([]);
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');

  const handleSubmit = async () => {

    const resMajorCourses = await axios.get(
      `/api/course/courseMajorReg/${params.id}`
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
        `/api/getAll/allClasses/${section.id}/${semester}-${year}`
      );
      const { message: classMessage }: { message: ClassesInfoType[] } =
        responseReq.data;
      return classMessage;
    });

    const classData = await Promise.all(classPromises);
    const classes = classData.flat();

    setClasses(classes);
  };

  return (
    <div className="flex flex-col absolute w-[90%]  items-center justify-center text-[16px]">
      <div className="flex flex-row m-5">
        <button
          onClick={handleSubmit}
          className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white w-[150px]"
        >
          بحث
        </button>
        <input
          dir="rtl"
          placeholder=" السنة"
          type="text"
          className="w-20 px-4 py-1 bg-gray-200 border-2 border-black rounded-md ml-4"
          onChange={(e) => setYear(e.target.value)}
        />
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setSemester(e.target.value)}
          className="px-4 py-1 bg-gray-200 border-2 border-black rounded-md ml-4"
          defaultValue="الفصل"
        >
          <option disabled>الفصل</option>
          <option>خريف</option>
          <option>ربيع</option>
        </select>
      </div>
      <table className="w-[1000px]">
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
              <tr key={index}>
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
                    href={`/management/course/AllClassesInfo/${Class.class.section_id}//${semester}-${year}`}
                  >
                    {Class.section?.name}
                  </Link>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <Link
                    href={`/management/course/AllClassesInfo/${Class.class.section_id}//${semester}-${year}`}
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
  );
};

export default Page;
