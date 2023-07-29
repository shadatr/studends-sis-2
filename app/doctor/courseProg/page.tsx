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

const daysOfWeek = [
  'friday',
  'thursday',
  'wednesday',
  'tuesday',
  'monday',
  'sunday',
  'saturday',
];

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [classes, setClasses] = useState<ClassesInfoType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `/api/course/doctorCourses/${user?.id}`
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
  }, [user]);

  return (
    <div className="lg:absolute lg:w-[80%] sm:w-[100%]  flex flex-col lg:text-sm sm:text-[8px] lg:p-10 sm:p-3 sm:mt-10 justify-content items-center">
      <table className="w-full bg-white shadow-md rounded-md">
        <thead>
          <tr>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">
              الجمعة
            </th>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">
              الخميس
            </th>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">
              الاربعاء
            </th>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">
              الثلاثاء
            </th>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">
              الاثنين
            </th>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">
              الاحد
            </th>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">
              السبت
            </th>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">
              الوقت
            </th>
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
                  <td key={day} className="lg:py-2 lg:px-4 sm:p-1 border-b">
                    {matchingClasses.map((cls, idx) => (
                      <div key={idx}>
                        {cls?.section?.name} - {cls.class.location}
                      </div>
                    ))}
                  </td>
                );
              })}
              <td className="lg:py-2 lg:px-4 sm:p-1 border-b">{hour.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Page;
