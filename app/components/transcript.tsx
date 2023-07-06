'use client';
import React, { useEffect, useState } from 'react';
import {
  MajorRegType,
  StudenCourseGPAType,
  LetterGradesType,
  TranscriptType,
  MajorCourseType,
} from '@/app/types/types';
import axios from 'axios';

const Transcript = ({ user, majorId }: { user: number; majorId: number }) => {
  const [courses, setCourses] = useState<StudenCourseGPAType[]>([]);
  const [transcript, setTranscript] = useState<TranscriptType[]>([]);
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);
  const [majorCredit, setMajorCredit] = useState<number>();
  const [studentCredit, setStudentCredit] = useState<number>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const responseCourseLetter = await axios.get(
            `/api/exams/letterGrades`
          );
          const messageCourseLetter: LetterGradesType[] =
            responseCourseLetter.data.message;
          setCourseLetter(messageCourseLetter);

          const responseCourse = await axios.get(
            `/api/getAll/studentCoursesGpa/${user}`
          );

          const messageCourse: StudenCourseGPAType[] =
            responseCourse.data.message;
          setCourses(messageCourse);

          
          const majCredit = messageCourse.find((c) => c);
          
          const responseMaj = await axios.get(
            `/api/major/getSpecificMajor/${majorId}`
            );
            const messageMaj: MajorRegType[] = responseMaj.data.message;
            
          const messageMajCourse = await axios.get(
            `/api/course/courseMajorReg/${majorId}`
          );
          const responseCourseMaj: MajorCourseType[] =
            messageMajCourse.data.message;

          setMajorCredit(messageMaj[0].credits_needed);

          setStudentCredit(majCredit?.student?.credits);

          const responseTranscript = await axios.get(`/api/transcript/${user}`);
          const messageTranscript: TranscriptType[] =
            responseTranscript.data.message;
          setTranscript(messageTranscript);

          if (messageTranscript && messageCourseLetter && messageCourse) {
            const enrollmentsData = messageTranscript.filter(
              (item) => item.student_id == user
            );
            const maxId = enrollmentsData.reduce(
              (max, { id }) => Math.max(max, id),
              0
            );

            let studentTotalCredits = 0;
            messageCourseLetter.map((item) => {
              const selectedCourse = messageCourse.find(
                (course) =>
                  item.course_enrollment_id === course.courseEnrollements.id &&
                  item.repeated == false 
              );
              if (selectedCourse?.course.credits) {
                studentTotalCredits += selectedCourse?.course.credits;
              }
            });

            const graduationYear = messageTranscript?.find(
              (item) => item.id == maxId
            );

            const graduation = messageCourse.find((item) => item.major?.id);

            let isGraduated = false;

            if (
              graduation?.major.credits_needed &&
              studentTotalCredits >= graduation?.major.credits_needed
            ) {
              isGraduated = true;
            }

            responseCourseMaj.map((majCo) => {
              const selecetedCourse = courses.find(
                (c) =>
                  c.course.id == majCo.course_id && c.courseEnrollements.pass
              );
              if (selecetedCourse == undefined && majCo.isOptional == false) {
                isGraduated = false;
              }
            });

            const data = {
              credits: studentTotalCredits,
              student_id: user,
              graduation: isGraduated,
              graduation_year: graduationYear?.semester,
            };


            axios.post('/api/transcript/editCredits', data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [majorId, user]);
            

  return (
    <div className="absolute w-[85%] flex flex-col p-10 justify-content items-center">
      <h1 className="bg-green-300 p-2 m-1">
        {majorCredit} :الكريدت المطلوبه لتخرج
      </h1>
      <h1 className="bg-blue-300 p-2 m-1">
        {studentCredit}: كريديت الطالب الحالية
      </h1>
      {transcript.map((tran, index) => (
        <table key={index} className="m-10 w-[500px]">
          <thead>
            <tr>
              <th className="flex justify-center items-center text-sm bg-darkBlue text-secondary">
                {tran.semester}
              </th>
            </tr>
            <tr className="flex flex-row w-full">
              <th className="border border-gray-300 px-4 py-2 bg-grey flex flex-row w-full items-center justify-center">
                النتيجة
              </th>

              <th className="border border-gray-300 px-4 py-2 bg-grey flex flex-row w-full items-center justify-center">
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
                      className={`border border-gray-300 px-4 py-2 flex flex-row w-full items-center justify-center ${
                        course.courseEnrollements.pass
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-red-500 hover:text-red-600'
                      }`}
                    >
                      {course.class?.result_publish
                        ? course.courseEnrollements.pass
                          ? `${letter?.letter_grade} `
                          : `${letter?.letter_grade} `
                        : ''}
                    </td>

                    <td className="border border-gray-300 px-4 py-2 flex flex-row w-full items-center justify-center">
                      {course.course.course_name}
                    </td>
                  </tr>
                );
              } else {
                return null;
              }
            })}
            <tr className="">
              <td className="flex justify-center items-center text-sm bg-grey">
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
