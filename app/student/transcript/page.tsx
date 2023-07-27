'use client';

import React, { useEffect, useState } from 'react';
import Transcript from '@/app/components/transcript';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { LettersType } from '@/app/types/types';
import axios from 'axios';

const Page = () => {
  const session = useSession({ required: true });
  // if the user isn't an admin, throw an error
  if (session.data?.user ? session.data?.user?.userType !== 'student' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [letters, setLetters] = useState<LettersType[]>([]);
  const [points, setPoints] = useState<LettersType[]>([]);
  const [grades, setGrades] = useState<LettersType[]>([]);
  const [results, setResult] = useState<LettersType[]>([]);
  const [gpa, setGpa] = useState<LettersType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div>
      <div className=" w-[80%] items-center text-[10px] justify-center absolute">
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
      {user?.major && <Transcript majorId={user?.major} user={user?.id} />}
    </div>
  );
};

export default Page;
