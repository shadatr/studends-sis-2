'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {
  CheckedType,
  StudenCourseType,
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

const daysOfWeek = ['friday', 'thursday', 'wednesday', 'tuesday', 'monday'];

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    redirect('/');
  }

  const user = session.data?.user;
  const [courses, setCourses] = useState<StudenCourseType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const responseCourseEnroll = await axios.get(
            `/api/getAll/studentCoursesApprove/${user?.id}`
          );
          const messageCourseEnroll: StudenCourseType[] =
            responseCourseEnroll.data.message;
          setCourses(messageCourseEnroll);

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [ user]);



  return (
    <div className="absolute w-[80%] flex flex-col text-sm p-10 justify-content items-center">
      <table className="w-full bg-white shadow-md rounded-md">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الجمعة</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الخميس</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الاربعاء</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الثلاثاء</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الاثنين</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الوقت</th>
          </tr>
        </thead>
        <tbody>
          {hoursNames.map((hour, hourIndex) => (
            <tr key={hourIndex}>
              {daysOfWeek.map((day) => {
                const matchingClasses = courses.filter((cls) => {
                  if(cls.class){
                  const classStart = cls.class.starts_at;
                  const classEnd = cls.class.ends_at;
                  const hourId = hour.id;
                  return (
                    cls.class.day === day &&
                    (classStart === hourId ||
                      (classStart < hourId && classEnd >= hourId + 1))
                  );}
                });

                if (matchingClasses.length > 0) {
                  return matchingClasses.map((matchingClass) => (
                    <td key={hourIndex} className="py-2 px-4 border-b">
                      {matchingClass.section.name} -{' '}
                      {matchingClass.class.location}
                    </td>
                  ));
                }

                return <td key={day} className="py-2 px-4 border-b"></td>;
              })}
              <td className="py-2 px-4 border-b">{hour.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Page;
