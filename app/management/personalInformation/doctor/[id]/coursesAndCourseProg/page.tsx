'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { ClassesInfoType, ClassesType, CheckedType } from '@/app/types/types';
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

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [classes, setClasses] = useState<ClassesInfoType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `/api/course/doctorCourses/${params.id}`
          );
          const message: ClassesType[] = response.data.message;

          const classPromises = message.map(async (section) => {
            const responseReq = await axios.get(
              `/api/getAll/getAllClassInfo/${section.section_id}`
            );
            const { message: classMessage }: { message: ClassesInfoType[] } =
              responseReq.data;
            return classMessage;
          });
          const classData = await Promise.all(classPromises);
          const classes = classData.flat();
          setClasses(classes);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [params.id, user]);

  return (
    <div className="absolute w-[80%] flex flex-col text-sm p-10 justify-content items-center">
      <table className="w-[900px] m-10">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              اسم المجموعة
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              اسم المادة
            </th>
          </tr>
        </thead>
        <tbody>
          {classes.map((course, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">
                {course.section?.name}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.course.course_name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
                const matchingClasses = classes.filter((Class) => {
                  const classStart = Class.class.starts_at;
                  const classEnd = Class.class.ends_at;
                  const hourId = hour.id;
                  return (
                    Class.class.day === day &&
                    (classStart === hourId ||
                      (classStart < hourId && classEnd >= hourId + 1))
                  );
                });

                return (
                  <td key={day} className="py-2 px-4 border-b">
                    {matchingClasses.map((cls, idx) => (
                      <div key={idx}>
                        {cls?.section?.name} - {cls.class.location}
                      </div>
                    ))}
                  </td>
                );
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
