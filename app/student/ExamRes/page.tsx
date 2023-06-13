'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {
  AddCourse2Type,
  ClassesType,
  SectionType,
  StudentClassType,
  StudentCourseType,
} from '@/app/types/types'; 

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    throw new Error('Unauthorized');
  }

  const user = session.data?.user;

  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [studentCourses, setStudentCourses] = useState<StudentCourseType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<StudentClassType[]>([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseCourseEnroll = await axios.get(
          `/api/getAll/getAllCourseEnroll/${user?.id}`
        );
        const messageCourseEnroll: StudentClassType[] =
          responseCourseEnroll.data.message;
        setCourseEnrollments(messageCourseEnroll);

        const classPromises = messageCourseEnroll.map(async (Class) => {
          const responseReq = await axios.get(
            `/api/getAll/getSpecificClass/${Class.class_id}`
          );
          const { message: classMessage }: { message: ClassesType[] } =
            responseReq.data;
          return classMessage;
        });

        const classData = await Promise.all(classPromises);
        const classes = classData.flat();
        setClasses(classes);

        const sectionsPromises = classes.map(async (course) => {
          const responseReq = await axios.get(
            `/api/getAll/getSpecificSection/${course.section_id}`
          );
          const { message: secMessage }: { message: SectionType[] } =
            responseReq.data;
          return secMessage;
        });

        const sectionData = await Promise.all(sectionsPromises);
        const sections = sectionData.flat();
        setSections(sections);

        const coursesPromises = sections.map(async (section) => {
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
    const updatedStudentCourses: StudentCourseType[] = [];

    courseEnrollments.map((course) => {
      const studenClass = classes.find((Class) => Class.id == course.class_id);

      const studentSection = sections.find(
        (sec) => sec.id == studenClass?.section_id
      );

      const studentCourse = courses.find(
        (course) => course.id == studentSection?.course_id
      );

      if (studentCourse){ 
        if(course.approved){{
            const data = {
              course_name: studentCourse.course_name,
              course: course,
              section: studentSection,
              class: studenClass,
            };
            updatedStudentCourses.push(data);
        }
    }
    }});
    console.log(updatedStudentCourses);
    setStudentCourses(updatedStudentCourses);
  }, [refresh]);


  return (
    <div className="absolute w-[85%] flex flex-col text-sm p-10 justify-content items-center ">
      <table className="m-10 w-[1100px]">
        <thead>
          <th className="border border-gray-300 px-4 py-2 bg-grey">النتيجة</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">المجموع</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">النسبة</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            اعمال السنة
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">النسبة</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            الامتحان الانهائي
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">النسبة</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            الامتحان النصفي
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            اسم المجموعة
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            اسم المادة
          </th>
        </thead>
        <tbody>
          {studentCourses.map((course, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">
                {course.class?.result_publish ? course.course.pass : ''}
              </td>
              <td className="border border-gray-300 px-4 py-2  ">
                {course.class?.result_publish ? course.course.result : ''}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.class?.class_work}%
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.class?.class_work_publish
                  ? course.course.class_work
                  : ''}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.class?.final}%
              </td>
              <td className="border border-gray-300 px-4 py-2 flex justify-between items-center">
                {course.class?.final_publish ? course.course.final : ''}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.class?.midterm}%
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.class?.mid_publish ? course.course.midterm : ''}
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
