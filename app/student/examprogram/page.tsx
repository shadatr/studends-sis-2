'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  StudenCourseType,
  ExamProgramType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';


const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [courses, setCourses] = useState<StudenCourseType[]>([]);
  const [examProg, setExamProg] = useState<ExamProgramType[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseCourseEnroll = await axios.get(
          `/api/getAll/studentCoursesApprove/${user?.id}`
        );
        const messageCourseEnroll: StudenCourseType[] =
          responseCourseEnroll.data.message;
        setCourses(messageCourseEnroll);
        

        const progClassPromises = messageCourseEnroll.map(async (course) => {
          const responseReq = await axios.get(`/api/examProg/${course.course.id}`);
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
    };

    fetchData();
  }, [user]);


 
  return (
    <div className="flex flex-col absolute w-[80%] mt-7 items-center justify-center ">
     
      <table className="w-full bg-white shadow-md rounded-md">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">القاعة</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">
              مدة الامتحان
            </th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الساعة</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">اسم المادة</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {examProg.map((item, index) => {
            const selectcourse = courses.find(
              (course) => course.course?.id == item.course_id
            );
            return (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{item.location}</td>
                <td className="py-2 px-4 border-b">{item.duration}</td>
                <td className="py-2 px-4 border-b">{item.hour}</td>
                <td className="py-2 px-4 border-b">
                  {selectcourse?.course?.course_name}
                </td>
                <td className="py-2 px-4 border-b">{item.date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
