'use client';
import React, { useEffect, useState } from 'react';
import { AddCourse2Type, ClassesType, RegisterStudent2Type, SectionType, StudentClassType, StudentCourseType, TranscriptType } from '@/app/types/types';
import axios from 'axios';

const semesters: string[] = [
  ' الفصل الدراسي الاول',
  ' الفصل الدراسي الثاني',
  ' الفصل الدراسي الثالث',
  ' الفصل الدراسي الرابع',
  '  الفصل الدراسي الخامس',
  ' الفصل الدراسي السادس',
  ' الفصل الدراسي السابع',
  'الفصل الدراسي الثامن',
];


const Transcript = ({ user }: { user: number }) => {
  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [studentCourses, setStudentCourses] = useState<StudentCourseType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<StudentClassType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [semester, setSemester] = useState<number>();
const [transcript, setTranscript] = useState<TranscriptType[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseStudent = await axios.get(
          `/api/personalInfo/student/${user}`
        );
        const messageStudent: RegisterStudent2Type[] =
          responseStudent.data.message;
        setSemester(messageStudent[0].semester);


        const responseTranscript = await axios.get(
          `/api/transcript/${user}`
        );
        const messageTranscript: TranscriptType[] =
        responseTranscript.data.message;
        setTranscript(messageTranscript);


        const responseCourseEnroll = await axios.get(
          `/api/getAll/getAllCourseEnroll/${user}`
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

      if (studentCourse) {
        if (course.approved) {
          {
            const data = {
              course_name: studentCourse.course_name,
              course: course,
              section: studentSection,
              class: studenClass,
            };
            updatedStudentCourses.push(data);
          }
        }
      }
    });
    console.log(updatedStudentCourses);
    setStudentCourses(updatedStudentCourses);
  }, [refresh]);

  return (
    <div className="absolute w-[85%] flex flex-col p-10 justify-content items-center">
      {Array.from({ length: semester || 0 }).map((_, index) => {
        const trans = transcript.find((tran) => tran.semester === index+1);
        return (
          <table key={index} className="m-10 w-[500px]">
            <thead>
              <tr>
                <th className="flex justify-center items-center text-sm bg-darkBlue text-secondary">
                  {semesters[index]}
                </th>
              </tr>
              <tr className="flex flex-row w-full">
                <th className="border border-gray-300 px-4 py-2 bg-grey flex flex-row w-full items-center justify-center">
                  النتيجة
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-grey flex flex-row w-full items-center justify-center">
                  المجموع
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-grey flex flex-row w-full items-center justify-center">
                  اسم المادة
                </th>
              </tr>
            </thead>

            <tbody>
              {studentCourses.map((course, courseIndex) => {
                if (course?.course.semester === index + 1) {
                  return (
                    <tr className="flex flex-row w-full" key={courseIndex}>
                      <td
                        className={`border border-gray-300 px-4 py-2 flex flex-row w-full items-center justify-center ${
                          course.course.pass
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-red-500 hover:text-red-600'
                        }`}
                      >
                        {course.class?.result_publish
                          ? course.course.pass
                            ? 'ناجح'
                            : 'راسب'
                          : ''}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 flex flex-row w-full items-center justify-center">
                        {course.class?.result_publish
                          ? course.course.result
                          : ''}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 flex flex-row w-full items-center justify-center">
                        {course.course_name}
                      </td>
                    </tr>
                  );
                } else {
                  return null;
                }
              })}
              <tr className="">
                <td className="flex justify-center items-center text-sm bg-grey">
                  {trans?.gpa} :المجموع
                </td>
              </tr>
            </tbody>
          </table>
        );
      })}
    </div>
  );

        };

export default Transcript;
