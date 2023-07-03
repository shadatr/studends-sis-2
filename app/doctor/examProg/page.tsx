'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  AddCourseType,
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

  const [courses, setCourses] = useState<AddCourseType[]>([]);
  const [examProg, setExamProg] = useState<ExamProgramType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/api/course/courses/${user?.id}/doctor`
        );
        const message: SectionType[] = response.data.message;

        const coursesPromises = message.map(async (section) => {
          const responseReq = await axios.get(
            `/api/getAll/getSpecificCourse/${section.course_id}`
          );
          const { message: courseMessage }: { message: AddCourseType[] } =
            responseReq.data;
          return courseMessage;
        });

        const courseData = await Promise.all(coursesPromises);
        const courses = courseData.flat();
        setCourses(courses);

        const progClassPromises = courses.map(async (course) => {
          const responseReq = await axios.get(`/api/examProg/${course.id}`);
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


  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col absolute w-[80%] mt-7 items-center justify-center ">
      <button onClick={handlePrint}>print</button>
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
              (course) => course.id == item.course_id
            );
            return (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{item.location}</td>
                <td className="py-2 px-4 border-b">{item.duration}</td>
                <td className="py-2 px-4 border-b">{item.hour}</td>
                <td className="py-2 px-4 border-b">
                  {selectcourse?.course_name}
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
