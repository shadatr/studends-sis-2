'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  MajorCourseType,
  SectionType,
  ClassesInfoType,
  MajorRegType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const [classes, setClasses] = useState<ClassesInfoType[]>([]);
  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<MajorRegType>();
  const [type, setType] = useState<string>('1');

  useEffect(() => {
    const fetchPosts = async () => {
      const resp = await axios.get('/api/major/getMajors');
      const message: MajorRegType[] = resp.data.message;
      setMajors(message);
    };
    fetchPosts();
  }, []);

  const handleSubmit = async () => {
    const resMajorCourses = await axios.get(
      `/api/course/courseMajorReg/${selectedMajor?.id}`
    );
    const messageMajorCour: MajorCourseType[] = await resMajorCourses.data
      .message;

    const sectionsPromises = messageMajorCour.map(async (course) => {
      const responseReq = await axios.get(
        `/api/getAll/getAllSections/${course.course_id}`
      );
      const { message: secMessage }: { message: SectionType[] } =
        responseReq.data;
      return secMessage;
    });
    const sectionData = await Promise.all(sectionsPromises);
    const sections = sectionData.flat();

    const classPromises = sections.map(async (section) => {
      const responseReq = await axios.get(
        `/api/getAll/getAllClassInfo/${section.id}`
      );
      const { message: classMessage }: { message: ClassesInfoType[] } =
        responseReq.data;
      return classMessage;
    });

    const classData = await Promise.all(classPromises);
    const classes = classData.flat();

    const clss: ClassesInfoType[] = [];
    classes.forEach((cls) => {
      if (type === '1') {
        clss.push(cls);
      } else if (
        type === '2' &&
        cls.class.publish_grades == false &&
        !cls.courseEnrollements.find((c) => c.result == null)
      ) {
        clss.push(cls);
      } else if (type === '3' && cls.class.publish_grades) {
        clss.push(cls);
      } else if (
        type === '4' &&
        cls.courseEnrollements.find((c) => c.result == null)
      ) {
        clss.push(cls);
      }
    });
    setClasses(clss);
  };

  return (
    <div className="flex flex-col absolute w-[80%]  items-center justify-center text-[16px]">
      <div className="flex flex-row m-5">
        <button
          onClick={handleSubmit}
          className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white w-[150px]"
        >
          بحث
        </button>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setType(e.target.value)}
          className="px-2  bg-gray-200 border-2 border-black rounded-md ml-4 w-[200px]"
        >
          <option value={'1'}>جميع المجموعات</option>
          <option value={'2'}>في انتظار قبول الدرجات</option>
          <option value={'3'}>تم قبول الدرجات</option>
          <option value={'4'}>لم يتم ادخال جميع الدرجات</option>
        </select>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => {
            const maj = majors.find((i) => i.major_name === e.target.value);
            setSelectedMajor(maj);
          }}
          className="px-2  bg-gray-200 border-2 border-black rounded-md ml-4 w-[200px]"
        >
          <option>اختر التخصص</option>
          {majors.map((item) => (
            <option key={item.id}>{item.major_name}</option>
          ))}
        </select>
      </div>
      {selectedMajor && (
        <div>
          <table className="w-[1100px]">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  الدكتور
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  المجموعة
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  المادة
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  رقم المادة
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((Class, index) => {
                return (
                  <tr key={index + 1}>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.doctor?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        href={`/management/course/managementWork/courseStudents/${Class.class.section_id}`}
                      >
                        {Class.section?.name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        href={`/management/course/managementWork/courseStudents/${Class.class.section_id}`}
                      >
                        {Class.course?.course_name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.course?.course_number}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Page;
