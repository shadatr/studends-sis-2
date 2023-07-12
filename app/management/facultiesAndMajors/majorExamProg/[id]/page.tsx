'use client';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import {
  AddCourseType,
  ExamProgramType,
  MajorCourseType,
  MajorRegType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { redirect } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const [courses, setCourses] = useState<AddCourseType[]>([]);
  const [majorcCourses, setMajorCourses] = useState<MajorCourseType[]>([]);
  const [examProg, setExamProg] = useState<ExamProgramType[]>([]);
  const [major, setMajor] = useState<string>('');
  const printableContentRef = useRef<HTMLDivElement>(null);

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

      const responseMaj = await axios.get(`/api/majorEnrollment/${params.id}`);
      const messageMaj: MajorRegType[] = responseMaj.data.message;
      setMajor(messageMaj[0].major_name);

      const progClassData = await Promise.all(progClassPromises);
      const programClass = progClassData.flat();
      setExamProg(programClass);
    };
    fetchPosts();
  }, [params]);

  const handlePrint = useReactToPrint({
    content: () => printableContentRef.current,
  });

  return (
    <div className="flex flex-col absolute w-[80%] mt-7 items-center justify-center ">
      <button
        onClick={handlePrint}
        className="flex bg-green-500 hover:bg-green-600 p-2 m-5 text-white rounded-md w-[200px] justify-center items-center"
      >
        طباعة جدول الامتحانات
      </button>
      <div ref={printableContentRef}>
        <h1 className="flex justify-center items-center text-[30px] w-[1000px] m-5">
          جدول الامتحانات تخصص {major}
        </h1>
        <table className="w-full bg-white shadow-md rounded-md">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-gray-200 text-gray-700">القاعة</th>
              <th className="py-2 px-4 bg-gray-200 text-gray-700">
                مدة الامتحان
              </th>
              <th className="py-2 px-4 bg-gray-200 text-gray-700">الساعة</th>
              <th className="py-2 px-4 bg-gray-200 text-gray-700">
                اسم المادة
              </th>
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
    </div>
  );
};

export default Page;
