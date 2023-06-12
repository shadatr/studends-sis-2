'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {
  AddCourse2Type,
  SectionType,
  DoctorCourse2Type,
} from '@/app/types/types';
import Link from 'next/link';

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }

  const user = session.data?.user;

  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [doctorCourses, setDoctorCourses] = useState<DoctorCourse2Type[]>(
    []
  );
  const [sections, setSections] = useState<SectionType[]>([]);

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/api/course/courses/${user?.id}/doctor`
        );
        const message: SectionType[] = response.data.message;
        setSections(message);

        const coursesPromises = message.map(async (section) => {
          const responseReq = await axios.get(
            `/api/getAll/getSpecificCourse/${section.course_id}`
          );
          const { message: courseMessage }: { message: AddCourse2Type[] } =
            responseReq.data;
          return courseMessage;
        });

        const courseData = await Promise.all(coursesPromises);
        const courses = courseData.flat();
        setCourses(courses);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setRefresh(!refresh);
    };

    fetchData();
  }, [user, refresh]);

  useEffect(() => {
    const updatedStudentCourses: DoctorCourse2Type[] = [];

    sections.map((sec) => {

      const studentCourse = courses.find(
        (course) => course.id == sec.course_id
      );

      if (studentCourse) {
          const data = {
            course_name: studentCourse.course_name,
            section: sec,
          };
          updatedStudentCourses.push(data);
          console.log(updatedStudentCourses);
        }
      
    });

    setDoctorCourses(updatedStudentCourses);
  }, [refresh]);

  return (
    <div className="absolute w-[80%] flex flex-col text-sm p-10 justify-content items-center ">
      <table className="w-[900px] m-10">
        <thead>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            عدد الطلاب
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            اسم المجموعة
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            اسم المادة
          </th>
        </thead>
        <tbody>
          {doctorCourses.map((course, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">
                {course.section?.students_num}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.section?.name}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.course_name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
