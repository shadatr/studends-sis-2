'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {
  AddCourse2Type,
  ClassesType,
  PersonalInfoType,
  Section2Type,
  StudentClassType,
  StudentCourse2Type,
} from '@/app/types/types';

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    throw new Error('Unauthorized');
  }

  const user = session.data?.user;

  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [studentCourses, setStudentCourses] = useState<StudentCourse2Type[]>([]);
  const [sections, setSections] = useState<Section2Type[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<StudentClassType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [doctors, setDoctors] = useState<PersonalInfoType[]>([]);


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

        console.log(classes);
        const docPromises = classes.map(async (Class) => {
          const responseReq = await axios.get(
            `/api/personalInfo/doctor/${Class.doctor_id}`
          );
          const { message: docMessage }: { message: PersonalInfoType[] } =
            responseReq.data;
          return docMessage;
        });

        const docData = await Promise.all(docPromises);
        const doctors = docData.flat();
        setDoctors(doctors);



        const sectionsPromises = classes.map(async (course) => {
          const responseReq = await axios.get(
            `/api/getAll/getSpecificSection/${course.section_id}`
          );
          const { message: secMessage }: { message: Section2Type[] } =
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
    const updatedStudentCourses: StudentCourse2Type[] = [];

    courseEnrollments.map((course) => {
      const studenClass = classes.find((Class) => Class.id == course.class_id);

      const studentSection = sections.find(
        (sec) => sec.id == studenClass?.section_id
      );

      const doctor= doctors.find((doc) => studenClass?.doctor_id == doc.id);

      const studentCourse = courses.find(
        (course) => course.id == studentSection?.course_id
      );

      if (studentCourse) {
        if (course.approved) {
          const data = {
            course: studentCourse,
            section: studentSection,
            doctor_name: doctor?.name
          };
          updatedStudentCourses.push(data);
          console.log(updatedStudentCourses);
        }
      }
    });
    
    setStudentCourses(updatedStudentCourses);
  }, [classes, courseEnrollments, courses, doctors, refresh, sections]);

  return (
    <div className="absolute w-[80%] flex flex-col text-sm p-10 justify-content items-center ">
      <table className="w-[900px] m-10">
        <thead>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            درجة النجاح
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">الكريدت</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            عدد الساعات
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">الدكتور</th>
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
                {course.course?.passing_percentage}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.course?.credits}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.course?.hours}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.doctor_name}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.section?.name}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.course?.course_name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
