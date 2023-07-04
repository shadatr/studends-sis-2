'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  AddCourseType,
  ExamProgramType,
  MajorCourseType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { redirect } from 'next/navigation';

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const [courses, setCourses] = useState<AddCourseType[]>([]);
  const [majorcCourses, setMajorCourses] = useState<MajorCourseType[]>([]);
  const [examProg, setExamProg] = useState<ExamProgramType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get(`/api/course/courseRegistration`).then(async (resp) => {
        const message: AddCourseType[] = resp.data.message;
        setCourses(message);
      });

      const resp = await axios.get(`/api/course/courseMajorReg/${params.id}`);
      const messageCourseMaj: MajorCourseType[] = resp.data.message;
      setMajorCourses(messageCourseMaj);

      const progClassPromises = messageCourseMaj.map(async (course) => {
        const responseReq = await axios.get(
          `/api/examProg/${course.course_id}`,
          { headers: { 'Cache-Control': 'no-store' } }
        );
        const { message: courseMessage }: { message: ExamProgramType[] } =
          responseReq.data;
        return courseMessage;
      });

      const progClassData = await Promise.all(progClassPromises);
      const programClass = progClassData.flat();
      setExamProg(programClass);
      console.log(programClass);
    };
    fetchPosts();
  }, [params]);

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
            const selectMajorCourse = majorcCourses.find(
              (course) => course.course_id == item.course_id
            );
            const selectcourse = courses.find(
              (course) => course.id == selectMajorCourse?.course_id
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
