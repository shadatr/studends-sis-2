'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {
  StudenCourseType,
  DayOfWeekType,
  CheckedType,
} from '@/app/types/types';
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
  { name: 'الاحد', day: 'sunday' },
  { name: 'السبت', day: 'saturday' },
  { name: 'الجمعة', day: 'friday' },
  { name: 'الخميس', day: 'thursday' },
  { name: 'الاربعاء', day: 'wednesday' },
  { name: 'الثلثاء', day: 'tuesday' },
  { name: 'الاثنين', day: 'monday' },
];
const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    redirect('/');
  }

  const [studentCourses, setStudentCourses] = useState<StudenCourseType[]>([]);

  const user = session.data?.user;

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const responseStudentCourse = await axios.get(
          `/api/getAll/studentCoursesApprove/${user?.id}`
        );

        const messageStudentCourse: StudenCourseType[] =
          responseStudentCourse.data.message;
        setStudentCourses(messageStudentCourse);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="absolute w-[80%] flex flex-col p-10 justify-content items-center ">
      <table className="w-[1100px] m-5">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              الكريدت
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              الساعات
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              التوقيت
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              اسم الدكتور
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              اسم المجموعة
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              اسم المادة
            </th>
          </tr>
        </thead>
        <tbody>
          {studentCourses.map((item, index) => {
            if (item.class) {
              const findDay = days.find((day) => day.day === item.class.day);
              const findStartTime = hoursNames.find(
                (hour) => hour.id === item.class.starts_at
              );
              const findEndTime = hoursNames.find(
                (hour) => hour.id === item.class.ends_at
              );

              return (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.course.credits}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.course.hours}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {findDay?.name}/{findStartTime?.name}-{findEndTime?.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.doctor?.name} {item.doctor?.surname}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.section.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.course.course_name}{' '}
                  </td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
