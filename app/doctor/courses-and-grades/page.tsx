'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { ClassesInfoType, ClassesType } from '@/app/types/types';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
    <div className="lg:absolute lg:w-[80%] sm:w-[100%] flex flex-col lg:text-sm sm:text-[10px] p-10 justify-content items-center ">
      <table className="lg:w-[900px] sm:w-[350px] m-10">
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
                <Link
                  href={`/doctor/courses-and-grades/courseStudents/${course.section.id}`}
                >
                  {course.section.name}
                </Link>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <Link
                  href={`/doctor/courses-and-grades/courseStudents/${course.section.id}`}
                >
                  {course.course.course_name}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
