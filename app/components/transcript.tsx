'use client';
import React, { useEffect, useState } from 'react';
import {
  StudenCourseGPAType,
  LetterGradesType,
  TranscriptType,
  PersonalInfoType,
  DepartmentRegType
} from '@/app/types/types';
import axios from 'axios';

const Transcript = ({ user, majorId }: { user: number; majorId: number }) => {
  const [courses, setCourses] = useState<StudenCourseGPAType[]>([]);
  const [transcript, setTranscript] = useState<TranscriptType[]>([]);
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);
  const [studentInfo, setStudentInfo] = useState<PersonalInfoType[]>([]);
  const [majorCredit, setMajorCredit] = useState<number>();
  const [studentCredit, setStudentCredit] = useState<number>();

 useEffect(() => {
   const fetchData = async () => {
     try {
       if (user) {
         const responseCourseLetter = await axios.get(
           '/api/exams/letterGrades'
         );
         const messageCourseLetter = responseCourseLetter.data.message;
         setCourseLetter(messageCourseLetter);

         const resp = await axios.get(`/api/personalInfo/student/${user}`);
         const message1 = resp.data.message;
         setStudentInfo(message1);

         axios.get('/api/department/departmentRegister').then(async (resp) => {
           const message:DepartmentRegType[] = resp.data.message;
           const responseMaj = await axios.get(
             `/api/major/getSpecificMajor/${majorId}`
           );
           const messageMaj = responseMaj.data.message;

           const dep = message.find((i) => i.id === message1[0].department_id);

           if (messageMaj[0]?.credits_needed && dep?.credits_needed !== null) {
             setMajorCredit(
               messageMaj[0]?.credits_needed + dep?.credits_needed
             );
           }
         });

         const responseCourse = await axios.get(
           `/api/getAll/studentCoursesGpa/${user}`
         );
         const messageCourse: StudenCourseGPAType []= responseCourse.data.message;
         setCourses(messageCourse);

         const majCredit = messageCourse.find((c) => c);

         setStudentCredit(majCredit?.student?.credits);

         const responseTranscript = await axios.get(
           `/api/transcript/${user}`
         );
         const messageTranscript = responseTranscript.data.message;
         setTranscript(messageTranscript);
       }
     } catch (error) {
       console.error('Error fetching data:', error);
     }
   };

   fetchData();
 }, [majorId, user]);


  return (
    <div className="absolute lg:w-[85%] sm:w-[100%] flex flex-col p-10 justify-content items-center lg:text-[16px] sm:text-[8px]">
      <h1 className="bg-grey p-2 m-1">
        {studentInfo[0]?.final_gpa}: المجموع النهائي
      </h1>
      <h1 className="bg-green-300 p-2 m-1">
        {majorCredit} :الكريدت المطلوبه لتخرج
      </h1>
      <h1 className="bg-blue-300 p-2 m-1">
        {studentCredit}: كريديت الطالب الحالية
      </h1>
      {transcript.map((tran, index) => (
        <table key={index} className="lg:m-10 lg:w-[600px] sm:w-[300px]">
          <thead>
            <tr>
              <th className="flex justify-center items-center lg:text-sm sm:text-[8px] bg-darkBlue text-secondary">
                {tran.semester}
              </th>
            </tr>
            <tr className="flex flex-row w-full">
              <th className="border border-gray-300 lg:px-4 lg:py-2 p-1 bg-grey flex flex-row w-full items-center justify-center">
                النتيجة
              </th>
              <th className="border border-gray-300 lg:px-4 lg:py-2 p-1 bg-grey flex flex-row w-full items-center justify-center">
                النقاط
              </th>
              <th className="border border-gray-300 lg:px-4 lg:py-2 p-1 bg-grey flex flex-row w-full items-center justify-center">
                كريديت
              </th>
              <th className="border border-gray-300 lg:px-4 lg:py-2 p-1 bg-grey flex flex-row w-full items-center justify-center">
                اسم المادة
              </th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course, courseIndex) => {
              const letter = courseLetter.find(
                (item) =>
                  item.course_enrollment_id === course.courseEnrollements.id
              );
              if (course?.class.semester === tran.semester) {
                return (
                  <tr
                    className={`flex flex-row w-full ${
                      letter?.repeated ? 'text-blue-600 line-through' : ''
                    }`}
                    key={courseIndex}
                  >
                    <td
                      className={`border border-gray-300 lg:px-4 lg:py-2 p-1 flex flex-row w-full items-center justify-center ${
                        course.courseEnrollements.pass
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-red-500 hover:text-red-600'
                      }`}
                    >
                      {course.class?.publish_grades
                        ? course.courseEnrollements.pass
                          ? `${letter?.letter_grade} `
                          : `${letter?.letter_grade} `
                        : ''}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 p-1 flex flex-row w-full items-center justify-center">
                      {letter?.points}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 p-1 flex flex-row w-full items-center justify-center">
                      {course.course.credits}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 p-1 flex flex-row w-full items-center justify-center">
                      {course.course.course_name}
                    </td>
                  </tr>
                );
              } else {
                return null;
              }
            })}
            <tr className="">
              <td className="flex justify-center items-center lg:text-sm bg-grey">
                {tran.gpa} :المجموع
              </td>
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  );
};

export default Transcript;
