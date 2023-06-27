'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  AddCourse2Type,
  ExamProgramType,
  Section2Type,
  PersonalInfoType,
  ClassesType,
  StudentClassType,
  StudentCourse2Type,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';


const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [studentCourses, setStudentCourses] = useState<StudentCourse2Type[]>([]);
  const [sections, setSections] = useState<Section2Type[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<StudentClassType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [doctors, setDoctors] = useState<PersonalInfoType[]>([]);
  const [examProg, setExamProg] = useState<ExamProgramType[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseCourseEnroll = await axios.get(
          `/api/getAll/getCourseEnrollStudent/${user?.id}`
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

      const doctor = doctors.find((doc) => studenClass?.doctor_id == doc.id);

      const studentCourse = courses.find(
        (course) => course.id == studentSection?.course_id
      );

      if (studentCourse) {
          const data = {
            course: studentCourse,
            section: studentSection,
            doctor_name: doctor?.name,
          };
          updatedStudentCourses.push(data);
          console.log(updatedStudentCourses);
      }
    });

    setStudentCourses(updatedStudentCourses);
  }, [classes, courseEnrollments, courses, doctors, refresh, sections]);


 
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
            const selectcourse = studentCourses.find(
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
