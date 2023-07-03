'use client';
import React, { useEffect, useState } from 'react';
import { StudenCourseType, LetterGradesType, TranscriptType } from '@/app/types/types';
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
  const [courses, setCourses] = useState<StudenCourseType[]>([]);
  const [transcript, setTranscript] = useState<TranscriptType[]>([]);
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseCourseLetter = await axios.get(`/api/exams/letterGrades`);
        const messageCourseLetter: LetterGradesType[] =
          responseCourseLetter.data.message;
        setCourseLetter(messageCourseLetter);

        const responseCourse = await axios.get(
          `/api/getAll/studentCoursesGpa/${user}`
        );

        const messageCourse: StudenCourseType[] = responseCourse.data.message;
        setCourses(messageCourse);

        const responseTranscript = await axios.get(
          `/api/transcript/${user}`
        );
        const messageTranscript: TranscriptType[] =
        responseTranscript.data.message;
        setTranscript(messageTranscript);


        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);


  return (
    <div className="absolute w-[85%] flex flex-col p-10 justify-content items-center">
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
                  <tr className="flex flex-row w-full" key={courseIndex}>
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
