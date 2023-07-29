'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { StudenCourseType, LetterGradesType } from '@/app/types/types';
import { redirect } from 'next/navigation';

const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    redirect('/');
  }

  const [studentCourses, setStudentCourses] = useState<StudenCourseType[]>([]);
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);

  const user = session.data?.user;

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const responseCourseLetter = await axios.get(`/api/exams/letterGrades`);
        const messageCourseLetter: LetterGradesType[] =
          responseCourseLetter.data.message;
        setCourseLetter(messageCourseLetter);

        const responseStudentCourse = await axios.get(
          `/api/getAll/studentCoursesApprove/${user?.id}`
        );

        const messageStudentCourse: StudenCourseType[] =
          responseStudentCourse.data.message;
        setStudentCourses(messageStudentCourse);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="lg:bsolute lg:w-[80%] sm:w-[100%] sm:text-[8px] lg:text-[16px] flex flex-col p-10 justify-content items-center ">
      <table className="m-10 lg:w-[1100px] sm-[350px]">
        <thead>
          <tr>
            <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
              النتيجة
            </th>
            <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
              المجموع
            </th>
            <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
              النسبة
            </th>
            <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
              اعمال السنة
            </th>
            <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
              النسبة
            </th>
            <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
              الامتحان الانهائي
            </th>
            <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
              النسبة
            </th>
            <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
              الامتحان النصفي
            </th>
            <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
              اسم المجموعة
            </th>
            <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
              اسم المادة
            </th>
          </tr>
        </thead>
        <tbody>
          {studentCourses.map((course, index) => {
            if (course.class) {
              const letter = courseLetter.find(
                (item) =>
                  item.course_enrollment_id == course.courseEnrollements.id
              );
              return (
                <tr key={index}>
                  <td
                    className={`border border-gray-300 lg:py-2 lg:px-4 sm:p-1 ${
                      course.courseEnrollements.pass
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-red-500 hover:text-red-600'
                    }`}
                  >
                    {course.class?.publish_grades
                      ? course.courseEnrollements.pass
                        ? `${letter?.letter_grade} ناجح`
                        : `${letter?.letter_grade} راسب`
                      : ''}
                  </td>
                  <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                    {course.class?.publish_grades
                      ? course.courseEnrollements.result
                      : ''}
                  </td>
                  <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                    {course.course?.class_work}%
                  </td>
                  <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                    {course.class?.publish_grades
                      ? course.course.class_work
                      : ''}
                  </td>
                  <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                    {course.course?.final}%
                  </td>
                  <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                    {course.class?.publish_grades
                      ? course.courseEnrollements.final
                      : ' '}
                  </td>
                  <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                    {course.course?.midterm}%
                  </td>
                  <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                    {course.class?.publish_grades
                      ? course.courseEnrollements.midterm
                      : ''}
                  </td>
                  <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                    {course.section?.name}
                  </td>
                  <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                    {course.course?.course_name}
                  </td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
