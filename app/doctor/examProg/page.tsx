'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ClassesInfoType,
  ExamProgramType,
  SectionType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [courses, setCourses] = useState<ClassesInfoType[]>([]);
  const [examProg, setExamProg] = useState<ExamProgramType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `/api/course/courses/${user?.id}/doctor`
          );
          const message: SectionType[] = response.data.message;

          const classPromises = message.map(async (section) => {
            const responseReq = await axios.get(
              `/api/getAll/getAllClassInfo/${section.id}`
            );
            const { message: classMessage }: { message: ClassesInfoType[] } =
              responseReq.data;
            return classMessage;
          });
          const classData = await Promise.all(classPromises);
          const classes = classData.flat();
          setCourses(classes);

          const progClassPromises = message.map(async (course) => {
            const responseReq = await axios.get(
              `/api/examProg/${course.course_id}`
            );
            const { message: courseMessage }: { message: ExamProgramType[] } =
              responseReq.data;
            return courseMessage;
          });

          const progClassData = await Promise.all(progClassPromises);
          const programClass = progClassData.flat();
          setExamProg(programClass);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="flex flex-col lg:absolute lg:w-[80%] sm:w-[100%] lg:mt-7 sm:mt-[100px] items-center lg:text-[16px] sm:text-[8px] justify-center ">
      <table className="w-full bg-white shadow-md rounded-md">
        <thead>
          <tr>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">القاعة</th>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">
              مدة الامتحان
            </th>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">الساعة</th>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">اسم المادة</th>
            <th className="lg:py-2 lg:px-4 sm:p-1 bg-gray-200 text-gray-700">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {examProg.map((item, index) => {
            const selectcourse = courses.find(
              (course) => course.course.id == item.course_id
            );
            return (
              <tr key={index}>
                <td className="lg:py-2 lg:px-4 sm:p-1 border-b">
                  {item.location}
                </td>
                <td className="lg:py-2 lg:px-4 sm:p-1border-b">
                  {item.duration}
                </td>
                <td className="lg:py-2 lg:px-4 sm:p-1 border-b">{item.hour}</td>
                <td className="lg:py-2 lg:px-4 sm:p-1 border-b">
                  {selectcourse?.course.course_name}
                </td>
                <td className="lg:py-2 lg:px-4 sm:p-1 border-b">{item.date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
