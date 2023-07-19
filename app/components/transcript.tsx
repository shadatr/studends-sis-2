'use client';
import React, { useEffect, useState } from 'react';
import {
  MajorRegType,
  StudenCourseGPAType,
  LetterGradesType,
  TranscriptType,
  PersonalInfoType,
  LettersType,
} from '@/app/types/types';
import axios from 'axios';

const Transcript = ({ user, majorId }: { user: number; majorId: number }) => {
  const [courses, setCourses] = useState<StudenCourseGPAType[]>([]);
  const [transcript, setTranscript] = useState<TranscriptType[]>([]);
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);
  const [studentInfo, setStudentInfo] = useState<PersonalInfoType[]>([]);
  const [majorCredit, setMajorCredit] = useState<number>();
  const [studentCredit, setStudentCredit] = useState<number>();
  const [letters, setLetters] = useState<LettersType[]>([]);
  const [points, setPoints] = useState<LettersType[]>([]);
  const [grades, setGrades] = useState<LettersType[]>([]);
  const [results, setResult] = useState<LettersType[]>([]);
  const [gpa, setGpa] = useState<LettersType[]>([]);

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

          const resp = await axios.get(`/api/personalInfo/student/${user}`);
          const message: PersonalInfoType[] = resp.data.message;
          setStudentInfo(message);

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

          setMajorCredit(messageMaj[0].credits_needed);

          setStudentCredit(majCredit?.student?.credits);

          const responseTranscript = await axios.get(`/api/transcript/${user}`);
          const messageTranscript: TranscriptType[] =
            responseTranscript.data.message;
          setTranscript(messageTranscript);

          const responsePoint = await axios.get(`/api/exams/grading/1`);
          const messagePoint: LettersType[] = responsePoint.data.message;
          setPoints(messagePoint);

          const responseLetter = await axios.get(`/api/exams/grading/3`);
          const messageLetter: LettersType[] = responseLetter.data.message;
          setLetters(messageLetter);

          const responseGrade = await axios.get(`/api/exams/grading/2`);
          const messageGrade: LettersType[] = responseGrade.data.message;
          setGrades(messageGrade);

          const responseResult = await axios.get(`/api/exams/grading/5`);
          const messageResult: LettersType[] = responseResult.data.message;
          setResult(messageResult);

          const responseGPA = await axios.get(`/api/exams/grading/6`);
          const messageGPA: LettersType[] = responseGPA.data.message;
          setGpa(messageGPA);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [majorId, user]);

  return (
    <div className="absolute w-[85%] flex flex-col p-10 justify-content items-center">
      <h1 className="bg-grey p-2 m-1">
        {studentInfo[0]?.can_graduate ? (
          <>{studentInfo[0].final_gpa}: المجموع النهائي</>
        ) : (
          ''
        )}
      </h1>
      <h1 className="bg-green-300 p-2 m-1">
        {majorCredit} :الكريدت المطلوبه لتخرج
      </h1>
      <h1 className="bg-blue-300 p-2 m-1">
        {studentCredit}: كريديت الطالب الحالية
      </h1>
      {transcript.map((tran, index) => (
        <table key={index} className="m-10 w-[600px]">
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
                النقاط
              </th>
              <th className="border border-gray-300 px-4 py-2 bg-grey flex flex-row w-full items-center justify-center">
                كريديت
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
                      {course.class?.publish_grades
                        ? course.courseEnrollements.pass
                          ? `${letter?.letter_grade} `
                          : `${letter?.letter_grade} `
                        : ''}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 flex flex-row w-full items-center justify-center">
                      {letter?.points}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 flex flex-row w-full items-center justify-center">
                      {course.course.credits}
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
      <div className=" w-[80%] items-center text-[10px] justify-center">
        <div className="w-[500px] flex flex-row m-3">
          <h1 className="w-20 p-2 bg-gray-200 border-2 border-black rounded-md ml-4">
            {gpa[0]?.AA}
          </h1>
          <h1 className="w-[130px] p-2 bg-gray-200 rounded-md ml-4 flex fex-end">
            :المجموع المطلوب لنجاح المشروط
          </h1>
        </div>

        <table className="w-[250px] h-[300px]">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 max-w-[120px] bg-grey">
                النقاط
              </th>
              <th className="border border-gray-300 px-4 py-2 max-w-[120px] bg-grey">
                الدرجة
              </th>
              <th className="border border-gray-300 px-4 py-2 max-w-[120px] bg-grey">
                الحرف
              </th>
              <th className="border border-gray-300 px-4 py-2 max-w-[120px] bg-grey">
                نجاح/رسوب
              </th>
            </tr>
          </thead>
          {points.map((point, index) => {
            const grade = grades.find((l) => l);
            const letter = letters.find((p) => p);
            const result = results.find((p) => p);
            return (
              <tbody key={index}>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    {point.AA || ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {grade?.AA}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {letter?.AA}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {result?.AA}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    {point.BA || ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {grade?.BA}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {letter?.BA}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {result?.BA}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    {point.BB || ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {grade?.BB}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {letter?.BB}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {result?.BB}
                  </td>
                </tr>
                <tr>
                  <td
                    className="border border-gray-300 px-4 py-2"
                    key={point.id}
                  >
                    {point.CB || ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {grade?.CB}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {letter?.CB}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {result?.CB}
                  </td>
                </tr>
                <tr>
                  <td
                    className="border border-gray-300 px-4 py-2"
                    key={point.id}
                  >
                    {point.CC || ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {grade?.CC}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {letter?.CC}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px] ">
                    {result?.CC}
                  </td>
                </tr>
                <tr>
                  <td
                    className="border border-gray-300 px-4 py-2"
                    key={point.id}
                  >
                    {point.DC || ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {grade?.DC}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {letter?.DC}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {result?.DC}
                  </td>
                </tr>
                <tr>
                  <td
                    className="border border-gray-300 px-4 py-2"
                    key={point.id}
                  >
                    {point.DD || ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {grade?.DD}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {letter?.DD}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {result?.DD}
                  </td>
                </tr>
                <tr>
                  <td
                    className="border border-gray-300 px-4 py-2"
                    key={point.id}
                  >
                    {point.FD || ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {grade?.FD}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {letter?.FD}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {result?.FD}
                  </td>
                </tr>
                <tr>
                  <td
                    className="border border-gray-300 px-4 py-2"
                    key={point.id}
                  >
                    {point.FF || 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {grade?.FF}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {letter?.FF}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                    {result?.FF}
                  </td>
                </tr>
              </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
};

export default Transcript;
